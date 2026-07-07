// Timetable Management Functions
var API_URL = API_URL || 'http://localhost:5000/api';
let currentTimetableEntries = [];

// Initialize timetable view
async function initTimetableView() {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (user.role === 'admin') {
        await loadAdminTimetable();
    } else if (user.role === 'lecturer') {
        await loadLecturerTimetableView();
    } else if (user.role === 'student') {
        await loadStudentTimetableView();
    }
}

// Admin Timetable Functions
async function loadAdminTimetable() {
    const container = document.getElementById('timetableContainer');
    if (!container) return;
    
    try {
        const response = await fetch(`${API_URL}/timetable`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        
        if (data.success) {
            currentTimetableEntries = data.data || [];
            displayTimetable(data.data, container);
        } else {
            container.innerHTML = '<p class="alert-error">Failed to load timetable</p>';
        }
    } catch (error) {
        console.error('Error loading timetable:', error);
        container.innerHTML = '<p class="alert-error">Error loading timetable</p>';
    }
}

// Lecturer Timetable View
async function loadLecturerTimetableView() {
    const container = document.getElementById('timetableContainer');
    if (!container) return;
    
    try {
        const response = await fetch(`${API_URL}/dashboard/lecturer-timetable`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        
        if (data.success) {
            currentTimetableEntries = data.data || [];
            displayTimetable(data.data, container);
        } else {
            container.innerHTML = '<p class="alert-error">Failed to load your timetable</p>';
        }
    } catch (error) {
        console.error('Error loading lecturer timetable:', error);
        container.innerHTML = '<p class="alert-error">Error loading timetable</p>';
    }
}

// Student Timetable View
async function loadStudentTimetableView() {
    const container = document.getElementById('timetableContainer');
    if (!container) return;
    
    // For demo, show all timetable entries
    // In production, filter by student's level/department
    try {
        const response = await fetch(`${API_URL}/timetable`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        
        if (data.success) {
            currentTimetableEntries = data.data || [];
            displayTimetable(data.data, container);
        } else {
            container.innerHTML = '<p class="alert-error">Failed to load your timetable</p>';
        }
    } catch (error) {
        console.error('Error loading student timetable:', error);
        container.innerHTML = '<p class="alert-error">Error loading timetable</p>';
    }
}

// Display Timetable in Beautiful Template Format
async function displayTimetable(entries, container) {
    if (!entries || entries.length === 0) {
        container.innerHTML = `
            <div class="timetable-template-wrapper">
                <div class="timetable-template-container">
                    <div class="timetable-main-container" style="text-align: center; padding: var(--spacing-12);">
                        <i class="fas fa-calendar-times" style="font-size: 3rem; color: var(--text-muted); margin-bottom: var(--spacing-4);"></i>
                        <h3>No timetable entries found</h3>
                        <p style="color: var(--text-secondary);">Start by adding courses to the timetable.</p>
                        <button class="btn btn-primary" style="margin-top: var(--spacing-6);" onclick="showCreateTimetableModal()">+ Add Entry</button>
                    </div>
                </div>
            </div>
        `;
        return;
    }
    
    // Get institution name
    let institutionName = 'Landmark Metropolitan University';
    try {
        const schoolResponse = await fetch(`${API_URL}/schools`, {
            headers: getAuthHeaders()
        });
        const schoolData = await schoolResponse.json();
        if (schoolData.success && schoolData.data && schoolData.data.length > 0) {
            institutionName = schoolData.data[0].name;
        }
    } catch (error) {
        console.error('Error loading school info:', error);
    }
    
    // Group by day of week
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const timetableByDay = {};
    daysOfWeek.forEach(day => {
        timetableByDay[day] = entries.filter(entry => entry.day_of_week === day);
    });

    const parseTimeValue = (time) => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    };

    const timeSlots = Array.from(new Set(entries.map(entry => `${entry.start_time} - ${entry.end_time}`)));
    timeSlots.sort((a, b) => parseTimeValue(a.split(' - ')[0]) - parseTimeValue(b.split(' - ')[0]));

    // Extract unique levels/groups for reading groups panel
    const uniqueLevels = [...new Set(entries.map(e => e.level_number || e.level || 'N/A'))].sort();
    const readingGroupColors = {
        'B': '#3B82F6', 'R': '#10B981', 'E': '#F59E0B', 'A': '#8B5CF6', 'K': '#EC4899'
    };
    
    // Color mapping for courses
    const colorClasses = ['course-color-1', 'course-color-2', 'course-color-3', 'course-color-4', 'course-color-5', 'course-color-6'];
    
    // Generate course cards HTML
    const getCourseCardHTML = (entry, index) => {
        const colorClass = colorClasses[index % colorClasses.length];
        return `
            <div class="timetable-course-card ${colorClass}" onclick="showEditTimetableModal(${entry.id})">
                <div class="course-code-timetable">${entry.course_code}</div>
                <div class="course-name-timetable">${entry.course_name || 'Course'}</div>
                <div class="course-lecturer-timetable">${entry.lecturer_name || 'TBD'}</div>
                <div class="course-room-timetable">${entry.room_number || 'Room TBD'}</div>
            </div>
        `;
    };
    
    // Build grid HTML
    let gridHTML = '<div class="timetable-grid-container">';
    
    // Header row
    gridHTML += '<div class="timetable-cell timetable-time-header"></div>';
    daysOfWeek.forEach(day => {
        gridHTML += `<div class="timetable-cell timetable-day-header">${day.toUpperCase()}</div>`;
    });
    
    // Time slot rows
    let cardIndex = 0;
    timeSlots.forEach(slot => {
        gridHTML += `<div class="timetable-cell timetable-time-cell">${slot}</div>`;
        daysOfWeek.forEach(day => {
            const rowEntries = (timetableByDay[day] || []).filter(e => `${e.start_time} - ${e.end_time}` === slot);
            if (rowEntries.length > 0) {
                gridHTML += '<div class="timetable-cell timetable-filled-cell">';
                rowEntries.forEach(entry => {
                    gridHTML += getCourseCardHTML(entry, cardIndex++);
                });
                gridHTML += '</div>';
            } else {
                gridHTML += '<div class="timetable-cell timetable-empty-cell"></div>';
            }
        });
    });
    
    gridHTML += '</div>';
    
    // Build reading groups HTML
    let readingGroupHTML = '<ul class="reading-group-list">';
    uniqueLevels.forEach((level, i) => {
        const levelLetter = String.fromCharCode(66 + (i % 5)); // B, R, E, A, K
        const levelColor = Object.values(readingGroupColors)[i % 5];
        readingGroupHTML += `
            <li class="reading-group-item" style="border-left-color: ${levelColor};">
                <div class="reading-group-item-code">${levelLetter}</div>
                <div class="reading-group-item-label">Level ${level}</div>
            </li>
        `;
    });
    readingGroupHTML += '</ul>';

    const currentDate = new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    const currentTime = new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true 
    });

    container.innerHTML = `
        <div class="timetable-template-wrapper">
            <div class="timetable-template-container">
                <!-- Header Section -->
                <div class="timetable-header-section">
                    <div class="timetable-logo-area">
                        <div class="timetable-logo-icon">
                            <i class="fas fa-university"></i>
                        </div>
                    </div>
                    <div class="timetable-institution-name">${institutionName}</div>
                </div>
                
                <!-- Main Container -->
                <div class="timetable-main-container">
                    <!-- Title Banner -->
                    <div class="timetable-title-banner">
                        <div class="timetable-title-text">
                            <h1>TIMETABLE</h1>
                            <div class="timetable-subtitle">Academic Schedule</div>
                        </div>
                        <div class="timetable-meta-info">
                            <div>📅 ${currentDate}</div>
                            <div>🕐 ${currentTime}</div>
                        </div>
                    </div>
                    
                    <!-- Controls Bar -->
                    <div class="timetable-controls-bar">
                        <div class="timetable-filter-group">
                            <span class="timetable-filter-label">Filter By:</span>
                            <select id="filterLevel" class="timetable-filter-select" onchange="filterTimetableByLevel()">
                                <option value="">All Levels</option>
                            </select>
                            <select id="filterDepartment" class="timetable-filter-select" onchange="filterTimetableByDepartment()">
                                <option value="">All Departments</option>
                            </select>
                        </div>
                        <div class="timetable-action-buttons">
                            <button class="timetable-action-btn" onclick="exportTimetableToPDF()">
                                <i class="fas fa-file-pdf"></i> PDF
                            </button>
                            <button class="timetable-action-btn" onclick="printTimetable()">
                                <i class="fas fa-print"></i> Print
                            </button>
                            <button class="timetable-action-btn" onclick="showCreateTimetableModal()" style="background: var(--primary); color: white; border-color: var(--primary);">
                                <i class="fas fa-plus"></i> Add Entry
                            </button>
                        </div>
                    </div>
                    
                    <!-- Timetable Grid and Reading Groups -->
                    <div class="timetable-layout-flex">
                        <div class="timetable-grid-wrapper" id="timetableExportable">
                            ${gridHTML}
                        </div>
                        
                        <div class="timetable-reading-group-panel">
                            <div class="reading-group-header">
                                <i class="fas fa-layer-group"></i>
                                Reading Groups
                            </div>
                            ${readingGroupHTML}
                        </div>
                    </div>
                    
                    <!-- Legend -->
                    <div class="timetable-legend">
                        <div class="legend-title">Color Legend</div>
                        <div class="legend-grid">
                            <div class="legend-item">
                                <div class="legend-color-box" style="background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%); border-color: #3B82F6;"></div>
                                <span class="legend-text">Laboratory Sessions</span>
                            </div>
                            <div class="legend-item">
                                <div class="legend-color-box" style="background: linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%); border-color: #10B981;"></div>
                                <span class="legend-text">Lectures & Seminars</span>
                            </div>
                            <div class="legend-item">
                                <div class="legend-color-box" style="background: linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%); border-color: #F59E0B;"></div>
                                <span class="legend-text">Practical Classes</span>
                            </div>
                            <div class="legend-item">
                                <div class="legend-color-box" style="background: linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%); border-color: #8B5CF6;"></div>
                                <span class="legend-text">Special Sessions</span>
                            </div>
                            <div class="legend-item">
                                <div class="legend-color-box" style="background: linear-gradient(135deg, #FCE7F3 0%, #FBCFE8 100%); border-color: #EC4899;"></div>
                                <span class="legend-text">Guest Lectures</span>
                            </div>
                            <div class="legend-item">
                                <div class="legend-color-box" style="background: linear-gradient(135deg, #ECFDFD 0%, #CFFAFE 100%); border-color: #06B6D4;"></div>
                                <span class="legend-text">Workshops</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Footer Info -->
                    <div class="timetable-footer-info">
                        <div class="timetable-info-item">
                            <div class="timetable-info-icon"><i class="fas fa-book"></i></div>
                            <span><strong>${entries.length}</strong> Total Classes</span>
                        </div>
                        <div class="timetable-info-item">
                            <div class="timetable-info-icon"><i class="fas fa-users"></i></div>
                            <span><strong>${uniqueLevels.length}</strong> Academic Levels</span>
                        </div>
                        <div class="timetable-info-item">
                            <div class="timetable-info-icon"><i class="fas fa-clock"></i></div>
                            <span><strong>${timeSlots.length}</strong> Time Slots</span>
                        </div>
                        <div class="timetable-info-item">
                            <div class="timetable-info-icon"><i class="fas fa-door-open"></i></div>
                            <span><strong>${[...new Set(entries.map(e => e.room_id))].length}</strong> Rooms in Use</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Load filters
    loadFilterOptions();
}

// Load filter dropdown options
async function loadFilterOptions() {
    try {
        // Load levels
        const levelsResponse = await fetch(`${API_URL}/dashboard/levels`, {
            headers: getAuthHeaders()
        });
        const levelsData = await levelsResponse.json();
        
        if (levelsData.success) {
            const levelFilter = document.getElementById('filterLevel');
            if (levelFilter) {
                levelsData.data.forEach(level => {
                    const option = document.createElement('option');
                    option.value = level.id;
                    option.textContent = level.name;
                    levelFilter.appendChild(option);
                });
            }
        }
        
        // Load departments
        const deptResponse = await fetch(`${API_URL}/dashboard/departments`, {
            headers: getAuthHeaders()
        });
        const deptData = await deptResponse.json();
        
        if (deptData.success) {
            const deptFilter = document.getElementById('filterDepartment');
            if (deptFilter) {
                deptData.data.forEach(dept => {
                    const option = document.createElement('option');
                    option.value = dept.id;
                    option.textContent = dept.name;
                    deptFilter.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.error('Error loading filters:', error);
    }
}

// Filter timetable by level
async function filterTimetableByLevel() {
    const levelId = document.getElementById('filterLevel').value;
    const container = document.getElementById('timetableContainer');
    
    if (!levelId) {
        await loadAdminTimetable();
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/timetable/level/${levelId}`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        
        if (data.success) {
            displayTimetable(data.data, container);
        }
    } catch (error) {
        console.error('Error filtering by level:', error);
    }
}

