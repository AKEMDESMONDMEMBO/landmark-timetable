// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    if (!checkAuth()) return;
    
    const user = JSON.parse(localStorage.getItem('user'));
    document.getElementById('userName').textContent = user.full_name;
    
    // Load default content based on role
    if (user.role === 'admin') {
        loadAdminDashboard();
    } else if (user.role === 'lecturer') {
        loadLecturerDashboard();
    } else {
        loadStudentDashboard();
    }
    
    // Setup sidebar navigation
    document.querySelectorAll('.sidebar-menu li').forEach(item => {
        item.addEventListener('click', () => {
            const tab = item.getAttribute('data-tab');
            if (tab === 'logout') {
                logout();
                return;
            }
            
            document.querySelectorAll('.sidebar-menu li').forEach(li => li.classList.remove('active'));
            item.classList.add('active');
            
            if (user.role === 'admin') {
                handleAdminTab(tab);
            } else if (user.role === 'lecturer') {
                handleLecturerTab(tab);
            } else {
                handleStudentTab(tab);
            }
        });
    });
});

// Admin Dashboard Functions
async function loadAdminDashboard() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <h3>Total Users</h3>
                <p id="totalUsers">Loading...</p>
            </div>
            <div class="stat-card">
                <h3>Total Courses</h3>
                <p id="totalCourses">Loading...</p>
            </div>
            <div class="stat-card">
                <h3>Total Lecturers</h3>
                <p id="totalLecturers">Loading...</p>
            </div>
            <div class="stat-card">
                <h3>Timetable Entries</h3>
                <p id="totalEntries">Loading...</p>
            </div>
        </div>
        <div class="recent-activities">
            <h2>Recent Timetable Entries</h2>
            <div id="recentTimetable"></div>
        </div>
    `;
    
    await loadDashboardStats();
    await loadRecentTimetable();
}

async function loadDashboardStats() {
    try {
        const response = await fetch(`${API_URL}/dashboard/stats`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        if (data.success) {
            document.getElementById('totalUsers').textContent = data.data.totalUsers;
            document.getElementById('totalCourses').textContent = data.data.totalCourses;
            document.getElementById('totalLecturers').textContent = data.data.totalLecturers;
            document.getElementById('totalEntries').textContent = data.data.totalEntries;
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

async function loadRecentTimetable() {
    try {
        const response = await fetch(`${API_URL}/timetable`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        if (data.success && data.data.length > 0) {
            const table = document.createElement('table');
            table.innerHTML = `
                <thead>
                    <tr><th>Course</th><th>Lecturer</th><th>Room</th><th>Day</th><th>Time</th></tr>
                </thead>
                <tbody>
                    ${data.data.slice(0, 5).map(entry => `
                        <tr>
                            <td>${entry.course_code}</td>
                            <td>${entry.lecturer_name || 'N/A'}</td>
                            <td>${entry.room_number}</td>
                            <td>${entry.day_of_week}</td>
                            <td>${entry.start_time} - ${entry.end_time}</td>
                        </tr>
                    `).join('')}
                </tbody>
            `;
            document.getElementById('recentTimetable').appendChild(table);
        }
    } catch (error) {
        console.error('Error loading recent timetable:', error);
    }
}

async function loadUserManagement() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div style="margin-bottom: 20px;">
            <button class="btn-primary" onclick="showCreateUserModal()">Create New User</button>
        </div>
        <div id="usersList"></div>
    `;
    
    await loadUsers();
}

