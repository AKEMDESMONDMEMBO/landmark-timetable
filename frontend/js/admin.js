// Admin Management Features
var API_URL = API_URL || 'http://localhost:5000/api';

// Modal Management
function createModal(id, title, content) {
    console.log('🎯 Creating modal:', id, title);
    const modal = document.createElement('div');
    modal.id = id;
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="closeModal('${id}')">&times;</span>
            <h2>${title}</h2>
            ${content}
        </div>
    `;
    document.body.appendChild(modal);
    console.log('✅ Modal created and appended to body');
}

function openModal(id) {
    console.log('🎯 Opening modal:', id);
    document.getElementById(id).style.display = 'block';
}

function closeModal(id) {
    console.log('🎯 Closing modal:', id);
    document.getElementById(id).style.display = 'none';
}

// ==================== DEPARTMENTS ====================
async function loadDepartments() {
    console.log('🔄 Loading departments...');
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div class="management-container">
            <div class="header-section">
                <h2>Department Management</h2>
                <button class="btn-primary" onclick="openModalDeptCreate()">+ Add Department</button>
            </div>
            <div id="departmentsList" class="data-table-container"></div>
        </div>
    `;

    try {
        console.log('📡 Fetching departments from API...');
        const response = await fetch(`${API_URL}/departments`, {
            headers: getAuthHeaders()
        });
        console.log('📡 Departments response status:', response.status);
        const data = await response.json();
        console.log('📡 Departments data:', data);

        if (data.success) {
            renderDepartmentsTable(data.data);
            console.log('✅ Departments loaded successfully');
        } else {
            console.error('❌ Departments API failed:', data.message);
            document.getElementById('departmentsList').innerHTML = `<p class="error">Error: ${data.message}</p>`;
        }
    } catch (error) {
        console.error('❌ Error loading departments:', error);
        document.getElementById('departmentsList').innerHTML = `<p class="error">Error loading departments</p>`;
    }
}

function renderDepartmentsTable(departments) {
    const html = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Department Name</th>
                    <th>Code</th>
                    <th>Description</th>
                    <th>Specialties</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${departments.map(dept => `
                    <tr>
                        <td><strong>${dept.name}</strong></td>
                        <td><span class="badge">${dept.code}</span></td>
                        <td>${dept.description || 'N/A'}</td>
                        <td>${dept.specialty_count || 0}</td>
                        <td class="actions">
                            <button class="btn-sm btn-primary" onclick="editDepartment(${dept.id}, '${dept.name}', '${dept.code}', '${dept.description || ''}')">Edit</button>
                            <button class="btn-sm btn-danger" onclick="deleteDepartment(${dept.id})">Delete</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    document.getElementById('departmentsList').innerHTML = html;
}

function openModalDeptCreate() {
    const content = `
        <form onsubmit="saveDepartment(event)" class="form-modal">
            <div class="form-group">
                <label>Department Name *</label>
                <input type="text" id="deptName" required placeholder="e.g., Computer Science">
            </div>
            <div class="form-group">
                <label>Code *</label>
                <input type="text" id="deptCode" required placeholder="e.g., CS" maxlength="10">
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea id="deptDesc" placeholder="Department description" rows="3"></textarea>
            </div>
            <div class="form-actions">
                <button type="submit" class="btn-primary">Save Department</button>
                <button type="button" class="btn-secondary" onclick="closeModal('deptModal')">Cancel</button>
            </div>
        </form>
    `;
    createModal('deptModal', 'Create Department', content);
    openModal('deptModal');
}

async function saveDepartment(event) {
    event.preventDefault();
    const name = document.getElementById('deptName').value;
    const code = document.getElementById('deptCode').value;
    const description = document.getElementById('deptDesc').value;
    
    try {
        const response = await fetch(`${API_URL}/departments`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ name, code, description })
        });
        
        const data = await response.json();
        if (data.success) {
            closeModal('deptModal');
            loadDepartments();
            showNotification('Department created successfully!', 'success');
        } else {
            showNotification(data.message, 'error');
        }
    } catch (error) {
        showNotification('Error saving department', 'error');
    }
}

function editDepartment(id, name, code, description) {
    const content = `
        <form onsubmit="updateDepartment(event, ${id})" class="form-modal">
            <div class="form-group">
                <label>Department Name *</label>
                <input type="text" id="editDeptName" value="${name}" required>
            </div>
            <div class="form-group">
                <label>Code *</label>
                <input type="text" id="editDeptCode" value="${code}" required>
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea id="editDeptDesc" rows="3">${description}</textarea>
            </div>
            <div class="form-actions">
                <button type="submit" class="btn-primary">Update Department</button>
                <button type="button" class="btn-secondary" onclick="closeModal('editDeptModal')">Cancel</button>
            </div>
        </form>
    `;
    createModal('editDeptModal', 'Edit Department', content);
    openModal('editDeptModal');
}

async function updateDepartment(event, id) {
    event.preventDefault();
    const name = document.getElementById('editDeptName').value;
    const code = document.getElementById('editDeptCode').value;
    const description = document.getElementById('editDeptDesc').value;
    
    try {
        const response = await fetch(`${API_URL}/departments/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ name, code, description })
        });
        
        const data = await response.json();
        if (data.success) {
            closeModal('editDeptModal');
            loadDepartments();
            showNotification('Department updated successfully!', 'success');
        } else {
            showNotification(data.message, 'error');
        }
    } catch (error) {
        showNotification('Error updating department', 'error');
    }
}

