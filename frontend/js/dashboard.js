function formatLevelLabel(level) {
    if (!level) {
        return 'Unknown Level';
    }

    const customName = typeof level.name === 'string' ? level.name.trim() : '';
    if (customName) {
        return customName;
    }

    const levelNumber = level.level_number ?? level.levelNumber;
    if (levelNumber !== undefined && levelNumber !== null && levelNumber !== '') {
        return `Level ${levelNumber}`;
    }

    return 'Unknown Level';
}

window.formatLevelLabel = formatLevelLabel;

async function refreshCurrentUser() {
    try {
        const response = await fetch(`${API_URL}/users/me`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        if (data.success && data.data) {
            localStorage.setItem('user', JSON.stringify(data.data));
            return data.data;
        }
    } catch (error) {
        console.error('Error fetching user profile:', error);
    }
    return JSON.parse(localStorage.getItem('user'));
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', async () => {
    if (!checkAuth()) return;
    
    let user = await refreshCurrentUser();
    if (!user) {
        user = JSON.parse(localStorage.getItem('user'));
    }

    document.getElementById('userName').textContent = user.full_name;
    const avatar = document.getElementById('userAvatar');
    if (avatar && user.full_name) {
        avatar.textContent = user.full_name.charAt(0).toUpperCase();
    }
    
    // Load default content based on role
    if (user.role === 'admin') {
        loadAdminDashboard();
    } else if (user.role === 'lecturer') {
        loadLecturerDashboard();
    } else {
        loadStudentDashboard();
    }
    
    // Setup sidebar navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const tab = item.getAttribute('data-tab');
            if (!tab) return;
            
            if (tab === 'logout') {
                handleLogout();
                return;
            }
            
            document.querySelectorAll('.nav-item').forEach(li => li.classList.remove('active'));
            item.classList.add('active');
            
            if (user.role === 'admin') {
                if (typeof handleAdminTab === 'function') {
                    handleAdminTab(tab);
                } else {
                    console.error('handleAdminTab not found');
                }
            } else if (user.role === 'lecturer') {
                handleLecturerTab(tab);
            } else {
                handleStudentTab(tab);
            }
        });
    });

    // Setup Notification Click
    const notifBtn = document.getElementById('notificationBtn');
    const notifDropdown = document.getElementById('notifDropdown');
    if (notifBtn && notifDropdown) {
        notifBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            notifDropdown.classList.toggle('active');
            if (notifDropdown.classList.contains('active')) {
                loadNotifications();
            }
        });
    }

    document.addEventListener('click', () => {
        if (notifDropdown) notifDropdown.classList.remove('active');
    });

    // Setup sidebar toggle for mobile
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.new-sidebar');
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebar.classList.toggle('mobile-active');
            
            // Create overlay if it doesn't exist
            let overlay = document.querySelector('.sidebar-overlay');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.className = 'sidebar-overlay';
                overlay.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:95; display:none;';
                document.body.appendChild(overlay);
                overlay.addEventListener('click', () => {
                    sidebar.classList.remove('mobile-active');
                    overlay.style.display = 'none';
                });
            }
            overlay.style.display = sidebar.classList.contains('mobile-active') ? 'block' : 'none';
        });
    }

    const closeSidebar = document.getElementById('closeSidebar');
    if (closeSidebar && sidebar) {
        closeSidebar.addEventListener('click', () => {
            sidebar.classList.remove('mobile-active');
            const overlay = document.querySelector('.sidebar-overlay');
            if (overlay) overlay.style.display = 'none';
        });
    }

    // Close sidebar when clicking menu items on mobile
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth <= 768 && sidebar) {
                sidebar.classList.remove('mobile-active');
                const overlay = document.querySelector('.sidebar-overlay');
                if (overlay) overlay.style.display = 'none';
            }
            // ... existing tab logic is already there in a separate listener ...
        });
    });

    // Initial notifications load and polling
    loadNotifications();
    setInterval(loadNotifications, 30000); // Poll every 30 seconds
});

