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

// Display Timetable in Grid Format
function displayTimetable(entries, container) {
    if (!entries || entries.length === 0) {
        container.innerHTML = `
            <div class="card" style="text-align: center; padding: var(--spacing-12);">
                <i class="fas fa-calendar-times" style="font-size: 3rem; color: var(--text-muted); margin-bottom: var(--spacing-4);"></i>
                <h3>No timetable entries found</h3>
                <p style="color: var(--text-secondary);">Start by adding courses to the timetable.</p>
                <button class="btn btn-primary" style="margin-top: var(--spacing-6);" onclick="showCreateTimetableModal()">+ Add Entry</button>
            </div>
        `;
        return;
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

    container.innerHTML = `
        <div class="page-header">
            <div class="breadcrumb">
                <span>ACADEMIC</span>
                <span>RESOURCES</span>
                <span>TIMETABLE MANAGEMENT</span>
            </div>
            <div class="flex justify-between items-center">
                <div>
                    <h1>Timetable Management</h1>
                    <p style="color: var(--text-secondary); font-size: 0.875rem;">Manage academic schedules and optimize room utilization.</p>
                </div>
                <div class="flex flex-col" style="align-items: flex-end; gap: 0.5rem;">
                    <div class="flex gap-2" style="align-items: center;">
                        <button class="btn btn-outline btn-sm" onclick="exportTimetableToPDF()">
                            <i class="fas fa-file-pdf"></i> Download PDF
                        </button>
                        <button class="btn btn-outline btn-sm" onclick="printTimetable()">
                            <i class="fas fa-print"></i> Print
                        </button>
                        <button class="btn btn-primary" onclick="showCreateTimetableModal()">
                            <i class="fas fa-plus"></i> &nbsp; Add Entry
                        </button>
                    </div>
                    <span style="font-size: 0.8rem; color: var(--text-muted);">One-click PDF download of the current timetable.</span>
                </div>
            </div>
        </div>

        <div class="card" style="margin-bottom: var(--spacing-6);">
            <div class="flex justify-between items-center">
                <div class="flex gap-4 items-center">
                    <span style="font-weight: 700; font-size: 0.75rem; color: var(--text-muted);">FILTER BY:</span>
                    <select id="filterSchool" class="input-field" style="width: 180px; padding: 0.5rem;">
                        <option value="">All Schools</option>
                    </select>
                    <select id="filterDepartment" class="input-field" style="width: 180px; padding: 0.5rem;" onchange="filterTimetableByDepartment()">
                        <option value="">All Departments</option>
                    </select>
                    <select id="filterLevel" class="input-field" style="width: 150px; padding: 0.5rem;" onchange="filterTimetableByLevel()">
                        <option value="">All Levels</option>
                    </select>
                </div>
                <div class="flex gap-2">
                    <button class="btn btn-outline btn-sm" onclick="exportTimetableToPDF()"><i class="fas fa-file-pdf"></i></button>
                    <button class="btn btn-outline btn-sm" onclick="printTimetable()"><i class="fas fa-print"></i></button>
                </div>
            </div>
        </div>

        <div class="dashboard-content-flex" style="display: flex; gap: var(--spacing-6); align-items: flex-start; flex-wrap: wrap;">
            <!-- Timetable Grid -->
            <div class="timetable-container" id="timetableExportable" style="flex: 1; min-width: 0; overflow-x: auto;">
                <table class="timetable-table" aria-label="Weekly timetable">
                    <thead>
                        <tr>
                            <th>Time</th>
                            ${daysOfWeek.map(day => `<th>${day}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${timeSlots.map(slot => `
                            <tr>
                                <td class="timetable-cell time-slot">${slot}</td>
                                ${daysOfWeek.map(day => {
                                    const rowEntries = (timetableByDay[day] || []).filter(e => `${e.start_time} - ${e.end_time}` === slot);
                                    if (rowEntries.length) {
                                        return `<td class="timetable-cell">${rowEntries.map(entry => {
                                            const colors = [
                                                { bg: '#EFF6FF', border: '#3B82F6', text: '#1E40AF' },
                                                { bg: '#ECFDF5', border: '#10B981', text: '#065F46' },
                                                { bg: '#FFFBEB', border: '#F59E0B', text: '#92400E' },
                                                { bg: '#F5F3FF', border: '#8B5CF6', text: '#5B21B6' }
                                            ];
                                            const color = colors[entry.id % colors.length];
                                            return `
                                                <div class="course-card" style="background-color: ${color.bg}; border-left-color: ${color.border}; cursor: pointer; padding: 8px 10px;" onclick="showEditTimetableModal(${entry.id})">
                                                    <span class="course-code" style="color: ${color.text}; font-weight: 600; display: block;">${entry.course_code}</span>
                                                    <span class="course-info" style="font-size: 0.75rem; display: block; margin-top: 0.25rem;"><strong>Course:</strong> ${entry.course_name || ''}</span>
                                                    <span class="course-info" style="font-size: 0.75rem; display: block;"><strong>Lecturer:</strong> ${entry.lecturer_name || 'N/A'}</span>
                                                    <span class="course-info" style="font-size: 0.75rem; display: block;"><strong>Room:</strong> ${entry.room_number || 'Room TBD'}</span>
                                                    <span class="course-info" style="font-size: 0.75rem; display: block;"><strong>Level:</strong> ${entry.level_number || entry.level || 'N/A'}</span>
                                                    <span class="course-info" style="font-size: 0.75rem; display: block;"><strong>Time:</strong> ${entry.start_time || ''}${entry.end_time ? ' - ' + entry.end_time : ''}</span>
                                                </div>
                                            `;
                                        }).join('')}</td>`;
                                    }
                                    return '<td class="timetable-cell"></td>';
                                }).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <!-- Side Panel -->
            <aside class="optimizer-panel">
                <div class="optimizer-card">
                    <div class="optimizer-header">
                        <i class="fas fa-bolt"></i>
                        <span>AI Optimizer</span>
                    </div>
                    
                    <!-- Example Conflict -->
                    <div class="conflict-alert">
                        <div class="flex gap-2" style="margin-bottom: 8px;">
                            <i class="fas fa-exclamation-triangle"></i>
                            <span style="font-size: 0.75rem; font-weight: 800; color: #991B1B;">CONFLICT DETECTED</span>
                        </div>
                        <p style="font-size: 0.7rem; color: #991B1B; line-height: 1.4;">
                            <strong>CS410</strong> and <strong>EE402</strong> are both scheduled for <strong>Lab 1</strong> at 02:00 PM on Tuesday.
                        </p>
                        <button class="btn btn-primary btn-sm w-full" style="margin-top: 12px; background-color: #E11D48; border: none;">Auto-Resolve</button>
                    </div>

                    <div style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: var(--radius-md); padding: var(--spacing-3);">
                        <div class="flex gap-2" style="margin-bottom: 8px; color: #166534;">
                            <i class="fas fa-sparkles"></i>
                            <span style="font-size: 0.75rem; font-weight: 800;">OPTIMAL SLOT FOUND</span>
                        </div>
                        <p style="font-size: 0.7rem; color: #166534; line-height: 1.4;">
                            Moving CS410 to Friday 10:00 AM would reduce student transition time by 15%.
                        </p>
                        <div class="flex gap-2" style="margin-top: 12px;">
                            <button class="btn btn-outline btn-sm flex-1">Dismiss</button>
                            <button class="btn btn-primary btn-sm flex-1" style="background-color: #166534; border: none;">Apply</button>
                        </div>
                    </div>
                </div>

                <div class="optimizer-card">
                    <h4 style="font-size: 0.875rem; margin-bottom: var(--spacing-4);">SYSTEM HEALTH</h4>
                    <div style="margin-bottom: var(--spacing-4);">
                        <div class="flex justify-between" style="font-size: 0.75rem; font-weight: 600;">
                            <span>Room Utilization</span>
                            <span>84%</span>
                        </div>
                        <div class="health-bar"><div class="health-progress" style="width: 84%;"></div></div>
                    </div>
                    <div>
                        <div class="flex justify-between" style="font-size: 0.75rem; font-weight: 600;">
                            <span>Staff Load Balance</span>
                            <span>92%</span>
                        </div>
                        <div class="health-bar"><div class="health-progress" style="width: 92%; background-color: #10B981;"></div></div>
                    </div>
                </div>

                <div class="optimizer-card flex items-center justify-between" style="padding: var(--spacing-4);">
                    <div>
                        <h4 style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 2px;">SYSTEM STATUS</h4>
                        <span style="font-size: 0.875rem; font-weight: 700; color: #10B981;">● Optimized</span>
                    </div>
                    <i class="fas fa-check-circle" style="color: #10B981; font-size: 1.25rem;"></i>
                </div>
            </aside>
        </div>

        <!-- Summary Cards at Bottom -->
        <div class="stats-grid" style="margin-top: var(--spacing-8);">
            <div class="card stat-card">
                <div class="stat-info">
                    <p>TOTAL COURSES</p>
                    <div class="flex items-center gap-2">
                        <h3>124</h3>
                        <span style="color: #10B981; font-size: 0.75rem; font-weight: 700;"><i class="fas fa-arrow-up"></i> 12</span>
                    </div>
                </div>
            </div>
            <div class="card stat-card">
                <div class="stat-info">
                    <p>ALLOCATED HOURS</p>
                    <div class="flex items-center gap-2">
                        <h3>842h</h3>
                        <span style="color: var(--text-muted); font-size: 0.75rem;">of 1,000h cap</span>
                    </div>
                </div>
            </div>
            <div class="card stat-card">
                <div class="stat-info">
                    <p>PENDING LABS</p>
                    <div class="flex items-center gap-2">
                        <h3>08</h3>
                        <span style="color: #F59E0B; font-size: 0.75rem; font-weight: 700;">Needs Action</span>
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
    doc.setFillColor(255, 255, 255);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'bold');
    const headerCellLines = headers.map((header, index) => splitText(header, columnWidths[index] - 4));
    const headerHeight = Math.max(...headerCellLines.map(lines => lines.length)) * lineHeight + 6;
    headers.forEach((header, index) => {
        doc.rect(columnX[index], cursorY - 5, columnWidths[index], headerHeight, 'FD');
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
            doc.setFillColor(255, 255, 255);
            doc.setTextColor(0, 0, 0);
            doc.setFont(undefined, 'bold');
            headers.forEach((header, index) => {
                doc.rect(columnX[index], cursorY - 5, columnWidths[index], headerHeight, 'FD');
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
        doc.setFillColor(255, 255, 255);

        headers.forEach((key, index) => {
            const lines = cellLines[index];
            doc.rect(columnX[index], cursorY - 5, columnWidths[index], rowHeightPixels, 'FD');
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