async function deleteDepartment(id) {
    if (confirm('Are you sure you want to delete this department?')) {
        try {
            const response = await fetch(`${API_URL}/departments/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            
            const data = await response.json();
            if (data.success) {
                loadDepartments();
                showNotification('Department deleted successfully!', 'success');
            } else {
                showNotification(data.message, 'error');
            }
        } catch (error) {
            showNotification('Error deleting department', 'error');
        }
    }
}

// ==================== SPECIALTIES ====================
async function loadSpecialties() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div class="management-container">
            <div class="header-section">
                <h2>Specialty Management</h2>
                <button class="btn-primary" onclick="openModalSpecCreate()">+ Add Specialty</button>
            </div>
            <div id="specialtiesList" class="data-table-container"></div>
        </div>
    `;
    
    try {
        const response = await fetch(`${API_URL}/specialties`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        
        if (data.success) {
            renderSpecialtiesTable(data.data);
        }
    } catch (error) {
        console.error('Error loading specialties:', error);
        document.getElementById('specialtiesList').innerHTML = `<p class="error">Error loading specialties</p>`;
    }
}

function renderSpecialtiesTable(specialties) {
    const html = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Specialty Name</th>
                    <th>Code</th>
                    <th>Department</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${specialties.map(spec => `
                    <tr>
                        <td><strong>${spec.name}</strong></td>
                        <td><span class="badge">${spec.code}</span></td>
                        <td>${spec.department_name || 'N/A'}</td>
                        <td class="actions">
                            <button class="btn-sm btn-primary" onclick="editSpecialty(${spec.id}, '${spec.name}', '${spec.code}', ${spec.department_id})">Edit</button>
                            <button class="btn-sm btn-danger" onclick="deleteSpecialty(${spec.id})">Delete</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    document.getElementById('specialtiesList').innerHTML = html;
}

async function openModalSpecCreate() {
    const deptResponse = await fetch(`${API_URL}/departments`, {
        headers: getAuthHeaders()
    });
    const deptData = await deptResponse.json();
    const deptOptions = deptData.data.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
    
    const content = `
        <form onsubmit="saveSpecialty(event)" class="form-modal">
            <div class="form-group">
                <label>Specialty Name *</label>
                <input type="text" id="specName" required placeholder="e.g., Artificial Intelligence">
            </div>
            <div class="form-group">
                <label>Code *</label>
                <input type="text" id="specCode" required placeholder="e.g., AI" maxlength="20">
            </div>
            <div class="form-group">
                <label>Department *</label>
                <select id="specDept" required>
                    <option value="">Select Department</option>
                    ${deptOptions}
                </select>
            </div>
            <div class="form-actions">
                <button type="submit" class="btn-primary">Save Specialty</button>
                <button type="button" class="btn-secondary" onclick="closeModal('specModal')">Cancel</button>
            </div>
        </form>
    `;
    createModal('specModal', 'Create Specialty', content);
    openModal('specModal');
}

async function saveSpecialty(event) {
    event.preventDefault();
    const name = document.getElementById('specName').value;
    const code = document.getElementById('specCode').value;
    const department_id = document.getElementById('specDept').value;
    
    try {
        const response = await fetch(`${API_URL}/specialties`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ name, code, department_id })
        });
        
        const data = await response.json();
        if (data.success) {
            closeModal('specModal');
            loadSpecialties();
            showNotification('Specialty created successfully!', 'success');
        } else {
            showNotification(data.message, 'error');
        }
    } catch (error) {
        showNotification('Error saving specialty', 'error');
    }
}

async function editSpecialty(id, name, code, deptId) {
    const deptResponse = await fetch(`${API_URL}/departments`, {
        headers: getAuthHeaders()
    });
    const deptData = await deptResponse.json();
    const deptOptions = deptData.data.map(d => `<option value="${d.id}" ${d.id === deptId ? 'selected' : ''}>${d.name}</option>`).join('');
    
    const content = `
        <form onsubmit="updateSpecialty(event, ${id})" class="form-modal">
            <div class="form-group">
                <label>Specialty Name *</label>
                <input type="text" id="editSpecName" value="${name}" required>
            </div>
            <div class="form-group">
                <label>Code *</label>
                <input type="text" id="editSpecCode" value="${code}" required>
            </div>
            <div class="form-group">
                <label>Department *</label>
                <select id="editSpecDept" required>
                    ${deptOptions}
                </select>
            </div>
            <div class="form-actions">
                <button type="submit" class="btn-primary">Update Specialty</button>
                <button type="button" class="btn-secondary" onclick="closeModal('editSpecModal')">Cancel</button>
            </div>
        </form>
    `;
    createModal('editSpecModal', 'Edit Specialty', content);
    openModal('editSpecModal');
}

async function updateSpecialty(event, id) {
    event.preventDefault();
    const name = document.getElementById('editSpecName').value;
    const code = document.getElementById('editSpecCode').value;
    const department_id = document.getElementById('editSpecDept').value;
    
    try {
        const response = await fetch(`${API_URL}/specialties/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ name, code, department_id })
        });
        
        const data = await response.json();
        if (data.success) {
            closeModal('editSpecModal');
            loadSpecialties();
            showNotification('Specialty updated successfully!', 'success');
        } else {
            showNotification(data.message, 'error');
        }
    } catch (error) {
        showNotification('Error updating specialty', 'error');
    }
}

async function deleteSpecialty(id) {
    if (confirm('Are you sure you want to delete this specialty?')) {
        try {
            const response = await fetch(`${API_URL}/specialties/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            
            const data = await response.json();
            if (data.success) {
                loadSpecialties();
                showNotification('Specialty deleted successfully!', 'success');
            } else {
                showNotification(data.message, 'error');
            }
        } catch (error) {
            showNotification('Error deleting specialty', 'error');
        }
    }
}

// ==================== COURSES ====================
async function loadCourses() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div class="management-container">
            <div class="header-section">
                <h2>Course Management</h2>
                <button class="btn-primary" onclick="openModalCourseCreate()">+ Add Course</button>
            </div>
            <div id="coursesList" class="data-table-container"></div>
        </div>
    `;
    
    try {
        const response = await fetch(`${API_URL}/courses`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        
        if (data.success) {
            renderCoursesTable(data.data);
        }
    } catch (error) {
        console.error('Error loading courses:', error);
        document.getElementById('coursesList').innerHTML = `<p class="error">Error loading courses</p>`;
    }
}

function renderCoursesTable(courses) {
    const html = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Course Code</th>
                    <th>Course Name</th>
                    <th>Credits</th>
                    <th>Department</th>
                    <th>Level</th>
                    <th>Semester</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${courses.map(course => `
                    <tr>
                        <td><span class="badge">${course.course_code}</span></td>
                        <td><strong>${course.course_name}</strong></td>
                        <td>${course.credits}</td>
                        <td>${course.department_name || 'N/A'}</td>
                        <td>${course.level_number || 'N/A'}</td>
                        <td>${course.semester}</td>
                        <td class="actions">
                            <button class="btn-sm btn-primary" onclick="editCourse(${course.id})">Edit</button>
                            <button class="btn-sm btn-danger" onclick="deleteCourse(${course.id})">Delete</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    document.getElementById('coursesList').innerHTML = html;
}

async function openModalCourseCreate() {
    const [deptResponse, levelResponse] = await Promise.all([
        fetch(`${API_URL}/departments`, { headers: getAuthHeaders() }),
        fetch(`${API_URL}/dashboard/levels`, { headers: getAuthHeaders() })
    ]);
    
    const deptData = await deptResponse.json();
    const levelData = await levelResponse.json();
    
    const deptOptions = deptData.data.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
    const levelOptions = levelData.data.map(l => `<option value="${l.id}">${l.name}</option>`).join('');
    
    const content = `
        <form onsubmit="saveCourse(event)" class="form-modal">
            <div class="form-group">
                <label>Course Code *</label>
                <input type="text" id="courseCode" required placeholder="e.g., CS101">
            </div>
            <div class="form-group">
                <label>Course Name *</label>
                <input type="text" id="courseName" required placeholder="e.g., Introduction to Programming">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Credits *</label>
                    <input type="number" id="courseCredits" required min="1" value="3">
                </div>
                <div class="form-group">
                    <label>Semester *</label>
                    <select id="courseSemester" required>
                        <option value="1">Semester 1</option>
                        <option value="2">Semester 2</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Department *</label>
                    <select id="courseDept" required>
                        <option value="">Select Department</option>
                        ${deptOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label>Level *</label>
                    <select id="courseLevel" required>
                        <option value="">Select Level</option>
                        ${levelOptions}
                    </select>
                </div>
            </div>
            <div class="form-actions">
                <button type="submit" class="btn-primary">Save Course</button>
                <button type="button" class="btn-secondary" onclick="closeModal('courseModal')">Cancel</button>
            </div>
        </form>
    `;
    createModal('courseModal', 'Create Course', content);
    openModal('courseModal');
}

async function saveCourse(event) {
    event.preventDefault();
    const courseData = {
        course_code: document.getElementById('courseCode').value,
        course_name: document.getElementById('courseName').value,
        credits: parseInt(document.getElementById('courseCredits').value),
        semester: parseInt(document.getElementById('courseSemester').value),
        department_id: document.getElementById('courseDept').value,
        level_id: document.getElementById('courseLevel').value
    };
    
    try {
        const response = await fetch(`${API_URL}/courses`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(courseData)
        });
        
        const data = await response.json();
        if (data.success) {
            closeModal('courseModal');
            loadCourses();
            showNotification('Course created successfully!', 'success');
        } else {
            showNotification(data.message, 'error');
        }
    } catch (error) {
        showNotification('Error saving course', 'error');
    }
}

async function editCourse(id) {
    try {
        const courseRes = await fetch(`${API_URL}/courses/${id}`, {
            headers: getAuthHeaders()
        });
        const courseData = await courseRes.json();
        const course = courseData.data;
        
        const [deptResponse, levelResponse] = await Promise.all([
            fetch(`${API_URL}/departments`, { headers: getAuthHeaders() }),
            fetch(`${API_URL}/dashboard/levels`, { headers: getAuthHeaders() })
        ]);
        
        const deptData = await deptResponse.json();
        const levelData = await levelResponse.json();
        
        const deptOptions = deptData.data.map(d => `<option value="${d.id}" ${d.id === course.department_id ? 'selected' : ''}>${d.name}</option>`).join('');
        const levelOptions = levelData.data.map(l => `<option value="${l.id}" ${l.id === course.level_id ? 'selected' : ''}>${l.name}</option>`).join('');
        
        const content = `
            <form onsubmit="updateCourse(event, ${id})" class="form-modal">
                <div class="form-group">
                    <label>Course Code *</label>
                    <input type="text" id="editCourseCode" value="${course.course_code}" required>
                </div>
                <div class="form-group">
                    <label>Course Name *</label>
                    <input type="text" id="editCourseName" value="${course.course_name}" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Credits *</label>
                        <input type="number" id="editCourseCredits" value="${course.credits}" required min="1" max="10">
                    </div>
                    <div class="form-group">
                        <label>Semester *</label>
                        <select id="editCourseSemester" required>
                            <option value="1" ${course.semester === 1 ? 'selected' : ''}>Semester 1</option>
                            <option value="2" ${course.semester === 2 ? 'selected' : ''}>Semester 2</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Department *</label>
                        <select id="editCourseDept" required>
                            ${deptOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Level *</label>
                        <select id="editCourseLevel" required>
                            ${levelOptions}
                        </select>
                    </div>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn-primary">Update Course</button>
                    <button type="button" class="btn-secondary" onclick="closeModal('editCourseModal')">Cancel</button>
                </div>
            </form>
        `;
        createModal('editCourseModal', 'Edit Course', content);
        openModal('editCourseModal');
    } catch (error) {
        showNotification('Error loading course for editing', 'error');
    }
}

async function updateCourse(event, id) {
    event.preventDefault();
    const courseData = {
        course_code: document.getElementById('editCourseCode').value,
        course_name: document.getElementById('editCourseName').value,
        credits: parseInt(document.getElementById('editCourseCredits').value),
        semester: parseInt(document.getElementById('editCourseSemester').value),
        department_id: document.getElementById('editCourseDept').value,
        level_id: document.getElementById('editCourseLevel').value
    };
    
    try {
        const response = await fetch(`${API_URL}/courses/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(courseData)
        });
        
        const data = await response.json();
        if (data.success) {
            closeModal('editCourseModal');
            loadCourses();
            showNotification('Course updated successfully!', 'success');
        } else if (data.errors) {
            showNotification(data.errors.join(', '), 'error');
        } else {
            showNotification(data.message, 'error');
        }
    } catch (error) {
        showNotification('Error updating course', 'error');
    }
}

async function deleteCourse(id) {
    if (confirm('Are you sure you want to delete this course?')) {
        try {
            const response = await fetch(`${API_URL}/courses/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            
            const data = await response.json();
            if (data.success) {
                loadCourses();
                showNotification('Course deleted successfully!', 'success');
            } else {
                showNotification(data.message, 'error');
            }
        } catch (error) {
            showNotification('Error deleting course', 'error');
        }
    }
}

// ==================== LECTURERS ====================
async function loadLecturers() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div class="management-container">
            <div class="header-section">
                <h2>Lecturer Management</h2>
                <button class="btn-primary" onclick="openModalLecturerCreate()">+ Add Lecturer</button>
            </div>
            <div id="lecturersList" class="data-table-container"></div>
        </div>
    `;
    
    try {
        const response = await fetch(`${API_URL}/lecturers`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        
        if (data.success) {
            renderLecturersTable(data.data);
        }
    } catch (error) {
        console.error('Error loading lecturers:', error);
        document.getElementById('lecturersList').innerHTML = `<p class="error">Error loading lecturers</p>`;
    }
}

function renderLecturersTable(lecturers) {
    const html = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Employee ID</th>
                    <th>Department</th>
                    <th>Specialization</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${lecturers.map(lecturer => `
                    <tr>
                        <td><strong>${lecturer.user_name || 'N/A'}</strong></td>
                        <td><span class="badge">${lecturer.employee_id}</span></td>
                        <td>${lecturer.department_name || 'N/A'}</td>
                        <td>${lecturer.specialization || 'N/A'}</td>
                        <td class="actions">
                            <button class="btn-sm btn-primary" onclick="editLecturer(${lecturer.id})">Edit</button>
                            <button class="btn-sm btn-danger" onclick="deleteLecturer(${lecturer.id})">Delete</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    document.getElementById('lecturersList').innerHTML = html;
}

async function openModalLecturerCreate() {
    const [deptResponse, userResponse] = await Promise.all([
        fetch(`${API_URL}/departments`, { headers: getAuthHeaders() }),
        fetch(`${API_URL}/users`, { headers: getAuthHeaders() })
    ]);
    
    const deptData = await deptResponse.json();
    const userData = await userResponse.json();
    
    const deptOptions = deptData.data.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
    const userOptions = userData.data.filter(u => u.role === 'lecturer').map(u => `<option value="${u.id}">${u.full_name}</option>`).join('');
    
    const content = `
        <form onsubmit="saveLecturer(event)" class="form-modal">
            <div class="form-group">
                <label>User *</label>
                <select id="lecturerUser" required>
                    <option value="">Select Lecturer</option>
                    ${userOptions}
                </select>
            </div>
            <div class="form-group">
                <label>Employee ID *</label>
                <input type="text" id="lecturerEmpId" required placeholder="e.g., LEC001">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Department</label>
                    <select id="lecturerDept">
                        <option value="">Select Department</option>
                        ${deptOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label>Specialization</label>
                    <input type="text" id="lecturerSpec" placeholder="e.g., Artificial Intelligence">
                </div>
            </div>
            <div class="form-actions">
                <button type="submit" class="btn-primary">Save Lecturer</button>
                <button type="button" class="btn-secondary" onclick="closeModal('lecturerModal')">Cancel</button>
            </div>
        </form>
    `;
    createModal('lecturerModal', 'Create Lecturer', content);
    openModal('lecturerModal');
}

async function saveLecturer(event) {
    event.preventDefault();
    const lecturerData = {
        user_id: document.getElementById('lecturerUser').value,
        employee_id: document.getElementById('lecturerEmpId').value,
        department_id: document.getElementById('lecturerDept').value || null,
        specialization: document.getElementById('lecturerSpec').value
    };
    
    try {
        const response = await fetch(`${API_URL}/lecturers`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(lecturerData)
        });
        
        const data = await response.json();
        if (data.success) {
            closeModal('lecturerModal');
            loadLecturers();
            showNotification('Lecturer created successfully!', 'success');
        } else {
            showNotification(data.message, 'error');
        }
    } catch (error) {
        showNotification('Error saving lecturer', 'error');
    }
}

async function editLecturer(id) {
    try {
        const lecturerRes = await fetch(`${API_URL}/lecturers/${id}`, {
            headers: getAuthHeaders()
        });
        const lecturerData = await lecturerRes.json();
        const lecturer = lecturerData.data;
        
        const deptResponse = await fetch(`${API_URL}/departments`, {
            headers: getAuthHeaders()
        });
        
        const deptData = await deptResponse.json();
        const deptOptions = deptData.data.map(d => `<option value="${d.id}" ${d.id === lecturer.department_id ? 'selected' : ''}>${d.name}</option>`).join('');
        
        const content = `
            <form onsubmit="updateLecturer(event, ${id})" class="form-modal">
                <div class="form-group">
                    <label>Employee ID *</label>
                    <input type="text" id="editLecturerEmpId" value="${lecturer.employee_id}" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Department</label>
                        <select id="editLecturerDept">
                            <option value="">Select Department</option>
                            ${deptOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Specialization</label>
                        <input type="text" id="editLecturerSpec" value="${lecturer.specialization || ''}" placeholder="e.g., Artificial Intelligence">
                    </div>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn-primary">Update Lecturer</button>
                    <button type="button" class="btn-secondary" onclick="closeModal('editLecturerModal')">Cancel</button>
                </div>
            </form>
        `;
        createModal('editLecturerModal', 'Edit Lecturer', content);
        openModal('editLecturerModal');
    } catch (error) {
        showNotification('Error loading lecturer for editing', 'error');
    }
}

async function updateLecturer(event, id) {
    event.preventDefault();
    const lecturerData = {
        department_id: document.getElementById('editLecturerDept').value || null,
        specialization: document.getElementById('editLecturerSpec').value
    };
    
    try {
        const response = await fetch(`${API_URL}/lecturers/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(lecturerData)
        });
        
        const data = await response.json();
        if (data.success) {
            closeModal('editLecturerModal');
            loadLecturers();
            showNotification('Lecturer updated successfully!', 'success');
        } else if (data.errors) {
            showNotification(data.errors.join(', '), 'error');
        } else {
            showNotification(data.message, 'error');
        }
    } catch (error) {
        showNotification('Error updating lecturer', 'error');
    }
}

async function deleteLecturer(id) {
    if (confirm('Are you sure you want to delete this lecturer?')) {
        try {
            const response = await fetch(`${API_URL}/lecturers/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            
            const data = await response.json();
            if (data.success) {
                loadLecturers();
                showNotification('Lecturer deleted successfully!', 'success');
            } else {
                showNotification(data.message, 'error');
            }
        } catch (error) {
            showNotification('Error deleting lecturer', 'error');
        }
    }
}

// ==================== ROOMS ====================
async function loadRooms() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div class="management-container">
            <div class="header-section">
                <h2>Room Management</h2>
                <button class="btn-primary" onclick="openModalRoomCreate()">+ Add Room</button>
            </div>
            <div id="roomsList" class="data-table-container"></div>
        </div>
    `;
    
    try {
        const response = await fetch(`${API_URL}/rooms`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        
        if (data.success) {
            renderRoomsTable(data.data);
        }
    } catch (error) {
        console.error('Error loading rooms:', error);
        document.getElementById('roomsList').innerHTML = `<p class="error">Error loading rooms</p>`;
    }
}

function renderRoomsTable(rooms) {
    const html = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Room Number</th>
                    <th>Building</th>
                    <th>Capacity</th>
                    <th>Type</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${rooms.map(room => `
                    <tr>
                        <td><span class="badge">${room.room_number}</span></td>
                        <td><strong>${room.building}</strong></td>
                        <td>${room.capacity}</td>
                        <td>${room.type}</td>
                        <td class="actions">
                            <button class="btn-sm btn-primary" onclick="editRoom(${room.id})">Edit</button>
                            <button class="btn-sm btn-danger" onclick="deleteRoom(${room.id})">Delete</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    document.getElementById('roomsList').innerHTML = html;
}

function openModalRoomCreate() {
    const content = `
        <form onsubmit="saveRoom(event)" class="form-modal">
            <div class="form-group">
                <label>Room Number *</label>
                <input type="text" id="roomNumber" required placeholder="e.g., 101">
            </div>
            <div class="form-group">
                <label>Building *</label>
                <input type="text" id="roomBuilding" required placeholder="e.g., Main Building">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Capacity *</label>
                    <input type="number" id="roomCapacity" required min="1" value="50">
                </div>
                <div class="form-group">
                    <label>Type *</label>
                    <select id="roomType" required>
                        <option value="Classroom">Classroom</option>
                        <option value="Lecture Hall">Lecture Hall</option>
                        <option value="Laboratory">Laboratory</option>
                        <option value="Auditorium">Auditorium</option>
                    </select>
                </div>
            </div>
            <div class="form-actions">
                <button type="submit" class="btn-primary">Save Room</button>
                <button type="button" class="btn-secondary" onclick="closeModal('roomModal')">Cancel</button>
            </div>
        </form>
    `;
    createModal('roomModal', 'Create Room', content);
    openModal('roomModal');
}

async function saveRoom(event) {
    event.preventDefault();
    const roomData = {
        room_number: document.getElementById('roomNumber').value,
        building: document.getElementById('roomBuilding').value,
        capacity: parseInt(document.getElementById('roomCapacity').value),
        type: document.getElementById('roomType').value
    };
    
    try {
        const response = await fetch(`${API_URL}/rooms`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(roomData)
        });
        
        const data = await response.json();
        if (data.success) {
            closeModal('roomModal');
            loadRooms();
            showNotification('Room created successfully!', 'success');
        } else {
            showNotification(data.message, 'error');
        }
    } catch (error) {
        showNotification('Error saving room', 'error');
    }
}

async function editRoom(id) {
    try {
        const roomRes = await fetch(`${API_URL}/rooms/${id}`, {
            headers: getAuthHeaders()
        });
        const roomData = await roomRes.json();
        const room = roomData.data;
        
        const content = `
            <form onsubmit="updateRoom(event, ${id})" class="form-modal">
                <div class="form-group">
                    <label>Room Number *</label>
                    <input type="text" id="editRoomNumber" value="${room.room_number}" required>
                </div>
                <div class="form-group">
                    <label>Building *</label>
                    <input type="text" id="editRoomBuilding" value="${room.building}" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Capacity *</label>
                        <input type="number" id="editRoomCapacity" value="${room.capacity}" required min="1" max="500">
                    </div>
                    <div class="form-group">
                        <label>Type *</label>
                        <select id="editRoomType" required>
                            <option value="Classroom" ${room.type === 'Classroom' ? 'selected' : ''}>Classroom</option>
                            <option value="Lecture Hall" ${room.type === 'Lecture Hall' ? 'selected' : ''}>Lecture Hall</option>
                            <option value="Laboratory" ${room.type === 'Laboratory' ? 'selected' : ''}>Laboratory</option>
                            <option value="Auditorium" ${room.type === 'Auditorium' ? 'selected' : ''}>Auditorium</option>
                        </select>
                    </div>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn-primary">Update Room</button>
                    <button type="button" class="btn-secondary" onclick="closeModal('editRoomModal')">Cancel</button>
                </div>
            </form>
        `;
        createModal('editRoomModal', 'Edit Room', content);
        openModal('editRoomModal');
    } catch (error) {
        showNotification('Error loading room for editing', 'error');
    }
}

async function updateRoom(event, id) {
    event.preventDefault();
    const roomData = {
        room_number: document.getElementById('editRoomNumber').value,
        building: document.getElementById('editRoomBuilding').value,
        capacity: parseInt(document.getElementById('editRoomCapacity').value),
        type: document.getElementById('editRoomType').value
    };
    
    try {
        const response = await fetch(`${API_URL}/rooms/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(roomData)
        });
        
        const data = await response.json();
        if (data.success) {
            closeModal('editRoomModal');
            loadRooms();
            showNotification('Room updated successfully!', 'success');
        } else if (data.errors) {
            showNotification(data.errors.join(', '), 'error');
        } else {
            showNotification(data.message, 'error');
        }
    } catch (error) {
        showNotification('Error updating room', 'error');
    }
}

async function deleteRoom(id) {
    if (confirm('Are you sure you want to delete this room?')) {
        try {
            const response = await fetch(`${API_URL}/rooms/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            
            const data = await response.json();
            if (data.success) {
                loadRooms();
                showNotification('Room deleted successfully!', 'success');
            } else {
                showNotification(data.message, 'error');
            }
        } catch (error) {
            showNotification('Error deleting room', 'error');
        }
    }
}

// ==================== UTILITIES ====================
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function handleAdminTab(tab) {
    console.log('🎯 handleAdminTab called with tab:', tab);
    const pageTitle = document.getElementById('pageTitle');
    const tabs = {
        'dashboard': ['Dashboard', loadAdminDashboard],
        'departments': ['Department Management', loadDepartments],
        'specialties': ['Specialty Management', loadSpecialties],
        'courses': ['Course Management', loadCourses],
        'lecturers': ['Lecturer Management', loadLecturers],
        'rooms': ['Room Management', loadRooms],
        'users': ['User Management', loadUserManagement],
        'timetable': ['Timetable Management', loadTimetableManagement]
    };

    if (tabs[tab]) {
        console.log('✅ Found tab handler for:', tab);
        pageTitle.textContent = tabs[tab][0];
        console.log('🔄 Calling function:', tabs[tab][1].name);
        tabs[tab][1]();
    } else {
        console.error('❌ No handler found for tab:', tab);
    }
}

function setupAdminEventListeners() {
    // Already setup in dashboard.js initialization
}

function loadAdminDashboard() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon">📊</div>
                <h3>Total Users</h3>
                <p id="totalUsers">Loading...</p>
            </div>
            <div class="stat-card">
                <div class="stat-icon">📖</div>
                <h3>Total Courses</h3>
                <p id="totalCourses">Loading...</p>
            </div>
            <div class="stat-card">
                <div class="stat-icon">👨‍🏫</div>
                <h3>Total Lecturers</h3>
                <p id="totalLecturers">Loading...</p>
            </div>
            <div class="stat-card">
                <div class="stat-icon">📅</div>
                <h3>Timetable Entries</h3>
                <p id="totalEntries">Loading...</p>
            </div>
        </div>
    `;
    
    loadDashboardStats();
}

async function loadDashboardStats() {
    console.log('🔄 Loading dashboard stats...');
    try {
        console.log('📡 Fetching stats from API...');
        const response = await fetch(`${API_URL}/dashboard/stats`, {
            headers: getAuthHeaders()
        });
        console.log('📡 Stats response status:', response.status);
        const data = await response.json();
        console.log('📡 Stats data:', data);

        if (data.success) {
            document.getElementById('totalUsers').textContent = data.data.totalUsers;
            document.getElementById('totalCourses').textContent = data.data.totalCourses;
            document.getElementById('totalLecturers').textContent = data.data.totalLecturers;
            document.getElementById('totalEntries').textContent = data.data.totalEntries;
            console.log('✅ Dashboard stats loaded successfully');
        } else {
            console.error('❌ Stats API failed:', data.message);
        }
    } catch (error) {
        console.error('❌ Error loading stats:', error);
    }
}

async function loadUserManagement() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div class="management-container">
            <div class="header-section">
                <h2>User Management</h2>
                <button class="btn-primary" onclick="openModalUserCreate()">+ Add User</button>
            </div>
            <div id="usersList" class="data-table-container"></div>
        </div>
    `;
    
    try {
        const response = await fetch(`${API_URL}/users`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        
        if (data.success) {
            const html = `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Created At</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.data.map(user => `
                            <tr>
                                <td><strong>${user.full_name}</strong></td>
                                <td>${user.email}</td>
                                <td><span class="badge">${user.role}</span></td>
                                <td>${new Date(user.created_at).toLocaleDateString()}</td>
                                <td class="actions">
                                    <button class="btn-sm btn-danger" onclick="deleteUser(${user.id})">Delete</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
            document.getElementById('usersList').innerHTML = html;
        }
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

async function deleteUser(id) {
    if (confirm('Are you sure you want to delete this user?')) {
        try {
            const response = await fetch(`${API_URL}/users/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            
            const data = await response.json();
            if (data.success) {
                loadUserManagement();
                showNotification('User deleted successfully!', 'success');
            } else {
                showNotification(data.message, 'error');
            }
        } catch (error) {
            showNotification('Error deleting user', 'error');
        }
    }
}

async function loadTimetableManagement() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div class="management-container">
            <div class="header-section">
                <h2>Timetable Management</h2>
                <button class="btn-primary" onclick="openModalTimetableCreate()">+ Add Timetable Entry</button>
            </div>
            <div id="timetableList" class="data-table-container"></div>
        </div>
    `;
    
    try {
        const response = await fetch(`${API_URL}/timetable`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        
        if (data.success) {
            renderTimetableTable(data.data);
        }
    } catch (error) {
        console.error('Error loading timetable:', error);
        document.getElementById('timetableList').innerHTML = `<p class="error">Error loading timetable</p>`;
    }
}

function renderTimetableTable(timetable) {
    const html = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Course Code</th>
                    <th>Course Name</th>
                    <th>Lecturer</th>
                    <th>Room</th>
                    <th>Level</th>
                    <th>Day</th>
                    <th>Time</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${timetable.map(entry => `
                    <tr>
                        <td><span class="badge">${entry.course_code}</span></td>
                        <td><strong>${entry.course_name}</strong></td>
                        <td>${entry.lecturer_name || 'N/A'}</td>
                        <td>${entry.room_number}</td>
                        <td>${entry.level_number}</td>
                        <td>${entry.day_of_week}</td>
                        <td>${entry.start_time} - ${entry.end_time}</td>
                        <td class="actions">
                            <button class="btn-sm btn-danger" onclick="deleteTimetableEntry(${entry.id})">Delete</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    document.getElementById('timetableList').innerHTML = html;
}

async function openModalTimetableCreate() {
    const [courseRes, lecRes, roomRes, levelRes, slotRes] = await Promise.all([
        fetch(`${API_URL}/courses`, { headers: getAuthHeaders() }),
        fetch(`${API_URL}/lecturers`, { headers: getAuthHeaders() }),
        fetch(`${API_URL}/rooms`, { headers: getAuthHeaders() }),
        fetch(`${API_URL}/dashboard/levels`, { headers: getAuthHeaders() }),
        fetch(`${API_URL}/dashboard/timeslots`, { headers: getAuthHeaders() })
    ]);
    
    const courseData = await courseRes.json();
    const lecData = await lecRes.json();
    const roomData = await roomRes.json();
    const levelData = await levelRes.json();
    const slotData = await slotRes.json();
    
    const courseOptions = courseData.data.map(c => `<option value="${c.id}">${c.course_code} - ${c.course_name}</option>`).join('');
    const lecOptions = lecData.data.map(l => `<option value="${l.id}">${l.user_id ? l.user_name : 'Unknown'}</option>`).join('');  // Using user_id as fallback
    const roomOptions = roomData.data.map(r => `<option value="${r.id}">${r.room_number} (${r.building})</option>`).join('');
    const levelOptions = levelData.data.map(l => `<option value="${l.id}">${l.level_number}</option>`).join('');
    const slotOptions = slotData.data.map(s => `<option value="${s.id}">${s.day_of_week} ${s.start_time}-${s.end_time}</option>`).join('');
    
    const content = `
        <form onsubmit="saveTimetableEntry(event)" class="form-modal">
            <div class="form-group">
                <label>Course *</label>
                <select id="ttCourse" required>
                    <option value="">Select Course</option>
                    ${courseOptions}
                </select>
            </div>
            <div class="form-group">
                <label>Lecturer *</label>
                <select id="ttLecturer" required>
                    <option value="">Select Lecturer</option>
                    ${lecOptions}
                </select>
            </div>
            <div class="form-group">
                <label>Room *</label>
                <select id="ttRoom" required>
                    <option value="">Select Room</option>
                    ${roomOptions}
                </select>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Level *</label>
                    <select id="ttLevel" required>
                        <option value="">Select Level</option>
                        ${levelOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label>Time Slot *</label>
                    <select id="ttSlot" required>
                        <option value="">Select Slot</option>
                        ${slotOptions}
                    </select>
                </div>
            </div>
            <div class="form-actions">
                <button type="submit" class="btn-primary">Add Entry</button>
                <button type="button" class="btn-secondary" onclick="closeModal('ttModal')">Cancel</button>
            </div>
        </form>
    `;
    createModal('ttModal', 'Add Timetable Entry', content);
    openModal('ttModal');
}

async function saveTimetableEntry(event) {
    event.preventDefault();
    const ttData = {
        course_id: parseInt(document.getElementById('ttCourse').value),
        lecturer_id: parseInt(document.getElementById('ttLecturer').value),
        room_id: parseInt(document.getElementById('ttRoom').value),
        level_id: parseInt(document.getElementById('ttLevel').value),
        time_slot_id: parseInt(document.getElementById('ttSlot').value),
        academic_year: new Date().getFullYear().toString(),
        semester: 1
    };
    
    try {
        const response = await fetch(`${API_URL}/timetable`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(ttData)
        });
        
        const data = await response.json();
        if (data.success) {
            closeModal('ttModal');
            loadTimetableManagement();
            showNotification('Timetable entry added successfully!', 'success');
        } else if (data.conflicts) {
            showNotification('Scheduling conflict detected: ' + data.conflicts.join(', '), 'error');
        } else {
            showNotification(data.message, 'error');
        }
    } catch (error) {
        showNotification('Error adding timetable entry', 'error');
    }
}

async function deleteTimetableEntry(id) {
    if (confirm('Are you sure you want to delete this timetable entry?')) {
        try {
            const response = await fetch(`${API_URL}/timetable/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            
            const data = await response.json();
            if (data.success) {
                loadTimetableManagement();
                showNotification('Timetable entry deleted successfully!', 'success');
            } else {
                showNotification(data.message, 'error');
            }
        } catch (error) {
            showNotification('Error deleting timetable entry', 'error');
        }
    }
}

// ==================== USER MANAGEMENT ====================
async function openModalUserCreate() {
    const content = `
        <form onsubmit="saveUser(event)" class="form-modal">
            <div class="form-group">
                <label>Full Name *</label>
                <input type="text" id="userName" required placeholder="e.g., John Doe">
            </div>
            <div class="form-group">
                <label>Email *</label>
                <input type="email" id="userEmail" required placeholder="e.g., john@example.com">
            </div>
            <div class="form-group">
                <label>Password *</label>
                <input type="password" id="userPassword" required placeholder="Enter password">
            </div>
            <div class="form-group">
                <label>Role *</label>
                <div class="radio-group">
                    <label><input type="radio" name="role" value="student" checked> Student</label>
                    <label><input type="radio" name="role" value="lecturer"> Lecturer</label>
                    <label><input type="radio" name="role" value="admin"> Admin</label>
                </div>
            </div>
            <div class="form-actions">
                <button type="submit" class="btn-primary">Save User</button>
                <button type="button" class="btn-secondary" onclick="closeModal('userModal')">Cancel</button>
            </div>
        </form>
    `;
    createModal('userModal', 'Create User', content);
    openModal('userModal');
}

async function saveUser(event) {
    event.preventDefault();
    const userData = {
        full_name: document.getElementById('userName').value,
        email: document.getElementById('userEmail').value,
        password: document.getElementById('userPassword').value,
        role: document.querySelector('input[name="role"]:checked').value
    };
    
    try {
        const response = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(userData)
        });
        
        const data = await response.json();
        if (data.success) {
            closeModal('userModal');
            loadUserManagement();
            showNotification('User created successfully!', 'success');
        } else if (data.errors) {
            showNotification(data.errors.join(', '), 'error');
        } else {
            showNotification(data.message, 'error');
        }
    } catch (error) {
        showNotification('Error saving user', 'error');
    }
}
