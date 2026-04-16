// Timetable Management Functions
var API_URL = API_URL || 'http://localhost:5000/api';

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
            displayTimetable(data.data, container);
        } else {
            container.innerHTML = '<p class="alert-error">Failed to load your timetable</p>';
        }
    } catch (error) {
        console.error('Error loading student timetable:', error);
        container.innerHTML = '<p class="alert-error">Error loading timetable</p>';
    }
}

// Display Timetable in Grid Format
function displayTimetable(entries, container) {
    if (!entries || entries.length === 0) {
        container.innerHTML = '<p class="alert-info">No timetable entries found.</p>';
        return;
    }
    
    // Group by day of week
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const timetableByDay = {};
    
    daysOfWeek.forEach(day => {
        timetableByDay[day] = entries.filter(entry => entry.day_of_week === day);
    });
    
    // Create timetable HTML
    let html = `
        <div class="timetable-wrapper">
            <div class="timetable-controls">
                <button onclick="exportTimetableToPDF()" class="btn-primary">Export to PDF</button>
                <button onclick="printTimetable()" class="btn-primary">Print Timetable</button>
                <select id="filterLevel" onchange="filterTimetableByLevel()" class="filter-select">
                    <option value="">All Levels</option>
                </select>
                <select id="filterDepartment" onchange="filterTimetableByDepartment()" class="filter-select">
                    <option value="">All Departments</option>
                </select>
            </div>
            <div class="timetable-grid">
                <div class="timetable-header">
                    <div class="timetable-cell header">Time / Day</div>
                    ${daysOfWeek.map(day => `<div class="timetable-cell header">${day}</div>`).join('')}
                </div>
    `;
    
    // Time slots (you can customize these)
    const timeSlots = [
        '08:00 - 10:00',
        '10:00 - 12:00',
        '12:00 - 14:00',
        '14:00 - 16:00',
        '16:00 - 18:00'
    ];
    
    timeSlots.forEach(slot => {
        html += `<div class="timetable-row">`;
        html += `<div class="timetable-cell time-slot">${slot}</div>`;
        
        daysOfWeek.forEach(day => {
            const dayEntries = timetableByDay[day] || [];
            const entryForSlot = dayEntries.find(entry => {
                const entryTime = `${entry.start_time} - ${entry.end_time}`;
                return entryTime === slot;
            });
            
            if (entryForSlot) {
                html += `
                    <div class="timetable-cell course-cell">
                        <strong>${entryForSlot.course_code}</strong><br>
                        ${entryForSlot.course_name}<br>
                        <small>Room: ${entryForSlot.room_number}</small><br>
                        <small>Lecturer: ${entryForSlot.lecturer_name || 'N/A'}</small>
                        ${getUserRole() === 'admin' ? `
                            <br>
                            <button onclick="deleteTimetableEntry(${entryForSlot.id})" class="btn-small btn-danger">
                                Delete
                            </button>
                        ` : ''}
                    </div>
                `;
            } else {
                html += `<div class="timetable-cell empty-cell">-</div>`;
            }
        });
        
        html += `</div>`;
    });
    
    html += `
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    
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
function exportTimetableToPDF() {
    const timetableElement = document.querySelector('.timetable-wrapper');
    if (!timetableElement) {
        alert('No timetable data to export');
        return;
    }
    
    // In production, you would integrate a PDF library like jsPDF
    // For now, we'll use browser's print functionality
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>LMU Timetable Export</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .timetable-grid { display: table; width: 100%; border-collapse: collapse; }
                    .timetable-header { display: table-row; background: #f0f0f0; }
                    .timetable-row { display: table-row; }
                    .timetable-cell { display: table-cell; border: 1px solid #ddd; padding: 8px; }
                    .header { font-weight: bold; background: #667eea; color: white; }
                </style>
            </head>
            <body>
                <h1>Landmark Metropolitan University - Timetable</h1>
                ${timetableElement.outerHTML}
                <p>Generated on: ${new Date().toLocaleString()}</p>
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
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

// Export functions for global use
window.showCreateTimetableModal = showCreateTimetableModal;
window.deleteTimetableEntry = deleteTimetableEntry;
window.exportTimetableToPDF = exportTimetableToPDF;
window.printTimetable = printTimetable;
window.filterTimetableByLevel = filterTimetableByLevel;
window.filterTimetableByDepartment = filterTimetableByDepartment;
window.checkConflicts = checkConflicts;
window.closeModal = closeModal;
window.viewTimetableByLecturer = viewTimetableByLecturer;
window.viewTimetableByLevel = viewTimetableByLevel;