// Filter timetable by department
async function filterTimetableByDepartment() {
    const departmentId = document.getElementById('filterDepartment').value;
    const container = document.getElementById('timetableContainer');
    
    if (!departmentId) {
        await loadAdminTimetable();
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/timetable/department/${departmentId}`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        
        if (data.success) {
            displayTimetable(data.data, container);
        }
    } catch (error) {
        console.error('Error filtering by department:', error);
    }
}

// Create Timetable Entry Modal
function showCreateTimetableModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'timetableModal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <span class="close">&times;</span>
            <h2>Add Timetable Entry</h2>
            <form id="createTimetableForm">
                <div class="form-group">
                    <label for="course_id">Course *</label>
                    <select id="course_id" required>
                        <option value="">Select Course</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="lecturer_id">Lecturer *</label>
                    <select id="lecturer_id" required>
                        <option value="">Select Lecturer</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="room_id">Room *</label>
                    <select id="room_id" required>
                        <option value="">Select Room</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="level_id">Level *</label>
                    <select id="level_id" required>
                        <option value="">Select Level</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="time_slot_id">Time Slot *</label>
                    <select id="time_slot_id" required>
                        <option value="">Select Time Slot</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="academic_year">Academic Year</label>
                    <input type="text" id="academic_year" value="2024" required>
                </div>
                
                <div class="form-group">
                    <label for="semester">Semester</label>
                    <select id="semester">
                        <option value="1">Semester 1</option>
                        <option value="2">Semester 2</option>
                    </select>
                </div>
                
                <div id="conflictWarning" class="conflict-message" style="display: none;"></div>
                
                <div class="form-actions">
                    <button type="submit" class="btn-primary">Create Entry</button>
                    <button type="button" onclick="checkConflicts()" class="btn-secondary">Check Conflicts</button>
                    <button type="button" onclick="closeModal()" class="btn-secondary">Cancel</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
    
    // Load dropdown data
    loadCoursesForTimetable();
    loadLecturersForTimetable();
    loadRoomsForTimetable();
    loadLevelsForTimetable();
    loadTimeSlotsForTimetable();
    
    // Close button
    const closeBtn = modal.querySelector('.close');
    closeBtn.onclick = () => closeModal();
    
    // Form submission
    const form = document.getElementById('createTimetableForm');
    form.onsubmit = async (e) => {
        e.preventDefault();
        await createTimetableEntry();
    };
}

// Load courses for timetable modal
async function loadCoursesForTimetable() {
    try {
        const response = await fetch(`${API_URL}/courses`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        
        if (data.success) {
            const select = document.getElementById('course_id');
            data.data.forEach(course => {
                const option = document.createElement('option');
                option.value = course.id;
                option.textContent = `${course.course_code} - ${course.course_name}`;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading courses:', error);
    }
}

// Load lecturers for timetable modal
async function loadLecturersForTimetable() {
    try {
        const response = await fetch(`${API_URL}/lecturers`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        
        if (data.success) {
            const select = document.getElementById('lecturer_id');
            data.data.forEach(lecturer => {
                const option = document.createElement('option');
                option.value = lecturer.id;
                option.textContent = `${lecturer.full_name} (${lecturer.employee_id})`;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading lecturers:', error);
    }
}

// Load rooms for timetable modal
async function loadRoomsForTimetable() {
    try {
        const response = await fetch(`${API_URL}/rooms`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        
        if (data.success) {
            const select = document.getElementById('room_id');
            data.data.forEach(room => {
                const option = document.createElement('option');
                option.value = room.id;
                option.textContent = `${room.room_number} (${room.building}) - Capacity: ${room.capacity}`;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading rooms:', error);
    }
}

// Load levels for timetable modal
async function loadLevelsForTimetable() {
    try {
        const response = await fetch(`${API_URL}/dashboard/levels`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        
        if (data.success) {
            const select = document.getElementById('level_id');
            data.data.forEach(level => {
                const option = document.createElement('option');
                option.value = level.id;
                option.textContent = level.name;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading levels:', error);
    }
}

// Load time slots for timetable modal
async function loadTimeSlotsForTimetable() {
    try {
        const response = await fetch(`${API_URL}/dashboard/timeslots`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        
        if (data.success) {
            const select = document.getElementById('time_slot_id');
            data.data.forEach(slot => {
                const option = document.createElement('option');
                option.value = slot.id;
                option.textContent = `${slot.day_of_week} - ${slot.start_time} to ${slot.end_time}`;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading time slots:', error);
    }
}

// Check for conflicts before creating
async function checkConflicts() {
    const entryData = {
        course_id: parseInt(document.getElementById('course_id').value),
        lecturer_id: parseInt(document.getElementById('lecturer_id').value),
        room_id: parseInt(document.getElementById('room_id').value),
        level_id: parseInt(document.getElementById('level_id').value),
        time_slot_id: parseInt(document.getElementById('time_slot_id').value),
        academic_year: document.getElementById('academic_year').value,
        semester: parseInt(document.getElementById('semester').value)
    };
    
    // Validate all fields are selected
    if (!entryData.course_id || !entryData.lecturer_id || !entryData.room_id || 
        !entryData.level_id || !entryData.time_slot_id) {
        showConflictWarning('Please fill in all required fields');
        return;
    }
    
    try {
        // Attempt to create (will return conflict if any)
        const response = await fetch(`${API_URL}/timetable`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(entryData)
        });
        
        const data = await response.json();
        
        if (!data.success && data.conflicts) {
            showConflictWarning(`Conflicts Detected:<br>${data.conflicts.join('<br>')}`);
        } else if (data.success) {
            showConflictWarning('No conflicts detected! You can save this entry.', 'success');
        } else {
            showConflictWarning(data.message);
        }
    } catch (error) {
        console.error('Error checking conflicts:', error);
        showConflictWarning('Error checking conflicts. Please try again.');
    }
}

// Show conflict warning message
function showConflictWarning(message, type = 'error') {
    const warningDiv = document.getElementById('conflictWarning');
    warningDiv.style.display = 'block';
    warningDiv.innerHTML = message;
    warningDiv.className = type === 'success' ? 'alert-success' : 'conflict-message';
    
    setTimeout(() => {
        if (warningDiv) {
            warningDiv.style.display = 'none';
        }
    }, 5000);
}

// Create timetable entry
async function createTimetableEntry() {
    const entryData = {
        course_id: parseInt(document.getElementById('course_id').value),
        lecturer_id: parseInt(document.getElementById('lecturer_id').value),
        room_id: parseInt(document.getElementById('room_id').value),
        level_id: parseInt(document.getElementById('level_id').value),
        time_slot_id: parseInt(document.getElementById('time_slot_id').value),
        academic_year: document.getElementById('academic_year').value,
        semester: parseInt(document.getElementById('semester').value)
    };
    
    try {
        const response = await fetch(`${API_URL}/timetable`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(entryData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Timetable entry created successfully!');
            closeModal();
            // Refresh timetable display
            if (typeof loadAdminTimetable === 'function') {
                await loadAdminTimetable();
            }
            if (typeof loadTimetable === 'function') {
                await loadTimetable();
            }
        } else if (data.conflicts) {
            showConflictWarning(`Cannot save due to conflicts:<br>${data.conflicts.join('<br>')}`);
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error creating timetable entry:', error);
        alert('Error creating timetable entry');
    }
}

// Delete timetable entry
async function deleteTimetableEntry(id) {
    if (!confirm('Are you sure you want to delete this timetable entry?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/timetable/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Timetable entry deleted successfully');
            // Refresh the view
            if (getUserRole() === 'admin') {
                await loadAdminTimetable();
            } else if (getUserRole() === 'lecturer') {
                await loadLecturerTimetableView();
            } else {
                await loadStudentTimetableView();
            }
        } else {
            alert('Error deleting entry: ' + data.message);
        }
    } catch (error) {
        console.error('Error deleting timetable entry:', error);
        alert('Error deleting timetable entry');
    }
}

// Export timetable to PDF (simplified version)
async function ensurePdfLibrary() {
    if (window.jspdf && window.jspdf.jsPDF) {
        return window.jspdf.jsPDF;
    }

    return new Promise((resolve, reject) => {
        const existing = document.querySelector('script[src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"]');
        if (existing) {
            existing.onload = () => {
                if (window.jspdf && window.jspdf.jsPDF) {
                    resolve(window.jspdf.jsPDF);
                } else {
                    reject(new Error('jsPDF object unavailable after load'));
                }
            };
            existing.onerror = () => reject(new Error('Failed to load jsPDF library'));
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        script.onload = () => {
            if (window.jspdf && window.jspdf.jsPDF) {
                resolve(window.jspdf.jsPDF);
            } else {
                reject(new Error('jsPDF object unavailable after load'));
            }
        };
        script.onerror = () => reject(new Error('Failed to load jsPDF library'));
        document.head.appendChild(script);
    });
}

function generatePDFTable(doc, headers, rows) {
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const startY = 35;
    const rowHeight = 8;
    const maxWidth = pageWidth - margin * 2;
    const columnWidths = [28, 60, 50, 35, 25, 25, 35];
    const columnX = [margin];
    for (let i = 1; i < columnWidths.length; i++) {
        columnX[i] = columnX[i - 1] + columnWidths[i - 1];
    }

    const splitText = (text, width) => doc.splitTextToSize(text || '', width);
    const lineHeight = 6;
    let cursorY = startY;

    // Title and metadata
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('Landmark Metropolitan University', margin, 15);
    
    doc.setFontSize(14);
    doc.text('Academic Timetable', margin, 22);
    
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, margin, 28);
    doc.setTextColor(0, 0, 0);

    // Table header with white background
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.2);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'bold');
    const headerCellLines = headers.map((header, index) => splitText(header, columnWidths[index] - 4));
    const headerHeight = Math.max(...headerCellLines.map(lines => lines.length)) * lineHeight + 6;
    headers.forEach((header, index) => {
        // Draw white background first
        doc.setFillColor(255, 255, 255);
        doc.rect(columnX[index], cursorY - 5, columnWidths[index], headerHeight, 'F');
        // Draw black border
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.2);
        doc.rect(columnX[index], cursorY - 5, columnWidths[index], headerHeight, 'S');
        // Draw text
        doc.setTextColor(0, 0, 0);
        const prevFontSize = doc.internal.getFontSize();
        doc.setFontSize(9);
        const headerY = cursorY + 5;
        doc.text(headerCellLines[index], columnX[index] + 2, headerY);
        doc.setFontSize(prevFontSize);
    });
    cursorY += headerHeight;
    
    // Table rows
    doc.setFont(undefined, 'normal');
    doc.setTextColor(0, 0, 0);
    let rowCount = 0;

    rows.forEach((row) => {
        const cellLines = headers.map((key, index) => splitText(row[key], columnWidths[index] - 4));
        const maxLines = Math.max(...cellLines.map(lines => lines.length));
        const rowHeightPixels = maxLines * 6 + 4;

        if (cursorY + rowHeightPixels > doc.internal.pageSize.getHeight() - margin) {
            doc.addPage();
            cursorY = startY;
            
            // Repeat header on new page
            headers.forEach((header, index) => {
                // Draw white background first
                doc.setFillColor(255, 255, 255);
                doc.rect(columnX[index], cursorY - 5, columnWidths[index], headerHeight, 'F');
                // Draw black border
                doc.setDrawColor(0, 0, 0);
                doc.setLineWidth(0.2);
                doc.rect(columnX[index], cursorY - 5, columnWidths[index], headerHeight, 'S');
                // Draw text
                doc.setTextColor(0, 0, 0);
                doc.setFont(undefined, 'bold');
                const prevFontSize = doc.internal.getFontSize();
                doc.setFontSize(9);
                doc.text(headerCellLines[index], columnX[index] + 2, cursorY + 5);
                doc.setFontSize(prevFontSize);
            });
            cursorY += headerHeight;
            doc.setFont(undefined, 'normal');
            doc.setTextColor(0, 0, 0);
        }

        // All rows with white background
        headers.forEach((key, index) => {
            const lines = cellLines[index];
            // Draw white background first
            doc.setFillColor(255, 255, 255);
            doc.rect(columnX[index], cursorY - 5, columnWidths[index], rowHeightPixels, 'F');
            // Draw black border
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.2);
            doc.rect(columnX[index], cursorY - 5, columnWidths[index], rowHeightPixels, 'S');
            // Draw text
            doc.setTextColor(0, 0, 0);
            doc.text(lines, columnX[index] + 2, cursorY);
        });
        cursorY += rowHeightPixels;
        rowCount++;
    });

    // Footer with page numbers
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 30, doc.internal.pageSize.getHeight() - 10);
    }
}

async function exportTimetableToPDF() {
    if (!currentTimetableEntries || !currentTimetableEntries.length) {
        alert('No timetable data to export');
        return;
    }

    try {
        const jsPDF = await ensurePdfLibrary();
        const doc = new jsPDF({ orientation: 'landscape' });
        const headers = ['Course Code', 'Course Name', 'Instructor', 'Location', 'Capacity', 'Day', 'Time'];
        const rows = currentTimetableEntries.map((entry) => ({
            'Course Code': entry.course_code || '',
            'Course Name': entry.course_name || '',
            'Instructor': entry.lecturer_name || entry.lecturer || entry.user_name || 'N/A',
            'Location': entry.room_number || entry.room || '',
            'Capacity': entry.room_capacity || entry.level_number || entry.level_name || '',
            'Day': entry.day_of_week || entry.day || '',
            'Time': entry.start_time && entry.end_time ? `${entry.start_time} - ${entry.end_time}` : (entry.time_slot || '')
        }));

        generatePDFTable(doc, headers, rows);
        doc.save('LMU-timetable.pdf');
    } catch (error) {
        console.error('PDF export error:', error);
        alert('Unable to generate PDF. Please try again.');
    }
}

// Print timetable
function printTimetable() {
    window.print();
}

// Get user role helper
function getUserRole() {
    const user = JSON.parse(localStorage.getItem('user'));
    return user ? user.role : null;
}

// Close modal helper
function closeModal() {
    const modal = document.getElementById('timetableModal');
    if (modal) {
        modal.remove();
    }
}

// View timetable by lecturer (for admin)
async function viewTimetableByLecturer(lecturerId) {
    const container = document.getElementById('timetableContainer');
    if (!container) return;
    
    try {
        const response = await fetch(`${API_URL}/timetable/lecturer/${lecturerId}`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        
        if (data.success) {
            displayTimetable(data.data, container);
        } else {
            container.innerHTML = '<p class="alert-error">Failed to load lecturer timetable</p>';
        }
    } catch (error) {
        console.error('Error loading lecturer timetable:', error);
        container.innerHTML = '<p class="alert-error">Error loading timetable</p>';
    }
}

// View timetable by level (for admin)
async function viewTimetableByLevel(levelId) {
    const container = document.getElementById('timetableContainer');
    if (!container) return;
    
    try {
        const response = await fetch(`${API_URL}/timetable/level/${levelId}`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        
        if (data.success) {
            displayTimetable(data.data, container);
        } else {
            container.innerHTML = '<p class="alert-error">Failed to load level timetable</p>';
        }
    } catch (error) {
        console.error('Error loading level timetable:', error);
        container.innerHTML = '<p class="alert-error">Error loading timetable</p>';
    }
}

// Show edit timetable modal
async function showEditTimetableModal(id) {
    try {
        const response = await fetch(`${API_URL}/timetable`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        const entry = data.data.find(e => e.id === id);
        
        if (!entry) {
            alert('Entry not found');
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'timetableModal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <span class="close">&times;</span>
                <h2>Edit Timetable Entry</h2>
                <form id="editTimetableForm">
                    <div class="form-group">
                        <label for="course_id">Course *</label>
                        <select id="course_id" required></select>
                    </div>
                    
                    <div class="form-group">
                        <label for="lecturer_id">Lecturer *</label>
                        <select id="lecturer_id" required></select>
                    </div>
                    
                    <div class="form-group">
                        <label for="room_id">Room *</label>
                        <select id="room_id" required></select>
                    </div>
                    
                    <div class="form-group">
                        <label for="level_id">Level *</label>
                        <select id="level_id" required></select>
                    </div>
                    
                    <div class="form-group">
                        <label for="time_slot_id">Time Slot *</label>
                        <select id="time_slot_id" required></select>
                    </div>
                    
                    <div id="conflictWarning" class="conflict-message" style="display: none;"></div>
                    
                    <div class="form-actions">
                        <button type="submit" class="btn-primary">Update Entry</button>
                        <button type="button" onclick="closeModal()" class="btn-secondary">Cancel</button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'block';
        
        // Load data and set values
        await Promise.all([
            loadCoursesForTimetable(),
            loadLecturersForTimetable(),
            loadRoomsForTimetable(),
            loadLevelsForTimetable(),
            loadTimeSlotsForTimetable()
        ]);
        
        document.getElementById('course_id').value = entry.course_id;
        document.getElementById('lecturer_id').value = entry.lecturer_id;
        document.getElementById('room_id').value = entry.room_id;
        document.getElementById('level_id').value = entry.level_id;
        document.getElementById('time_slot_id').value = entry.time_slot_id;
        
        // Close button
        const closeBtn = modal.querySelector('.close');
        closeBtn.onclick = () => closeModal();
        
        // Form submission
        const form = document.getElementById('editTimetableForm');
        form.onsubmit = async (e) => {
            e.preventDefault();
            await updateTimetableEntry(id);
        };
    } catch (error) {
        console.error('Error opening edit modal:', error);
    }
}

async function updateTimetableEntry(id) {
    const entryData = {
        course_id: parseInt(document.getElementById('course_id').value),
        lecturer_id: parseInt(document.getElementById('lecturer_id').value),
        room_id: parseInt(document.getElementById('room_id').value),
        level_id: parseInt(document.getElementById('level_id').value),
        time_slot_id: parseInt(document.getElementById('time_slot_id').value),
        academic_year: '2024',
        semester: 1
    };
    
    try {
        const response = await fetch(`${API_URL}/timetable/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(entryData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Timetable entry updated successfully!');
            closeModal();
            if (typeof loadAdminTimetable === 'function') await loadAdminTimetable();
            if (typeof loadTimetable === 'function') await loadTimetable();
        } else if (data.conflicts) {
            showConflictWarning(`Conflicts detected:<br>${data.conflicts.join('<br>')}`);
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error updating entry:', error);
    }
}

// Export functions for global use
window.showCreateTimetableModal = showCreateTimetableModal;
window.showEditTimetableModal = showEditTimetableModal;
window.deleteTimetableEntry = deleteTimetableEntry;
window.exportTimetableToPDF = exportTimetableToPDF;
window.printTimetable = printTimetable;
window.filterTimetableByLevel = filterTimetableByLevel;
window.filterTimetableByDepartment = filterTimetableByDepartment;
window.checkConflicts = checkConflicts;
window.closeModal = closeModal;
window.viewTimetableByLecturer = viewTimetableByLecturer;
window.viewTimetableByLevel = viewTimetableByLevel;