async function loadNotifications() {
    try {
        const response = await fetch(`${API_URL}/dashboard/notifications`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        if (data.success) {
            updateNotificationUI(data.data);
        }
    } catch (error) {
        console.error('Error loading notifications:', error);
    }
}

function updateNotificationUI(notifications) {
    const list = document.getElementById('notifList');
    const badge = document.getElementById('notifBadge');
    
    if (!list) return;

    const unreadCount = notifications.filter(n => !n.is_read).length;
    if (badge) badge.style.display = unreadCount > 0 ? 'block' : 'none';
    
    if (notifications.length === 0) {
        list.innerHTML = '<p style="text-align:center; padding: 20px; color: var(--text-secondary);">No notifications</p>';
        return;
    }
    
    list.innerHTML = notifications.map(n => `
        <div class="notif-item ${n.is_read ? '' : 'unread'}" onclick="markAsRead(${n.id})">
            <h4>${n.title}</h4>
            <p>${n.message}</p>
            <small>${new Date(n.created_at).toLocaleString()}</small>
        </div>
    `).join('');
}

async function markAsRead(id) {
    try {
        await fetch(`${API_URL}/dashboard/notifications/${id}/read`, {
            method: 'PUT',
            headers: getAuthHeaders()
        });
        loadNotifications();
    } catch (error) {
        console.error('Error marking notification as read:', error);
    }
}

async function markAllAsRead() {
    try {
        const response = await fetch(`${API_URL}/dashboard/notifications`, { headers: getAuthHeaders() });
        const data = await response.json();
        if (data.success) {
            const unread = data.data.filter(n => !n.is_read);
            for (const n of unread) {
                await fetch(`${API_URL}/dashboard/notifications/${n.id}/read`, {
                    method: 'PUT',
                    headers: getAuthHeaders()
                });
            }
            loadNotifications();
            if (document.getElementById('fullNotifList')) loadNotificationsView();
        }
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
    }
}

// Admin Dashboard Functions - Now handled by admin.js

// Lecturer Dashboard
async function loadLecturerDashboard() {
    const contentArea = document.getElementById('contentArea');
    const user = JSON.parse(localStorage.getItem('user'));
    
    // Build lecturer info details
    const lecturerInfoDetails = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--spacing-4);">
            ${user.department_name ? `
                <div style="display: flex; align-items: center; gap: var(--spacing-3);">
                    <i class="fas fa-building" style="font-size: 1.5rem; opacity: 0.7;"></i>
                    <div>
                        <span style="display: block; font-size: 0.75rem; opacity: 0.8; font-weight: 600; text-transform: uppercase;">Department</span>
                        <span style="display: block; font-size: 1rem; font-weight: 600;">${user.department_name}</span>
                    </div>
                </div>
            ` : ''}
            ${user.specialization ? `
                <div style="display: flex; align-items: center; gap: var(--spacing-3);">
                    <i class="fas fa-star" style="font-size: 1.5rem; opacity: 0.7;"></i>
                    <div>
                        <span style="display: block; font-size: 0.75rem; opacity: 0.8; font-weight: 600; text-transform: uppercase;">Specialization</span>
                        <span style="display: block; font-size: 1rem; font-weight: 600;">${user.specialization}</span>
                    </div>
                </div>
            ` : ''}
            ${user.employee_id ? `
                <div style="display: flex; align-items: center; gap: var(--spacing-3);">
                    <i class="fas fa-id-badge" style="font-size: 1.5rem; opacity: 0.7;"></i>
                    <div>
                        <span style="display: block; font-size: 0.75rem; opacity: 0.8; font-weight: 600; text-transform: uppercase;">Employee ID</span>
                        <span style="display: block; font-size: 1rem; font-weight: 600;">${user.employee_id}</span>
                    </div>
                </div>
            ` : ''}
        </div>
    `;

    contentArea.innerHTML = `
        <!-- User Info Card -->
        <div class="card" style="margin-bottom: var(--spacing-8); background: linear-gradient(135deg, var(--primary) 0%, #6366f1 100%); color: white; border: none;">
            <div style="display: grid; grid-template-columns: auto 1fr; gap: var(--spacing-6); align-items: flex-start;">
                <div style="width: 80px; height: 80px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: bold;">
                    ${user.full_name.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h2 style="margin: 0; font-size: 1.75rem; margin-bottom: var(--spacing-2);">${user.full_name}</h2>
                    <div style="display: flex; gap: var(--spacing-4); margin-bottom: var(--spacing-3);">
                        <span><i class="fas fa-envelope" style="margin-right: 0.5rem;"></i>${user.email}</span>
                    </div>
                    <span style="background: rgba(255,255,255,0.2); padding: 0.5rem 1rem; border-radius: 9999px; display: inline-block; font-size: 0.875rem; font-weight: 600;">Lecturer Account</span>
                </div>
            </div>
        </div>

        <!-- Academic Info Card -->
        ${(user.department_name || user.specialization || user.employee_id) ? `
            <div class="card" style="margin-bottom: var(--spacing-8); background: #f8fafc; border: 1px solid #e2e8f0;">
                <h3 style="margin: 0 0 var(--spacing-4) 0; font-size: 1rem; font-weight: 700;">Academic Information</h3>
                ${lecturerInfoDetails}
            </div>
        ` : ''}

        <div class="page-header">
            <div class="breadcrumb"><span>LECTURER</span><span>DASHBOARD</span><span>SCHEDULE</span></div>
            <h1>My Teaching Schedule</h1>
        </div>
        <div class="card">
            <div id="lecturerTimetable" style="overflow-x: auto;"><div class="spinner"></div></div>
        </div>
    `;
    
    try {
        const response = await fetch(`${API_URL}/dashboard/lecturer-timetable`, { headers: getAuthHeaders() });
        const data = await response.json();
        const container = document.getElementById('lecturerTimetable');
        if (data.success && data.data.length > 0) {
            container.innerHTML = `
                <table class="data-table">
                    <thead><tr><th>Day</th><th>Time</th><th>Course</th><th>Room</th><th>Level</th></tr></thead>
                    <tbody>
                        ${data.data.map(entry => `
                            <tr>
                                <td style="font-weight: 600; color: var(--primary);">${entry.day_of_week}</td>
                                <td><span class="badge" style="background: #f1f5f9; color: #475569;">${entry.start_time} - ${entry.end_time}</span></td>
                                <td><strong>${entry.course_code}</strong><br><small style="color: var(--text-secondary)">${entry.course_name}</small></td>
                                <td><i class="fas fa-door-open"></i> ${entry.room_number}</td>
                                <td><span class="badge">${formatLevelLabel(entry)}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        } else {
            container.innerHTML = '<div style="padding: 48px; text-align: center;"><i class="fas fa-calendar-times" style="font-size: 3rem; color: #cbd5e1; margin-bottom: 16px; display: block;"></i> No teaching assignments found.</div>';
        }
    } catch (error) {
        console.error('Error loading lecturer timetable:', error);
    }
}

async function loadLecturerCourses() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div class="page-header">
            <div class="breadcrumb"><span>LECTURER</span><span>ACADEMIC</span><span>COURSES</span></div>
            <h1>My Assigned Courses</h1>
        </div>
        <div id="lecturerCoursesList" class="grid-3" style="margin-top: var(--spacing-6);"><div class="spinner"></div></div>
    `;
    try {
        const response = await fetch(`${API_URL}/dashboard/lecturer-timetable`, { headers: getAuthHeaders() });
        const data = await response.json();
        const container = document.getElementById('lecturerCoursesList');
        if (data.success && data.data.length > 0) {
            const uniqueCourses = [];
            const seen = new Set();
            data.data.forEach(entry => {
                if (!seen.has(entry.course_id)) {
                    seen.add(entry.course_id);
                    uniqueCourses.push(entry);
                }
            });
            container.innerHTML = uniqueCourses.map(course => `
                <div class="card">
                    <span class="badge" style="margin-bottom: 12px; display: inline-block; background: var(--primary-light); color: var(--primary);">${course.course_code}</span>
                    <h3 style="margin-bottom: 12px;">${course.course_name}</h3>
                    <div style="display: flex; gap: 16px; font-size: 0.85rem; color: var(--text-secondary);">
                        <span><i class="fas fa-users"></i> Target: ${formatLevelLabel(course)}</span>
                    </div>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<p>No assigned courses found.</p>';
        }
    } catch (error) {
        console.error('Error loading lecturer courses:', error);
    }
}

// Student Dashboard
async function loadStudentDashboard() {
    const contentArea = document.getElementById('contentArea');
    const user = JSON.parse(localStorage.getItem('user'));
    
    // Build student info details
    const studentInfoDetails = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--spacing-4);">
            <div style="display: flex; align-items: center; gap: var(--spacing-3);">
                <i class="fas fa-building" style="font-size: 1.5rem; opacity: 0.7;"></i>
                <div>
                    <span style="display: block; font-size: 0.75rem; opacity: 0.8; font-weight: 600; text-transform: uppercase;">Department</span>
                    <span style="display: block; font-size: 1rem; font-weight: 600;">${user.department_name || 'N/A'}</span>
                </div>
            </div>
            <div style="display: flex; align-items: center; gap: var(--spacing-3);">
                <i class="fas fa-graduation-cap" style="font-size: 1.5rem; opacity: 0.7;"></i>
                <div>
                    <span style="display: block; font-size: 0.75rem; opacity: 0.8; font-weight: 600; text-transform: uppercase;">Specialty</span>
                    <span style="display: block; font-size: 1rem; font-weight: 600;">${user.specialty_name || 'N/A'}</span>
                </div>
            </div>
            <div style="display: flex; align-items: center; gap: var(--spacing-3);">
                <i class="fas fa-layer-group" style="font-size: 1.5rem; opacity: 0.7;"></i>
                <div>
                    <span style="display: block; font-size: 0.75rem; opacity: 0.8; font-weight: 600; text-transform: uppercase;">Level</span>
                    <span style="display: block; font-size: 1rem; font-weight: 600;">${user.level_name || 'N/A'}</span>
                    <span style="display: block; font-size: 0.75rem; opacity: 0.7; margin-top: 0.25rem;">ID: ${user.level_id || 'N/A'}</span>
                </div>
            </div>
        </div>
    `;

    contentArea.innerHTML = `
        <!-- User Info Card -->
        <div class="card" style="margin-bottom: var(--spacing-8); background: linear-gradient(135deg, var(--primary) 0%, #6366f1 100%); color: white; border: none;">
            <div style="display: grid; grid-template-columns: auto 1fr; gap: var(--spacing-6); align-items: flex-start;">
                <div style="width: 80px; height: 80px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: bold;">
                    ${user.full_name.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h2 style="margin: 0; font-size: 1.75rem; margin-bottom: var(--spacing-2);">${user.full_name}</h2>
                    <div style="display: flex; gap: var(--spacing-4); margin-bottom: var(--spacing-3);">
                        <span><i class="fas fa-envelope" style="margin-right: 0.5rem;"></i>${user.email}</span>
                    </div>
                    <span style="background: rgba(255,255,255,0.2); padding: 0.5rem 1rem; border-radius: 9999px; display: inline-block; font-size: 0.875rem; font-weight: 600;">Student Account</span>
                </div>
            </div>
        </div>

        <!-- Academic Info Card -->
        <div class="card" style="margin-bottom: var(--spacing-8); background: #f8fafc; border: 1px solid #e2e8f0;">
            <h3 style="margin: 0 0 var(--spacing-4) 0; font-size: 1rem; font-weight: 700;">Academic Information</h3>
            ${studentInfoDetails}
        </div>

        <div class="page-header">
            <div class="breadcrumb"><span>STUDENT</span><span>DASHBOARD</span><span>TIMETABLE</span></div>
            <div class="flex justify-between items-center">
                <h1>My Class Timetable</h1>
                <div class="flex gap-2">
                    <button class="btn btn-outline btn-sm" onclick="window.print()"><i class="fas fa-print"></i> Print</button>
                    <button class="btn btn-primary btn-sm"><i class="fas fa-download"></i> Download PDF</button>
                </div>
            </div>
        </div>
        <div class="card">
            <div id="studentTimetable" style="overflow-x: auto;"><div class="spinner"></div></div>
        </div>
    `;
    try {
        const response = await fetch(`${API_URL}/timetable`, { headers: getAuthHeaders() });
        const data = await response.json();
        const container = document.getElementById('studentTimetable');
        if (data.success && data.data.length > 0) {
            container.innerHTML = `
                <table class="data-table">
                    <thead><tr><th>Day</th><th>Time</th><th>Course</th><th>Lecturer</th><th>Room</th><th>Level</th></tr></thead>
                    <tbody>
                        ${data.data.map(entry => `
                            <tr>
                                <td style="font-weight: 600; color: var(--primary);">${entry.day_of_week}</td>
                                <td><span class="badge" style="background: #f1f5f9; color: #475569;">${entry.start_time} - ${entry.end_time}</span></td>
                                <td><strong>${entry.course_code}</strong><br><small style="color: var(--text-secondary)">${entry.course_name}</small></td>
                                <td>${entry.lecturer_name || 'N/A'}</td>
                                <td><i class="fas fa-map-marker-alt"></i> ${entry.room_number}</td>
                                <td><span class="badge">${formatLevelLabel(entry)}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        } else {
            container.innerHTML = '<div style="padding: 40px; text-align: center;">No timetable entries assigned yet.</div>';
        }
    } catch (error) {
        console.error('Error loading student timetable:', error);
    }
}

async function loadStudentCourses() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div class="page-header">
            <div class="breadcrumb"><span>STUDENT</span><span>ACADEMIC</span><span>COURSES</span></div>
            <h1>My Registered Courses</h1>
        </div>
        <div id="studentCoursesList" class="grid-3" style="margin-top: var(--spacing-6);"><div class="spinner"></div></div>
    `;
    try {
        const response = await fetch(`${API_URL}/courses`, { headers: getAuthHeaders() });
        const data = await response.json();
        const container = document.getElementById('studentCoursesList');
        if (data.success && data.data.length > 0) {
            container.innerHTML = data.data.map(course => `
                <div class="card">
                    <span class="badge" style="margin-bottom: 12px; display: inline-block; background: var(--primary-light); color: var(--primary);">${course.course_code}</span>
                    <h3 style="margin-bottom: 12px;">${course.course_name}</h3>
                    <div style="display: flex; gap: 16px; font-size: 0.85rem; color: var(--text-secondary);">
                        <span><i class="fas fa-layer-group"></i> ${formatLevelLabel(course)}</span>
                    </div>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<p>No courses found.</p>';
        }
    } catch (error) {
        console.error('Error loading student courses:', error);
    }
}

function handleStudentTab(tab) {
    if (tab === 'profile') loadProfile();
    else if (tab === 'courses') loadStudentCourses();
    else if (tab === 'notifications') loadNotificationsView();
    else loadStudentDashboard();
}

function handleLecturerTab(tab) {
    if (tab === 'profile') loadProfile();
    else if (tab === 'courses') loadLecturerCourses();
    else if (tab === 'notifications') loadNotificationsView();
    else loadLecturerDashboard();
}

async function loadNotificationsView() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div class="page-header">
            <div class="breadcrumb"><span>SYSTEM</span><span>COMMUNICATION</span><span>NOTIFICATIONS</span></div>
            <div class="flex justify-between items-center">
                <h1>All Notifications</h1>
                <button class="btn btn-outline btn-sm" onclick="markAllAsRead()">Mark all as read</button>
            </div>
        </div>
        <div class="card" id="fullNotifList"><div class="spinner"></div></div>
    `;
    try {
        const response = await fetch(`${API_URL}/dashboard/notifications`, { headers: getAuthHeaders() });
        const data = await response.json();
        const container = document.getElementById('fullNotifList');
        if (data.success && data.data.length > 0) {
            container.innerHTML = `
                <div class="notification-full-list">
                    ${data.data.map(n => `
                        <div class="notif-full-item ${n.is_read ? '' : 'unread'}" style="padding: 20px; border-bottom: 1px solid var(--border-color); cursor: pointer;" onclick="markAsRead(${n.id})">
                            <div class="flex justify-between items-start">
                                <div>
                                    <h4 style="margin: 0 0 8px 0; color: ${n.is_read ? 'var(--text-main)' : 'var(--primary)'}">${n.title}</h4>
                                    <p style="margin: 0; color: var(--text-secondary);">${n.message}</p>
                                </div>
                                <span style="font-size: 0.75rem; color: var(--text-muted);">${new Date(n.created_at).toLocaleString()}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            container.innerHTML = '<div style="padding: 40px; text-align: center;">No notifications found.</div>';
        }
    } catch (error) {
        console.error('Error loading notifications view:', error);
    }
}

async function loadProfile() {
    const contentArea = document.getElementById('contentArea');
    const user = JSON.parse(localStorage.getItem('user'));
    contentArea.innerHTML = `
        <div class="page-header">
            <div class="breadcrumb"><span>USER</span><span>PROFILE</span></div>
            <h1>My Profile Settings</h1>
        </div>
        <div class="card" style="max-width: 600px;">
            <form id="profileForm" onsubmit="handleProfileUpdate(event)">
                <div class="profile-image-section" style="margin-bottom: 32px; text-align: center;">
                    <div id="imagePreview" style="width: 120px; height: 120px; border-radius: 50%; background: #f1f5f9; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; overflow: hidden; border: 2px solid var(--primary-light);">
                        ${user.profile_image ? `<img src="${user.profile_image}" style="width: 100%; height: 100%; object-fit: cover;">` : `<i class="fas fa-user" style="font-size: 3rem; color: #94a3b8;"></i>`}
                    </div>
                    <label class="btn btn-outline btn-sm" style="cursor: pointer;">
                        <i class="fas fa-camera"></i> Change Photo
                        <input type="file" id="profileImageInput" accept="image/*" style="display: none;" onchange="previewProfileImage(this)">
                    </label>
                </div>
                <div class="form-group">
                    <label>Full Name</label>
                    <input type="text" id="profileName" value="${user.full_name}" required class="input-field">
                </div>
                <div class="form-group">
                    <label>Email Address</label>
                    <input type="email" id="profileEmail" value="${user.email}" required class="input-field">
                </div>
                <div class="form-group">
                    <label>New Password (Optional)</label>
                    <input type="password" id="profilePassword" placeholder="Enter new password to change" class="input-field">
                </div>
                <div style="margin-top: 24px;"><button type="submit" class="btn btn-primary">Save Changes</button></div>
                <div id="profileMessage" style="margin-top: 16px;"></div>
            </form>
        </div>
    `;
}

function previewProfileImage(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('imagePreview').innerHTML = `<img src="${e.target.result}" style="width: 100%; height: 100%; object-fit: cover;">`;
        }
        reader.readAsDataURL(input.files[0]);
    }
}

async function handleProfileUpdate(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    const msg = document.getElementById('profileMessage');
    const full_name = document.getElementById('profileName').value;
    const email = document.getElementById('profileEmail').value;
    const password = document.getElementById('profilePassword').value;
    const imageInput = document.getElementById('profileImageInput');
    let profile_image = JSON.parse(localStorage.getItem('user')).profile_image;
    if (imageInput.files && imageInput.files[0]) {
        profile_image = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(imageInput.files[0]);
        });
    }
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    try {
        const response = await fetch(`${API_URL}/users/me`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ full_name, email, password, profile_image })
        });
        const data = await response.json();
        if (data.success) {
            msg.innerHTML = '<div class="success-message" style="display:block;">Profile updated successfully!</div>';
            const user = JSON.parse(localStorage.getItem('user'));
            user.full_name = full_name;
            user.email = email;
            user.profile_image = profile_image;
            localStorage.setItem('user', JSON.stringify(user));
            updateUserProfileUI();
        } else {
            msg.innerHTML = `<div class="error-message" style="display:block;">${data.message}</div>`;
        }
    } catch (error) {
        msg.innerHTML = '<div class="error-message" style="display:block;">Failed to update profile.</div>';
    } finally {
        btn.disabled = false;
        btn.textContent = 'Save Changes';
    }
}

function updateUserProfileUI() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;
    const nameEls = [document.getElementById('userName')];
    const avatarEls = [document.getElementById('userAvatar')];
    nameEls.forEach(el => { if (el) el.textContent = user.full_name; });
    avatarEls.forEach(el => {
        if (el) {
            if (user.profile_image) el.innerHTML = `<img src="${user.profile_image}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
            else el.textContent = user.full_name.charAt(0).toUpperCase();
        }
    });
}

function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'Login.html';
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(updateUserProfileUI, 500);
});