async function loadUsers() {
    try {
        const response = await fetch(`${API_URL}/users`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        if (data.success) {
            const table = `
                <table>
                    <thead>
                        <tr><th>Name</th><th>Email</th><th>Role</th><th>Created At</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                        ${data.data.map(user => `
                            <tr>
                                <td>${user.full_name}</td>
                                <td>${user.email}</td>
                                <td>${user.role}</td>
                                <td>${new Date(user.created_at).toLocaleDateString()}</td>
                                <td>
                                    <button class="btn-primary" onclick="editUser(${user.id})">Edit</button>
                                    <button class="btn-danger" onclick="deleteUser(${user.id})">Delete</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
            document.getElementById('usersList').innerHTML = table;
        }
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

async function loadCourseManagement() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div style="margin-bottom: 20px;">
            <button class="btn-primary" onclick="showCreateCourseModal()">Create New Course</button>
        </div>
        <div id="coursesList"></div>
    `;
    
    await loadCourses();
}

async function loadCourses() {
    try {
        const response = await fetch(`${API_URL}/courses`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        if (data.success) {
            const table = `
                <table>
                    <thead>
                        <tr><th>Course Code</th><th>Course Name</th><th>Credits</th><th>Department</th><th>Level</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                        ${data.data.map(course => `
                            <tr>
                                <td>${course.course_code}</td>
                                <td>${course.course_name}</td>
                                <td>${course.credits}</td>
                                <td>${course.department_name || 'N/A'}</td>
                                <td>${course.level_number || 'N/A'}</td>
                                <td>
                                    <button class="btn-primary" onclick="editCourse(${course.id})">Edit</button>
                                    <button class="btn-danger" onclick="deleteCourse(${course.id})">Delete</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
            document.getElementById('coursesList').innerHTML = table;
        }
    } catch (error) {
        console.error('Error loading courses:', error);
    }
}

async function loadTimetableManagement() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div style="margin-bottom: 20px;">
            <button class="btn-primary" onclick="showCreateTimetableModal()">Add Timetable Entry</button>
        </div>
        <div id="timetableList"></div>
    `;
    
    await loadTimetable();
}

async function loadTimetable() {
    try {
        const response = await fetch(`${API_URL}/timetable`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        if (data.success) {
            const table = `
                <table>
                    <thead>
                        <tr><th>Course</th><th>Lecturer</th><th>Room</th><th>Level</th><th>Day</th><th>Time</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                        ${data.data.map(entry => `
                            <tr>
                                <td>${entry.course_code}</td>
                                <td>${entry.lecturer_name || 'N/A'}</td>
                                <td>${entry.room_number}</td>
                                <td>${entry.level_number}</td>
                                <td>${entry.day_of_week}</td>
                                <td>${entry.start_time} - ${entry.end_time}</td>
                                <td>
                                    <button class="btn-danger" onclick="deleteTimetableEntry(${entry.id})">Delete</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
            document.getElementById('timetableList').innerHTML = table;
        }
    } catch (error) {
        console.error('Error loading timetable:', error);
    }
}

// Modal functions
function showCreateTimetableModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Add Timetable Entry</h2>
            <form id="createTimetableForm">
                <div class="form-group">
                    <label>Course:</label>
                    <select id="course_id" required></select>
                </div>
                <div class="form-group">
                    <label>Lecturer:</label>
                    <select id="lecturer_id" required></select>
                </div>
                <div class="form-group">
                    <label>Room:</label>
                    <select id="room_id" required></select>
                </div>
                <div class="form-group">
                    <label>Level:</label>
                    <select id="level_id" required></select>
                </div>
                <div class="form-group">
                    <label>Time Slot:</label>
                    <select id="time_slot_id" required></select>
                </div>
                <button type="submit" class="btn-primary">Create Entry</button>
            </form>
            <div id="conflictMessage" class="conflict-message" style="display:none;"></div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
    
    // Load dropdown data
    loadCoursesForDropdown();
    loadLecturersForDropdown();
    loadRoomsForDropdown();
    loadLevelsForDropdown();
    loadTimeSlotsForDropdown();
    
    const closeBtn = modal.querySelector('.close');
    closeBtn.onclick = () => modal.remove();
    
    const form = document.getElementById('createTimetableForm');
    form.onsubmit = async (e) => {
        e.preventDefault();
        
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
            const response = await fetch(`${API_URL}/timetable`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(entryData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert('Timetable entry created successfully!');
                modal.remove();
                loadTimetable();
            } else {
                const conflictMsg = document.getElementById('conflictMessage');
                conflictMsg.style.display = 'block';
                conflictMsg.innerHTML = `<strong>Conflicts Detected:</strong><br>${data.conflicts.join('<br>')}`;
            }
        } catch (error) {
            alert('Error creating timetable entry');
        }
    };
}

// Helper functions for dropdowns
async function loadCoursesForDropdown() {
    const response = await fetch(`${API_URL}/courses`, { headers: getAuthHeaders() });
    const data = await response.json();
    if (data.success) {
        const select = document.getElementById('course_id');
        select.innerHTML = data.data.map(course => 
            `<option value="${course.id}">${course.course_code} - ${course.course_name}</option>`
        ).join('');
    }
}

async function loadLecturersForDropdown() {
    const response = await fetch(`${API_URL}/lecturers`, { headers: getAuthHeaders() });
    const data = await response.json();
    if (data.success) {
        const select = document.getElementById('lecturer_id');
        select.innerHTML = data.data.map(lecturer => 
            `<option value="${lecturer.id}">${lecturer.full_name}</option>`
        ).join('');
    }
}

async function loadRoomsForDropdown() {
    const response = await fetch(`${API_URL}/rooms`, { headers: getAuthHeaders() });
    const data = await response.json();
    if (data.success) {
        const select = document.getElementById('room_id');
        select.innerHTML = data.data.map(room => 
            `<option value="${room.id}">${room.room_number} (Capacity: ${room.capacity})</option>`
        ).join('');
    }
}

async function loadLevelsForDropdown() {
    const response = await fetch(`${API_URL}/dashboard/levels`, { headers: getAuthHeaders() });
    const data = await response.json();
    if (data.success) {
        const select = document.getElementById('level_id');
        select.innerHTML = data.data.map(level => 
            `<option value="${level.id}">${level.name}</option>`
        ).join('');
    }
}

async function loadTimeSlotsForDropdown() {
    const response = await fetch(`${API_URL}/dashboard/timeslots`, { headers: getAuthHeaders() });
    const data = await response.json();
    if (data.success) {
        const select = document.getElementById('time_slot_id');
        select.innerHTML = data.data.map(slot => 
            `<option value="${slot.id}">${slot.day_of_week} - ${slot.start_time} to ${slot.end_time}</option>`
        ).join('');
    }
}

// Note: handleAdminTab is defined in admin.js

function setupAdminEventListeners() {
    window.showCreateUserModal = showCreateUserModal;
    window.showCreateCourseModal = showCreateCourseModal;
    window.showCreateTimetableModal = showCreateTimetableModal;
    window.editUser = editUser;
    window.deleteUser = deleteUser;
    window.editCourse = editCourse;
    window.deleteCourse = deleteCourse;
    window.deleteTimetableEntry = deleteTimetableEntry;
}

// Lecturer Dashboard
async function loadLecturerDashboard() {
    const user = JSON.parse(localStorage.getItem('user'));
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <h2>My Timetable</h2>
        <div id="lecturerTimetable"></div>
    `;
    
    try {
        const response = await fetch(`${API_URL}/dashboard/lecturer-timetable`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        if (data.success && data.data.length > 0) {
            const table = `
                <table>
                    <thead>
                        <tr><th>Course</th><th>Room</th><th>Level</th><th>Day</th><th>Time</th></tr>
                    </thead>
                    <tbody>
                        ${data.data.map(entry => `
                            <tr>
                                <td>${entry.course_code} - ${entry.course_name}</td>
                                <td>${entry.room_number}</td>
                                <td>${entry.level_number}</td>
                                <td>${entry.day_of_week}</td>
                                <td>${entry.start_time} - ${entry.end_time}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
            document.getElementById('lecturerTimetable').innerHTML = table;
        } else {
            document.getElementById('lecturerTimetable').innerHTML = '<p>No timetable entries found.</p>';
        }
    } catch (error) {
        console.error('Error loading lecturer timetable:', error);
    }
}

// Student Dashboard
async function loadStudentDashboard() {
    const user = JSON.parse(localStorage.getItem('user'));
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <h2>My Class Timetable</h2>
        <div id="studentTimetable"></div>
    `;
    
    try {
        // For demo, show all timetable entries
        const response = await fetch(`${API_URL}/timetable`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        if (data.success && data.data.length > 0) {
            const table = `
                <table>
                    <thead>
                        <tr><th>Course</th><th>Lecturer</th><th>Room</th><th>Level</th><th>Day</th><th>Time</th></tr>
                    </thead>
                    <tbody>
                        ${data.data.map(entry => `
                            <tr>
                                <td>${entry.course_code} - ${entry.course_name}</td>
                                <td>${entry.lecturer_name || 'N/A'}</td>
                                <td>${entry.room_number}</td>
                                <td>${entry.level_number}</td>
                                <td>${entry.day_of_week}</td>
                                <td>${entry.start_time} - ${entry.end_time}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
            document.getElementById('studentTimetable').innerHTML = table;
        } else {
            document.getElementById('studentTimetable').innerHTML = '<p>No timetable entries found.</p>';
        }
    } catch (error) {
        console.error('Error loading student timetable:', error);
    }
}

// Placeholder functions for complete implementation
async function loadLecturerManagement() { alert('Lecturer management coming soon'); }
async function loadRoomManagement() { alert('Room management coming soon'); }
function showCreateUserModal() { alert('Create user modal coming soon'); }
function showCreateCourseModal() { alert('Create course modal coming soon'); }
function editUser(id) { alert(`Edit user ${id} coming soon`); }
function deleteUser(id) { alert(`Delete user ${id} coming soon`); }
function editCourse(id) { alert(`Edit course ${id} coming soon`); }
function deleteCourse(id) { alert(`Delete course ${id} coming soon`); }
function deleteTimetableEntry(id) { alert(`Delete timetable entry ${id} coming soon`); }
function handleLecturerTab(tab) { loadLecturerDashboard(); }
function handleStudentTab(tab) { loadStudentDashboard(); }