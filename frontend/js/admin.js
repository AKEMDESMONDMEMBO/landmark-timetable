// Admin Management Features
var API_URL = API_URL || 'http://localhost:5000/api';

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

// Modal Management
function createModal(id, title, content) {
    // Remove existing modal with same ID if any
    const existing = document.getElementById(id);
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = id;
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2 style="font-size: 1.25rem;">${title}</h2>
                <span class="close" onclick="closeModal('${id}')">&times;</span>
            </div>
            <div class="modal-body">
                ${content}
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function openModal(id) {
    console.log('🎯 Opening modal:', id);
    document.getElementById(id).style.display = 'block';
}

function closeModal(id) {
    console.log('🎯 Closing modal:', id);
    const modal = document.getElementById(id);
    if (modal) modal.style.display = 'none';
}

function showConfirmModal(title, message, onConfirm) {
    const overlay = document.createElement('div');
    overlay.className = 'confirm-modal-overlay';
    overlay.innerHTML = `
        <div class="confirm-modal">
            <div class="confirm-modal-icon">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h3 class="confirm-modal-title">${title}</h3>
            <p class="confirm-modal-body">${message}</p>
            <div class="confirm-modal-actions">
                <button class="btn btn-outline" id="confirmCancel">Cancel</button>
                <button class="btn btn-primary" style="background: var(--error);" id="confirmOk">Delete</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    const cleanup = () => overlay.remove();

    overlay.querySelector('#confirmCancel').onclick = cleanup;
    overlay.querySelector('#confirmOk').onclick = () => {
        onConfirm();
        cleanup();
    };
    overlay.onclick = (e) => { if (e.target === overlay) cleanup(); };
}


// ==================== SCHOOLS ====================
async function loadSchools() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div class="page-header">
            <div class="breadcrumb">
                <span>LMU ADMIN</span>
                <span>ACADEMIC</span>
                <span>SCHOOLS</span>
            </div>
            <div class="flex justify-between items-center">
                <h1>School Management</h1>
                <button class="btn btn-primary" onclick="openModalSchoolCreate()">
                    <i class="fas fa-plus"></i> &nbsp; Add School
                </button>
            </div>
        </div>

        <div class="card">
            <div id="schoolsList" style="overflow-x: auto;">
                <div style="display: flex; align-items: center; justify-content: center; height: 200px;">
                    <div class="spinner"></div>
                </div>
            </div>
        </div>
    `;

    try {
        const response = await fetch(`${API_URL}/schools`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();

        if (data.success) {
            window.allSchools = data.data;
            renderSchoolsTable(data.data);
        } else {
            showNotification(data.message, 'error');
        }
    } catch (error) {
        showNotification('Error loading schools', 'error');
    }
}

function renderSchoolsTable(schools) {
    const html = `
        <div class="table-responsive">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>School Name</th>
                        <th>Code</th>
                        <th>Description</th>
                        <th style="text-align: right;">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${schools.map(school => `
                        <tr>
                            <td style="font-weight: 600;">${school.name || 'N/A'}</td>
                            <td><span class="badge">${school.code || school.school_code || 'N/A'}</span></td>
                            <td style="color: var(--text-secondary); font-size: 0.8rem;">${school.description || 'No description'}</td>
                            <td style="text-align: right;">
                                <div class="flex justify-end gap-2">
                                    <button class="btn btn-outline btn-sm" style="color: var(--primary);" onclick="editSchool(${school.id}, '${school.name}', '${school.code}', '${school.description || ''}')">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-outline btn-sm" style="color: var(--error);" onclick="deleteSchool(${school.id})">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    document.getElementById('schoolsList').innerHTML = html;
}


function openModalSchoolCreate() {
    const content = `
        <form onsubmit="saveSchool(event)">
            <div class="form-section">
                <div class="form-section-title"><i class="fas fa-university"></i> Basic Information</div>
                <div class="form-row">
                    <div class="form-group">
                        <label>School Name *</label>
                        <input type="text" id="schoolName" class="input-field" required placeholder="Enter school name" style="padding-left: 1rem;">
                        <p class="form-helper">The full official name of the academic school.</p>
                    </div>
                    <div class="form-group">
                        <label>School Code *</label>
                        <input type="text" id="schoolCode" class="input-field" required placeholder="Enter school code" style="padding-left: 1rem;">
                        <p class="form-helper">Short identification code.</p>
                    </div>
                </div>
            </div>

            <div class="form-section">
                <div class="form-section-title"><i class="fas fa-align-left"></i> Additional Details</div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea id="schoolDesc" class="input-field" placeholder="Enter school description..." rows="3" style="padding-left: 1rem;"></textarea>
                </div>
            </div>

            <div class="modal-footer" style="margin: 0 -32px -32px -32px; padding: 24px 32px;">
                <button type="button" class="btn btn-outline" onclick="closeModal('schoolModal')">Cancel</button>
                <button type="submit" class="btn btn-primary">Save School</button>
            </div>
        </form>
    `;
    createModal('schoolModal', 'Create New School', content);
    openModal('schoolModal');
}

async function saveSchool(event) {
    event.preventDefault();
    const schoolData = {
        name: document.getElementById('schoolName').value,
        code: document.getElementById('schoolCode').value,
        description: document.getElementById('schoolDesc').value
    };
    
    try {
        const response = await fetch(`${API_URL}/schools`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(schoolData)
        });
        
        const data = await response.json();
        if (data.success) {
            closeModal('schoolModal');
            loadSchools();
            showNotification('School created successfully!', 'success');
        } else {
            showNotification(data.message, 'error');
        }
    } catch (error) {
        showNotification('Error saving school', 'error');
    }
}

function editSchool(id, name, code, description) {
    const content = `
        <form onsubmit="updateSchool(event, ${id})">
            <div class="form-section">
                <div class="form-section-title"><i class="fas fa-edit"></i> Edit School</div>
                <div class="form-row">
                    <div class="form-group">
                        <label>School Name *</label>
                        <input type="text" id="editSchoolName" value="${name}" class="input-field" required style="padding-left: 1rem;">
                    </div>
                    <div class="form-group">
                        <label>School Code *</label>
                        <input type="text" id="editSchoolCode" value="${code}" class="input-field" required style="padding-left: 1rem;">
                    </div>
                </div>
            </div>

            <div class="form-section">
                <div class="form-group">
                    <label>Description</label>
                    <textarea id="editSchoolDesc" class="input-field" rows="3" style="padding-left: 1rem;">${description}</textarea>
                </div>
            </div>

            <div class="modal-footer" style="margin: 0 -32px -32px -32px; padding: 24px 32px;">
                <button type="button" class="btn btn-outline" onclick="closeModal('editSchoolModal')">Cancel</button>
                <button type="submit" class="btn btn-primary">Update School</button>
            </div>
        </form>
    `;
    createModal('editSchoolModal', 'Update School', content);
    openModal('editSchoolModal');
}

async function updateSchool(event, id) {
    event.preventDefault();
    const schoolData = {
        name: document.getElementById('editSchoolName').value,
        code: document.getElementById('editSchoolCode').value,
        description: document.getElementById('editSchoolDesc').value
    };
    
    try {
        const response = await fetch(`${API_URL}/schools/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(schoolData)
        });
        
        const data = await response.json();
        if (data.success) {
            closeModal('editSchoolModal');
            loadSchools();
            showNotification('School updated successfully!', 'success');
        } else {
            showNotification(data.message, 'error');
        }
    } catch (error) {
        showNotification('Error updating school', 'error');
    }
}

async function deleteSchool(id) {
    showConfirmModal(
        'Delete School?',
        'Are you sure you want to delete this school? This will also delete all departments within it.',
        async () => {
            try {
                const response = await fetch(`${API_URL}/schools/${id}`, {
                    method: 'DELETE',
                    headers: getAuthHeaders()
                });
                
                const data = await response.json();
                if (data.success) {
                    loadSchools();
                    showNotification('School deleted successfully!', 'success');
                } else {
                    showNotification(data.message, 'error');
                }
            } catch (error) {
                showNotification('Error deleting school', 'error');
            }
        }
    );
}

// ==================== DEPARTMENTS ====================
async function loadDepartments() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div class="page-header">
            <div class="breadcrumb">
                <span>LMU ADMIN</span>
                <span>ACADEMIC</span>
                <span>DEPARTMENTS</span>
            </div>
            <div class="flex justify-between items-center">
                <h1>Department Management</h1>
                <button class="btn btn-primary" onclick="openModalDeptCreate()">
                    <i class="fas fa-plus"></i> &nbsp; Add Department
                </button>
            </div>
        </div>

        <div class="card">
            <div id="departmentsList" style="overflow-x: auto;">
                <div style="display: flex; align-items: center; justify-content: center; height: 200px;">
                    <div class="spinner"></div>
                </div>
            </div>
        </div>
    `;

    try {
        const response = await fetch(`${API_URL}/departments`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();

        if (data.success) {
            window.allDepartments = data.data;
            renderDepartmentsTable(data.data);
        } else {
            document.getElementById('departmentsList').innerHTML = `<p class="error">Error: ${data.message}</p>`;
        }
    } catch (error) {
        document.getElementById('departmentsList').innerHTML = `<p class="error">Error loading departments</p>`;
    }
}

function renderDepartmentsTable(departments) {
    const html = `
        <div class="table-responsive">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Department Name</th>
                        <th>Code</th>
                        <th>School</th>
                        <th>Description</th>
                        <th>Specialties</th>
                        <th style="text-align: right;">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${departments.map(dept => `
                        <tr>
                            <td style="font-weight: 600;">${dept.name || 'N/A'}</td>
                            <td><span class="badge">${dept.code || dept.dept_code || 'N/A'}</span></td>
                            <td>${dept.school_name || '<span class="text-muted">No School</span>'}</td>
                            <td style="color: var(--text-secondary); font-size: 0.8rem;">${dept.description || 'No description'}</td>
                            <td><span class="badge" style="background-color: #F1F5F9; color: var(--text-main);">${dept.specialty_count || 0}</span></td>
                            <td style="text-align: right;">
                                <div class="flex justify-end gap-2">
                                    <button class="btn btn-outline btn-sm" style="color: var(--primary);" onclick="editDepartment(${dept.id}, '${dept.name}', '${dept.code}', '${dept.description || ''}', ${dept.school_id})">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-outline btn-sm" style="color: var(--error);" onclick="deleteDepartment(${dept.id})">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    document.getElementById('departmentsList').innerHTML = html;
}


async function openModalDeptCreate() {
    const schoolResponse = await fetch(`${API_URL}/schools`, {
        headers: getAuthHeaders()
    });
    const schoolData = await schoolResponse.json();
    const schoolOptions = schoolData.data.map(s => `<option value="${s.id}">${s.name}</option>`).join('');

    const content = `
        <form onsubmit="saveDepartment(event)">
            <div class="form-section">
                <div class="form-section-title"><i class="fas fa-building"></i> Department Info</div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Department Name *</label>
                        <input type="text" id="deptName" class="input-field" required placeholder="Enter department name" style="padding-left: 1rem;">
                    </div>
                    <div class="form-group">
                        <label>Department Code *</label>
                        <input type="text" id="deptCode" class="input-field" required placeholder="Enter code" maxlength="10" style="padding-left: 1rem;">
                    </div>
                </div>
            </div>

            <div class="form-section">
                <div class="form-section-title"><i class="fas fa-university"></i> Institutional Link</div>
                <div class="form-group">
                    <label>Assigned School *</label>
                    <select id="deptSchool" class="input-field" required style="padding-left: 1rem; appearance: auto;">
                        <option value="">Select Parent School</option>
                        ${schoolOptions}
                    </select>
                    <p class="form-helper">This department will be nested under the selected school.</p>
                </div>
            </div>

            <div class="form-section">
                <div class="form-group">
                    <label>Description</label>
                    <textarea id="deptDesc" class="input-field" placeholder="Enter description..." rows="3" style="padding-left: 1rem;"></textarea>
                </div>
            </div>

            <div class="modal-footer" style="margin: 0 -32px -32px -32px; padding: 24px 32px;">
                <button type="button" class="btn btn-outline" onclick="closeModal('deptModal')">Cancel</button>
                <button type="submit" class="btn btn-primary">Save Department</button>
            </div>
        </form>
    `;
    createModal('deptModal', 'Create New Department', content);
    openModal('deptModal');
}

async function saveDepartment(event) {
    event.preventDefault();
    const name = document.getElementById('deptName').value;
    const code = document.getElementById('deptCode').value;
    const school_id = document.getElementById('deptSchool').value;
    const description = document.getElementById('deptDesc').value;
    
    try {
        const response = await fetch(`${API_URL}/departments`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ name, code, description, school_id })
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

async function editDepartment(id, name, code, description, schoolId) {
    const schoolResponse = await fetch(`${API_URL}/schools`, {
        headers: getAuthHeaders()
    });
    const schoolData = await schoolResponse.json();
    const schoolOptions = schoolData.data.map(s => `<option value="${s.id}" ${s.id === schoolId ? 'selected' : ''}>${s.name}</option>`).join('');

    const content = `
        <form onsubmit="updateDepartment(event, ${id})">
            <div class="form-section">
                <div class="form-section-title"><i class="fas fa-edit"></i> Edit Department</div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Department Name *</label>
                        <input type="text" id="editDeptName" value="${name}" class="input-field" required style="padding-left: 1rem;">
                    </div>
                    <div class="form-group">
                        <label>Department Code *</label>
                        <input type="text" id="editDeptCode" value="${code}" class="input-field" required style="padding-left: 1rem;">
                    </div>
                </div>
            </div>

            <div class="form-section">
                <div class="form-group">
                    <label>School *</label>
                    <select id="editDeptSchool" class="input-field" required style="padding-left: 1rem; appearance: auto;">
                        ${schoolOptions}
                    </select>
                </div>
            </div>

            <div class="form-section">
                <div class="form-group">
                    <label>Description</label>
                    <textarea id="editDeptDesc" class="input-field" rows="3" style="padding-left: 1rem;">${description}</textarea>
                </div>
            </div>

            <div class="modal-footer" style="margin: 0 -32px -32px -32px; padding: 24px 32px;">
                <button type="button" class="btn btn-outline" onclick="closeModal('editDeptModal')">Cancel</button>
                <button type="submit" class="btn btn-primary">Update Department</button>
            </div>
        </form>
    `;
    createModal('editDeptModal', 'Update Department', content);
    openModal('editDeptModal');
}

async function updateDepartment(event, id) {
    event.preventDefault();
    const name = document.getElementById('editDeptName').value;
    const code = document.getElementById('editDeptCode').value;
    const school_id = document.getElementById('editDeptSchool').value;
    const description = document.getElementById('editDeptDesc').value;
    
    try {
        const response = await fetch(`${API_URL}/departments/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ name, code, description, school_id })
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
    showConfirmModal(
        'Delete Department?',
        'Are you sure you want to delete this department?',
        async () => {
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
    );
}

// ==================== SPECIALTIES ====================
async function loadSpecialties() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div class="page-header">
            <div class="breadcrumb">
                <span>LMU ADMIN</span>
                <span>ACADEMIC</span>
                <span>SPECIALTIES</span>
            </div>
            <div class="flex justify-between items-center">
                <h1>Specialty Management</h1>
                <button class="btn btn-primary" onclick="openModalSpecCreate()">
                    <i class="fas fa-plus"></i> &nbsp; Add Specialty
                </button>
            </div>
        </div>

        <div class="card">
            <div id="specialtiesList" style="overflow-x: auto;">
                <div style="display: flex; align-items: center; justify-content: center; height: 200px;">
                    <div class="spinner"></div>
                </div>
            </div>
        </div>
    `;
    
    try {
        const response = await fetch(`${API_URL}/specialties`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        
        if (data.success) {
            window.allSpecialties = data.data;
            renderSpecialtiesTable(data.data);
        }
    } catch (error) {
        document.getElementById('specialtiesList').innerHTML = `<p class="error">Error loading specialties</p>`;
    }
}

function renderSpecialtiesTable(specialties) {
    const html = `
        <div class="table-responsive">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Specialty Name</th>
                        <th>Code</th>
                        <th>Department</th>
                        <th>School</th>
                        <th style="text-align: right;">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${specialties.map(spec => `
                        <tr>
                            <td style="font-weight: 600;">${spec.name || 'N/A'}</td>
                            <td><span class="badge">${spec.code || spec.specialty_code || 'N/A'}</span></td>
                            <td>${spec.department_name || 'N/A'}</td>
                            <td>${spec.school_name || 'N/A'}</td>
                            <td style="text-align: right;">
                                <div class="flex justify-end gap-2">
                                    <button class="btn btn-outline btn-sm" style="color: var(--primary);" onclick="editSpecialty(${spec.id}, '${spec.name}', '${spec.code}', ${spec.department_id}, ${spec.school_id})">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-outline btn-sm" style="color: var(--error);" onclick="deleteSpecialty(${spec.id})">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    document.getElementById('specialtiesList').innerHTML = html;
}


async function openModalSpecCreate() {
    const [schoolRes, deptRes] = await Promise.all([
        fetch(`${API_URL}/schools`, { headers: getAuthHeaders() }),
        fetch(`${API_URL}/departments`, { headers: getAuthHeaders() })
    ]);
    
    const schools = (await schoolRes.json()).data;
    const departments = (await deptRes.json()).data;
    
    const schoolOptions = schools.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    
    const content = `
        <form onsubmit="saveSpecialty(event)">
            <div class="form-section">
                <div class="form-section-title"><i class="fas fa-award"></i> Specialty Identity</div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Specialty Name *</label>
                        <input type="text" id="specName" class="input-field" required placeholder="Enter specialty name" style="padding-left: 1rem;">
                    </div>
                    <div class="form-group">
                        <label>Specialty Code *</label>
                        <input type="text" id="specCode" class="input-field" required placeholder="Enter code" maxlength="20" style="padding-left: 1rem;">
                    </div>
                </div>
            </div>

            <div class="form-section">
                <div class="form-section-title"><i class="fas fa-university"></i> Institutional Context</div>
                <div class="form-row">
                    <div class="form-group">
                        <label>School *</label>
                        <select id="specSchool" class="input-field" required onchange="filterDepartmentsBySchool(this.value, 'specDept')" style="padding-left: 1rem; appearance: auto;">
                            <option value="">Select School</option>
                            ${schoolOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Parent Department *</label>
                        <select id="specDept" class="input-field" required style="padding-left: 1rem; appearance: auto;">
                            <option value="">Select Department (Select School First)</option>
                        </select>
                    </div>
                </div>
                <p class="form-helper">This specialty will be categorized under the selected school and department.</p>
            </div>

            <div class="modal-footer" style="margin: 0 -32px -32px -32px; padding: 24px 32px;">
                <button type="button" class="btn btn-outline" onclick="closeModal('specModal')">Cancel</button>
                <button type="submit" class="btn btn-primary">Save Specialty</button>
            </div>
        </form>
    `;

    // Store departments globally for filtering if not already there
    window.allDepartments = departments;

    createModal('specModal', 'Create New Specialty', content);
    openModal('specModal');
}

function filterDepartmentsBySchool(schoolId, targetId) {
    const deptSelect = document.getElementById(targetId);
    if (!deptSelect || !window.allDepartments) return;
    
    const filteredDepts = window.allDepartments.filter(d => d.school_id == schoolId);
    
    deptSelect.innerHTML = '<option value="">Select Department</option>' + 
        filteredDepts.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
}

async function saveSpecialty(event) {
    event.preventDefault();
    const name = document.getElementById('specName').value;
    const code = document.getElementById('specCode').value;
    const department_id = document.getElementById('specDept').value;
    const school_id = document.getElementById('specSchool').value;
    
    try {
        const response = await fetch(`${API_URL}/specialties`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ name, code, department_id, school_id })
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

async function editSpecialty(id, name, code, deptId, schoolId) {
    const [schoolRes, deptRes] = await Promise.all([
        fetch(`${API_URL}/schools`, { headers: getAuthHeaders() }),
        fetch(`${API_URL}/departments`, { headers: getAuthHeaders() })
    ]);
    
    const schools = (await schoolRes.json()).data;
    const departments = (await deptRes.json()).data;
    window.allDepartments = departments;
    
    const schoolOptions = schools.map(s => `<option value="${s.id}" ${s.id === schoolId ? 'selected' : ''}>${s.name}</option>`).join('');
    const filteredDepts = departments.filter(d => d.school_id == schoolId);
    const deptOptions = filteredDepts.map(d => `<option value="${d.id}" ${d.id === deptId ? 'selected' : ''}>${d.name}</option>`).join('');
    
    const content = `
        <form onsubmit="updateSpecialty(event, ${id})">
            <div class="form-section">
                <div class="form-section-title"><i class="fas fa-edit"></i> Edit Specialty</div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Specialty Name *</label>
                        <input type="text" id="editSpecName" value="${name}" class="input-field" required style="padding-left: 1rem;">
                    </div>
                    <div class="form-group">
                        <label>Specialty Code *</label>
                        <input type="text" id="editSpecCode" value="${code}" class="input-field" required style="padding-left: 1rem;">
                    </div>
                </div>
            </div>

            <div class="form-section">
                <div class="form-section-title"><i class="fas fa-university"></i> Institutional Context</div>
                <div class="form-row">
                    <div class="form-group">
                        <label>School *</label>
                        <select id="editSpecSchool" class="input-field" required onchange="filterDepartmentsBySchool(this.value, 'editSpecDept')" style="padding-left: 1rem; appearance: auto;">
                            ${schoolOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Department *</label>
                        <select id="editSpecDept" class="input-field" required style="padding-left: 1rem; appearance: auto;">
                            ${deptOptions}
                        </select>
                    </div>
                </div>
            </div>

            <div class="modal-footer" style="margin: 0 -32px -32px -32px; padding: 24px 32px;">
                <button type="button" class="btn btn-outline" onclick="closeModal('editSpecModal')">Cancel</button>
                <button type="submit" class="btn btn-primary">Update Specialty</button>
            </div>
        </form>
    `;
    createModal('editSpecModal', 'Update Specialty', content);
    openModal('editSpecModal');
}

async function updateSpecialty(event, id) {
    event.preventDefault();
    const name = document.getElementById('editSpecName').value;
    const code = document.getElementById('editSpecCode').value;
    const department_id = document.getElementById('editSpecDept').value;
    const school_id = document.getElementById('editSpecSchool').value;
    
    try {
        const response = await fetch(`${API_URL}/specialties/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ name, code, department_id, school_id })
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
    showConfirmModal(
        'Delete Specialty?',
        'Are you sure you want to delete this specialty?',
        async () => {
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
    );
}

// ==================== COURSES ====================
async function loadCourses() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div class="page-header">
            <div class="breadcrumb">
                <span>LMU ADMIN</span>
                <span>ACADEMIC</span>
                <span>COURSES</span>
            </div>
            <div class="flex justify-between items-center">
                <h1>Course Management</h1>
                <button class="btn btn-primary" onclick="openModalCourseCreate()">
                    <i class="fas fa-plus"></i> &nbsp; Add Course
                </button>
            </div>
        </div>

        <div class="card">
            <div id="coursesList" style="overflow-x: auto;">
                <div style="display: flex; align-items: center; justify-content: center; height: 200px;">
                    <div class="spinner"></div>
                </div>
            </div>
        </div>
    `;
    
    try {
        const response = await fetch(`${API_URL}/courses`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        
        if (data.success) {
            window.allCourses = data.data;
            renderCoursesTable(data.data);
        }
    } catch (error) {
        document.getElementById('coursesList').innerHTML = `<p class="error">Error loading courses</p>`;
    }
}

function renderCoursesTable(courses) {
    const html = `
        <div class="table-responsive">
            <table class="data-table">
            <thead>
                <tr>
                    <th>Course Code</th>
                    <th>Course Name</th>
                    <th>Credits</th>
                    <th>Department</th>
                    <th>Level</th>
                    <th>Semester</th>
                    <th style="text-align: right;">Actions</th>
                </tr>
            </thead>
            <tbody>
                ${courses.map(course => `
                    <tr>
                        <td><span class="badge" style="background-color: var(--primary-light); color: var(--primary); font-weight: 800;">${course.course_code}</span></td>
                        <td style="font-weight: 600;">${course.course_name}</td>
                        <td>${course.credits} Units</td>
                        <td style="color: var(--text-secondary);">${course.department_name || 'N/A'}</td>
                        <td><span class="badge" style="background-color: #F1F5F9; color: var(--text-main);">${formatLevelLabel(course) || 'N/A'}</span></td>
                        <td>Sem ${course.semester}</td>
                        <td style="text-align: right;">
                            <div class="flex justify-end gap-2">
                                <button class="btn btn-outline btn-sm" style="color: var(--primary);" onclick="editCourse(${course.id})">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-outline btn-sm" style="color: var(--error);" onclick="deleteCourse(${course.id})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        </div>
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
    const levelOptions = levelData.data.map(l => `<option value="${l.id}">${formatLevelLabel(l)}</option>`).join('');
    
    const content = `
        <form onsubmit="saveCourse(event)">
            <div class="form-section">
                <div class="form-section-title"><i class="fas fa-book"></i> Course Identification</div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Course Code *</label>
                        <input type="text" id="courseCode" class="input-field" required placeholder="Enter course code" style="padding-left: 1rem;">
                    </div>
                    <div class="form-group">
                        <label>Course Name *</label>
                        <input type="text" id="courseName" class="input-field" required placeholder="Enter course name" style="padding-left: 1rem;">
                    </div>
                </div>
            </div>

            <div class="form-section">
                <div class="form-section-title"><i class="fas fa-graduation-cap"></i> Academic Details</div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Credits / Units *</label>
                        <input type="number" id="courseCredits" class="input-field" required min="1" placeholder="Units" style="padding-left: 1rem;">
                    </div>
                    <div class="form-group">
                        <label>Semester *</label>
                        <select id="courseSemester" class="input-field" required style="padding-left: 1rem; appearance: auto;">
                            <option value="1">Semester 1</option>
                            <option value="2">Semester 2</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Department *</label>
                        <select id="courseDept" class="input-field" required style="padding-left: 1rem; appearance: auto;">
                            <option value="">Select Department</option>
                            ${deptOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Level *</label>
                        <select id="courseLevel" class="input-field" required style="padding-left: 1rem; appearance: auto;">
                            <option value="">Select Level</option>
                            ${levelOptions}
                        </select>
                    </div>
                </div>
            </div>

            <div class="modal-footer" style="margin: 0 -32px -32px -32px; padding: 24px 32px;">
                <button type="button" class="btn btn-outline" onclick="closeModal('courseModal')">Cancel</button>
                <button type="submit" class="btn btn-primary">Save Course</button>
            </div>
        </form>
    `;
    createModal('courseModal', 'Create New Course', content);
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
        const levelOptions = levelData.data.map(l => `<option value="${l.id}" ${l.id === course.level_id ? 'selected' : ''}>${formatLevelLabel(l)}</option>`).join('');
        
        const content = `
            <form onsubmit="updateCourse(event, ${id})">
                <div class="form-section">
                    <div class="form-section-title"><i class="fas fa-edit"></i> Edit Course Information</div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Course Code *</label>
                            <input type="text" id="editCourseCode" value="${course.course_code}" class="input-field" required style="padding-left: 1rem;">
                        </div>
                        <div class="form-group">
                            <label>Course Name *</label>
                            <input type="text" id="editCourseName" value="${course.course_name}" class="input-field" required style="padding-left: 1rem;">
                        </div>
                    </div>
                </div>

                <div class="form-section">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Credits / Units *</label>
                            <input type="number" id="editCourseCredits" value="${course.credits}" class="input-field" required min="1" max="10" style="padding-left: 1rem;">
                        </div>
                        <div class="form-group">
                            <label>Semester *</label>
                            <select id="editCourseSemester" class="input-field" required style="padding-left: 1rem; appearance: auto;">
                                <option value="1" ${course.semester === 1 ? 'selected' : ''}>Semester 1</option>
                                <option value="2" ${course.semester === 2 ? 'selected' : ''}>Semester 2</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Department *</label>
                            <select id="editCourseDept" class="input-field" required style="padding-left: 1rem; appearance: auto;">
                                ${deptOptions}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Level *</label>
                            <select id="editCourseLevel" class="input-field" required style="padding-left: 1rem; appearance: auto;">
                                ${levelOptions}
                            </select>
                        </div>
                    </div>
                </div>

                <div class="modal-footer" style="margin: 0 -32px -32px -32px; padding: 24px 32px;">
                    <button type="button" class="btn btn-outline" onclick="closeModal('editCourseModal')">Cancel</button>
                    <button type="submit" class="btn btn-primary">Update Course</button>
                </div>
            </form>
        `;
        createModal('editCourseModal', 'Update Course', content);
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
    showConfirmModal(
        'Delete Course?',
        'Are you sure you want to delete this course?',
        async () => {
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
    );
}

// ==================== LECTURERS ====================
async function loadLecturers() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div class="page-header">
            <div class="breadcrumb">
                <span>LMU ADMIN</span>
                <span>STAFF</span>
                <span>LECTURERS</span>
            </div>
            <div class="flex justify-between items-center">
                <h1>Lecturer Management</h1>
                <button class="btn btn-primary" onclick="openModalLecturerCreate()">
                    <i class="fas fa-plus"></i> &nbsp; Add Lecturer
                </button>
            </div>
        </div>

        <div class="card">
            <div id="lecturersList" style="overflow-x: auto;">
                <div style="display: flex; align-items: center; justify-content: center; height: 200px;">
                    <div class="spinner"></div>
                </div>
            </div>
        </div>
    `;

    try {
        const response = await fetch(`${API_URL}/lecturers`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        if (data.success) {
            window.allLecturers = data.data;
            renderLecturersTable(data.data);
        }
    } catch (error) {
        document.getElementById('lecturersList').innerHTML = `<p class="error">Error loading lecturers</p>`;
    }
}

function renderLecturersTable(lecturers) {
    const html = `
        <div class="table-responsive">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Full Name</th>
                        <th>Employee ID</th>
                        <th>Department</th>
                        <th>Email</th>
                        <th style="text-align: right;">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${lecturers.map(lecturer => `
                        <tr>
                            <td style="font-weight: 600;">${lecturer.full_name || lecturer.user_name || 'N/A'}</td>
                            <td><span class="badge" style="background-color: #F1F5F9; color: var(--text-main);">${lecturer.employee_id || lecturer.lecture_id || 'N/A'}</span></td>
                            <td>${lecturer.department_name || 'N/A'}</td>
                            <td style="color: var(--text-secondary);">${lecturer.email || 'N/A'}</td>
                            <td style="text-align: right;">
                                <div class="flex justify-end gap-2">
                                    <button class="btn btn-outline btn-sm" style="color: var(--primary);" onclick="editLecturer(${lecturer.id})">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-outline btn-sm" style="color: var(--error);" onclick="deleteLecturer(${lecturer.id})">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
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
        <form onsubmit="saveLecturer(event)">
            <div class="form-section">
                <div class="form-section-title"><i class="fas fa-user-tie"></i> Faculty Identification</div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Linked User Account *</label>
                        <select id="lecturerUser" class="input-field" required style="padding-left: 1rem; appearance: auto;">
                            <option value="">Select Lecturer</option>
                            ${userOptions}
                        </select>
                        <p class="form-helper">Connect this profile to an existing user account.</p>
                    </div>
                    <div class="form-group">
                        <label>Employee ID *</label>
                        <input type="text" id="lecturerEmpId" class="input-field" required placeholder="Enter Employee ID" style="padding-left: 1rem;">
                        <p class="form-helper">Unique institutional identifier.</p>
                    </div>
                </div>
            </div>

            <div class="form-section">
                <div class="form-section-title"><i class="fas fa-briefcase"></i> Academic Assignment</div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Primary Department</label>
                        <select id="lecturerDept" class="input-field" style="padding-left: 1rem; appearance: auto;">
                            <option value="">Select Department</option>
                            ${deptOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Specialization Area</label>
                        <input type="text" id="lecturerSpec" class="input-field" placeholder="Enter area (optional)" style="padding-left: 1rem;">
                    </div>
                </div>
            </div>

            <div class="modal-footer" style="margin: 0 -32px -32px -32px; padding: 24px 32px;">
                <button type="button" class="btn btn-outline" onclick="closeModal('lecturerModal')">Cancel</button>
                <button type="submit" class="btn btn-primary">Save Lecturer</button>
            </div>
        </form>
    `;
    createModal('lecturerModal', 'Create New Lecturer', content);
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
            <form onsubmit="updateLecturer(event, ${id})">
                <div class="form-section">
                    <div class="form-section-title"><i class="fas fa-id-card"></i> Faculty Profile</div>
                    <div class="form-group">
                        <label>Employee ID *</label>
                        <input type="text" id="editLecturerEmpId" value="${lecturer.employee_id}" class="input-field" required style="padding-left: 1rem;">
                    </div>
                </div>

                <div class="form-section">
                    <div class="form-section-title"><i class="fas fa-graduation-cap"></i> Academic Details</div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Department</label>
                            <select id="editLecturerDept" class="input-field" style="padding-left: 1rem; appearance: auto;">
                                <option value="">Select Department</option>
                                ${deptOptions}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Specialization</label>
                            <input type="text" id="editLecturerSpec" value="${lecturer.specialization || ''}" class="input-field" placeholder="e.g., Artificial Intelligence" style="padding-left: 1rem;">
                        </div>
                    </div>
                </div>

                <div class="modal-footer" style="margin: 0 -32px -32px -32px; padding: 24px 32px;">
                    <button type="button" class="btn btn-outline" onclick="closeModal('editLecturerModal')">Cancel</button>
                    <button type="submit" class="btn btn-primary">Update Lecturer</button>
                </div>
            </form>
        `;
        createModal('editLecturerModal', 'Update Lecturer Profile', content);
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
    showConfirmModal(
        'Delete Lecturer?',
        'Are you sure you want to delete this lecturer profile?',
        async () => {
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
    );
}

// ==================== ROOMS ====================
async function loadRooms() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div class="page-header">
            <div class="breadcrumb">
                <span>LMU ADMIN</span>
                <span>RESOURCES</span>
                <span>ROOMS</span>
            </div>
            <div class="flex justify-between items-center">
                <h1>Room Management</h1>
                <button class="btn btn-primary" onclick="openModalRoomCreate()">
                    <i class="fas fa-plus"></i> &nbsp; Add Room
                </button>
            </div>
        </div>

        <div class="card">
            <div id="roomsList" style="overflow-x: auto;">
                <div style="display: flex; align-items: center; justify-content: center; height: 200px;">
                    <div class="spinner"></div>
                </div>
            </div>
        </div>
    `;

    try {
        const response = await fetch(`${API_URL}/rooms`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        if (data.success) {
            window.allRooms = data.data;
            renderRoomsTable(data.data);
        }
    } catch (error) {
        document.getElementById('roomsList').innerHTML = `<p class="error">Error loading rooms</p>`;
    }
}

function renderRoomsTable(rooms) {
    const html = `
        <div class="table-responsive">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Room Number</th>
                        <th>Building</th>
                        <th>Capacity</th>
                        <th>Type</th>
                        <th style="text-align: right;">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${rooms.map(room => `
                        <tr>
                            <td style="font-weight: 600;">${room.room_number || 'N/A'}</td>
                            <td>${room.building || 'N/A'}</td>
                            <td><span class="badge" style="background-color: #F1F5F9; color: var(--text-main);">${room.capacity || room.room_capacity || '0'}</span></td>
                            <td>${room.type || 'N/A'}</td>
                            <td style="text-align: right;">
                                <div class="flex justify-end gap-2">
                                    <button class="btn btn-outline btn-sm" style="color: var(--primary);" onclick="editRoom(${room.id})">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-outline btn-sm" style="color: var(--error);" onclick="deleteRoom(${room.id})">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    document.getElementById('roomsList').innerHTML = html;
}


function openModalRoomCreate() {
    const content = `
        <form onsubmit="saveRoom(event)">
            <div class="form-section">
                <div class="form-section-title"><i class="fas fa-door-open"></i> Room Identity</div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Room Number / Name *</label>
                        <input type="text" id="roomNumber" class="input-field" required placeholder="Enter room number" style="padding-left: 1rem;">
                    </div>
                    <div class="form-group">
                        <label>Building / Block *</label>
                        <input type="text" id="roomBuilding" class="input-field" required placeholder="Enter building name" style="padding-left: 1rem;">
                    </div>
                </div>
            </div>

            <div class="form-section">
                <div class="form-section-title"><i class="fas fa-users"></i> Capacity & Type</div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Student Capacity *</label>
                        <input type="number" id="roomCapacity" class="input-field" required min="1" placeholder="Max students" style="padding-left: 1rem;">
                    </div>
                    <div class="form-group">
                        <label>Room Type *</label>
                        <select id="roomType" class="input-field" required style="padding-left: 1rem; appearance: auto;">
                            <option value="Classroom">Classroom</option>
                            <option value="Lecture Hall">Lecture Hall</option>
                            <option value="Laboratory">Laboratory</option>
                            <option value="Auditorium">Auditorium</option>
                        </select>
                    </div>
                </div>
            </div>

            <div class="modal-footer" style="margin: 0 -32px -32px -32px; padding: 24px 32px;">
                <button type="button" class="btn btn-outline" onclick="closeModal('roomModal')">Cancel</button>
                <button type="submit" class="btn btn-primary">Save Room</button>
            </div>
        </form>
    `;
    createModal('roomModal', 'Create New Room', content);
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
            <form onsubmit="updateRoom(event, ${id})">
                <div class="form-section">
                    <div class="form-section-title"><i class="fas fa-edit"></i> Edit Room Details</div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Room Number *</label>
                            <input type="text" id="editRoomNumber" value="${room.room_number}" class="input-field" required style="padding-left: 1rem;">
                        </div>
                        <div class="form-group">
                            <label>Building *</label>
                            <input type="text" id="editRoomBuilding" value="${room.building}" class="input-field" required style="padding-left: 1rem;">
                        </div>
                    </div>
                </div>

                <div class="form-section">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Capacity *</label>
                            <input type="number" id="editRoomCapacity" value="${room.capacity}" class="input-field" required min="1" max="500" style="padding-left: 1rem;">
                        </div>
                        <div class="form-group">
                            <label>Type *</label>
                            <select id="editRoomType" class="input-field" required style="padding-left: 1rem; appearance: auto;">
                                <option value="Classroom" ${room.type === 'Classroom' ? 'selected' : ''}>Classroom</option>
                                <option value="Lecture Hall" ${room.type === 'Lecture Hall' ? 'selected' : ''}>Lecture Hall</option>
                                <option value="Laboratory" ${room.type === 'Laboratory' ? 'selected' : ''}>Laboratory</option>
                                <option value="Auditorium" ${room.type === 'Auditorium' ? 'selected' : ''}>Auditorium</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="modal-footer" style="margin: 0 -32px -32px -32px; padding: 24px 32px;">
                    <button type="button" class="btn btn-outline" onclick="closeModal('editRoomModal')">Cancel</button>
                    <button type="submit" class="btn btn-primary">Update Room</button>
                </div>
            </form>
        `;
        createModal('editRoomModal', 'Update Room Details', content);
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
    showConfirmModal(
        'Delete Room?',
        'Are you sure you want to delete this room?',
        async () => {
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
    );
}

// ==================== LEVELS ====================
async function loadLevels() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div class="page-header">
            <div class="breadcrumb">
                <span>LMU ADMIN</span>
                <span>ACADEMIC</span>
                <span>LEVELS</span>
            </div>
            <div class="flex justify-between items-center">
                <h1>Level Management</h1>
                <button class="btn btn-primary" onclick="openModalLevelCreate()">
                    <i class="fas fa-plus"></i> &nbsp; Add Level
                </button>
            </div>
        </div>

        <div class="card">
            <div id="levelsList" style="overflow-x: auto;">
                <div style="display: flex; align-items: center; justify-content: center; height: 200px;">
                    <div class="spinner"></div>
                </div>
            </div>
        </div>
    `;
    
    try {
        const response = await fetch(`${API_URL}/dashboard/levels`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        
        if (data.success) {
            const html = `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Level Number</th>
                            <th>Description</th>
                            <th style="text-align: right;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.data.map(lvl => {
                            const safeDescription = JSON.stringify(lvl.description || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');
                            return `
                            <tr>
                                <td style="font-weight: 700; font-size: 1.1rem; color: var(--primary);">${formatLevelLabel(lvl)}</td>
                                <td>${lvl.description || `Year ${Math.floor(lvl.level_number / 100)} Undergraduate Level`}</td>
                                <td style="text-align: right;">
                                    <div class="flex justify-end gap-2">
                                        <button class="btn btn-outline btn-sm" style="color: var(--primary);" onclick="editLevel(${lvl.id}, ${lvl.level_number}, ${safeDescription})">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn btn-outline btn-sm" style="color: var(--error);" onclick="deleteLevel(${lvl.id})">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            `;
            document.getElementById('levelsList').innerHTML = html;
        }
    } catch (error) {
        document.getElementById('levelsList').innerHTML = `<p class="error">Error loading levels</p>`;
    }
}

function openModalLevelCreate() {
    const content = `
        <form onsubmit="saveLevel(event)">
            <div class="form-section">
                <div class="form-section-title"><i class="fas fa-layer-group"></i> Level Details</div>
                <div class="form-group">
                    <label>Level Number *</label>
                    <input type="number" id="levelNum" class="input-field" required placeholder="Enter any level number" style="padding-left: 1rem;">
                    <p class="form-helper">You can store any academic level number supported by your system.</p>
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea id="levelDesc" class="input-field" placeholder="Enter level description..." rows="3" style="padding-left: 1rem;"></textarea>
                    <p class="form-helper">Add a clear description for this academic level.</p>
                </div>
            </div>
            <div class="modal-footer" style="margin: 0 -32px -32px -32px; padding: 24px 32px;">
                <button type="button" class="btn btn-outline" onclick="closeModal('levelModal')">Cancel</button>
                <button type="submit" class="btn btn-primary">Save Level</button>
            </div>
        </form>
    `;
    createModal('levelModal', 'Create New Level', content);
    openModal('levelModal');
}

async function saveLevel(event) {
    event.preventDefault();
    const level_number = document.getElementById('levelNum').value;
    const description = document.getElementById('levelDesc').value;
    try {
        const response = await fetch(`${API_URL}/dashboard/levels`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ level_number, description })
        });
        const data = await response.json();
        if (data.success) {
            closeModal('levelModal');
            loadLevels();
            showNotification('Level created successfully!', 'success');
        } else {
            showNotification(data.message, 'error');
        }
    } catch (error) {
        showNotification('Error saving level', 'error');
    }
}

function editLevel(id, currentNum, currentDescription) {
    const content = `
        <form onsubmit="updateLevel(event, ${id})">
            <div class="form-section">
                <div class="form-section-title"><i class="fas fa-edit"></i> Update Level</div>
                <div class="form-group">
                    <label>Level Number *</label>
                    <input type="number" id="editLevelNum" value="${currentNum}" class="input-field" required style="padding-left: 1rem;">
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea id="editLevelDesc" class="input-field" rows="3" style="padding-left: 1rem;">${currentDescription || ''}</textarea>
                    <p class="form-helper">Update the description for this academic level.</p>
                </div>
            </div>
            <div class="modal-footer" style="margin: 0 -32px -32px -32px; padding: 24px 32px;">
                <button type="button" class="btn btn-outline" onclick="closeModal('editLevelModal')">Cancel</button>
                <button type="submit" class="btn btn-primary">Update Level</button>
            </div>
        </form>
    `;
    createModal('editLevelModal', 'Edit Level', content);
    openModal('editLevelModal');
}

async function updateLevel(event, id) {
    event.preventDefault();
    const level_number = document.getElementById('editLevelNum').value;
    const description = document.getElementById('editLevelDesc').value;
    try {
        const response = await fetch(`${API_URL}/dashboard/levels/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ level_number, description })
        });
        const data = await response.json();
        if (data.success) {
            closeModal('editLevelModal');
            loadLevels();
            showNotification('Level updated successfully!', 'success');
        } else {
            showNotification(data.message, 'error');
        }
    } catch (error) {
        showNotification('Error updating level', 'error');
    }
}

async function deleteLevel(id) {
    showConfirmModal(
        'Delete Level?',
        'Are you sure you want to delete this academic level? This may affect courses assigned to it.',
        async () => {
            try {
                const response = await fetch(`${API_URL}/dashboard/levels/${id}`, {
                    method: 'DELETE',
                    headers: getAuthHeaders()
                });
                const data = await response.json();
                if (data.success) {
                    loadLevels();
                    showNotification('Level deleted successfully!', 'success');
                } else {
                    showNotification(data.message, 'error');
                }
            } catch (error) {
                showNotification('Error deleting level', 'error');
            }
        }
    );
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
        'schools': ['School Management', loadSchools],
        'departments': ['Department Management', loadDepartments],
        'specialties': ['Specialty Management', loadSpecialties],
        'courses': ['Course Management', loadCourses],
        'lecturers': ['Lecturer Management', loadLecturers],
        'rooms': ['Room Management', loadRooms],
        'levels': ['Level Management', loadLevels],
        'users': ['User Management', loadUserManagement],
        'timetable': ['Timetable Management', loadTimetableManagement],
        'profile': ['My Profile', loadProfile]
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
        <div class="page-header">
            <div class="breadcrumb">
                <span>LMU ADMIN</span>
                <span>DASHBOARD</span>
            </div>
            <h1>Overview</h1>
        </div>

        <div class="stats-grid">
            <div class="card stat-card">
                <div class="stat-icon" style="background-color: var(--primary-light); color: var(--primary);">
                    <i class="fas fa-users"></i>
                </div>
                <div class="stat-info">
                    <p>Total Users</p>
                    <h3 id="totalUsers">0</h3>
                </div>
            </div>
            <div class="card stat-card">
                <div class="stat-icon" style="background-color: #ECFDF5; color: #10B981;">
                    <i class="fas fa-book"></i>
                </div>
                <div class="stat-info">
                    <p>Total Courses</p>
                    <h3 id="totalCourses">0</h3>
                </div>
            </div>
            <div class="card stat-card">
                <div class="stat-icon" style="background-color: #FFFBEB; color: #F59E0B;">
                    <i class="fas fa-chalkboard-teacher"></i>
                </div>
                <div class="stat-info">
                    <p>Total Lecturers</p>
                    <h3 id="totalLecturers">0</h3>
                </div>
            </div>
            <div class="card stat-card">
                <div class="stat-icon" style="background-color: #EEF2FF; color: #6366F1;">
                    <i class="fas fa-calendar-check"></i>
                </div>
                <div class="stat-info">
                    <p>Timetable Entries</p>
                    <h3 id="totalEntries">0</h3>
                </div>
            </div>
        </div>

        <div class="management-container" style="margin-top: var(--spacing-8);">
            <div class="header-section"><h2>Resource Utilization</h2></div>
            <div class="grid grid-cols-2 gap-6">
                <div class="card">
                    <h3>Room Usage</h3>
                    <div id="roomUsageWrap" style="height: 200px; display: flex; align-items: center; justify-content: center;">
                        <span class="text-muted">Loading chart data...</span>
                    </div>
                </div>
                <div class="card">
                    <h3>Lecturer Workload</h3>
                    <div id="lecturerWorkloadWrap" style="height: 200px; display: flex; align-items: center; justify-content: center;">
                        <span class="text-muted">Loading chart data...</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    loadDashboardStats();
    if (typeof loadResourceInsights === 'function') loadResourceInsights();
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

async function loadResourceInsights() {
    try {
        const [roomRes, workloadRes] = await Promise.all([
            fetch(`${API_URL}/dashboard/room-usage`, { headers: getAuthHeaders() }),
            fetch(`${API_URL}/dashboard/lecturer-workload`, { headers: getAuthHeaders() })
        ]);
        const [roomData, workloadData] = await Promise.all([roomRes.json(), workloadRes.json()]);
        if (roomData.success) {
            document.getElementById('roomUsageWrap').innerHTML = `
                <h3>Room Usage</h3>
                <p>${roomData.data.slice(0, 5).map((r) => `${r.room_number}: ${r.usage_count}`).join(' | ') || 'No data'}</p>
            `;
        }
        if (workloadData.success) {
            document.getElementById('lecturerWorkloadWrap').innerHTML = `
                <h3>Lecturer Workload</h3>
                <p>${workloadData.data.slice(0, 5).map((l) => `${l.lecturer_name}: ${l.assigned_classes}`).join(' | ') || 'No data'}</p>
            `;
        }
    } catch (error) {
        console.error('Error loading resource insights:', error);
    }
}

async function loadUserManagement() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div class="page-header">
            <div class="breadcrumb">
                <span>LMU ADMIN</span>
                <span>SYSTEM</span>
                <span>USERS</span>
            </div>
            <div class="flex justify-between items-center">
                <h1>User Management</h1>
                <button class="btn btn-primary" onclick="openModalUserCreate()">
                    <i class="fas fa-user-plus"></i> &nbsp; Add User
                </button>
            </div>
        </div>

        <div class="card">
            <div id="usersList" style="overflow-x: auto;">
                <div style="display: flex; align-items: center; justify-content: center; height: 200px;">
                    <div class="spinner"></div>
                </div>
            </div>
        </div>
    `;
    
    try {
        const response = await fetch(`${API_URL}/users`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        
        if (data.success) {
            window.allUsers = data.data; // Store for filtering
            renderUsersTable(data.data);
        }
    } catch (error) {
        document.getElementById('usersList').innerHTML = `<p class="error">Error loading users</p>`;
    }
}


function renderUsersTable(users) {
    const html = `
        <div class="table-responsive">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Created At</th>
                        <th style="text-align: right;">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${users.map(user => `
                        <tr>
                            <td style="font-weight: 600;">${user.full_name || 'N/A'}</td>
                            <td>${user.email || 'N/A'}</td>
                            <td><span class="badge" style="text-transform: capitalize;">${user.role || user.user_role || 'N/A'}</span></td>
                            <td style="color: var(--text-secondary); font-size: 0.8rem;">${user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</td>
                            <td style="text-align: right;">
                                <div class="flex justify-end gap-2">
                                    <button class="btn btn-outline btn-sm" style="color: var(--primary);" onclick="openModalUserEdit(${user.id}, '${user.full_name}', '${user.email}', '${user.role}')">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-outline btn-sm" style="color: var(--error);" onclick="deleteUser(${user.id})">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    const list = document.getElementById('usersList');
    if (list) list.innerHTML = html;
}

function openModalUserEdit(id, name, email, role) {
    const content = `
        <form onsubmit="updateUser(event, ${id})">
            <div class="form-section">
                <div class="form-section-title"><i class="fas fa-user-edit"></i> Update Account</div>
                <div class="form-group">
                    <label>Full Name *</label>
                    <input type="text" id="editUserName" value="${name}" class="input-field" required style="padding-left: 1rem;">
                </div>
                <div class="form-group">
                    <label>Email Address *</label>
                    <input type="email" id="editUserEmail" value="${email}" class="input-field" required style="padding-left: 1rem;">
                </div>
            </div>

            <div class="form-section">
                <div class="form-section-title"><i class="fas fa-shield-alt"></i> Access Level</div>
                <div class="form-group">
                    <label>System Role *</label>
                    <select id="editUserRole" class="input-field" required style="padding-left: 1rem; appearance: auto;">
                        <option value="student" ${role === 'student' ? 'selected' : ''}>Student</option>
                        <option value="lecturer" ${role === 'lecturer' ? 'selected' : ''}>Lecturer</option>
                        <option value="admin" ${role === 'admin' ? 'selected' : ''}>Admin</option>
                    </select>
                </div>
                <div class="form-group" style="margin-top: var(--spacing-4);">
                    <label>New Password (Optional)</label>
                    <input type="password" id="editUserPassword" class="input-field" placeholder="Leave blank to keep current" style="padding-left: 1rem;">
                </div>
            </div>

            <div class="modal-footer" style="margin: 0 -32px -32px -32px; padding: 24px 32px;">
                <button type="button" class="btn btn-outline" onclick="closeModal('editUserModal')">Cancel</button>
                <button type="submit" class="btn btn-primary">Update User</button>
            </div>
        </form>
    `;
    createModal('editUserModal', 'Edit User Account', content);
    openModal('editUserModal');
}

async function updateUser(event, id) {
    event.preventDefault();
    const userData = {
        full_name: document.getElementById('editUserName').value,
        email: document.getElementById('editUserEmail').value,
        role: document.getElementById('editUserRole').value
    };
    
    const password = document.getElementById('editUserPassword').value;
    if (password) userData.password = password;
    
    try {
        const response = await fetch(`${API_URL}/users/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(userData)
        });
        
        const data = await response.json();
        if (data.success) {
            closeModal('editUserModal');
            loadUserManagement();
            showNotification('User updated successfully!', 'success');
        } else {
            showNotification(data.message, 'error');
        }
    } catch (error) {
        showNotification('Error updating user', 'error');
    }
}

async function deleteUser(id) {
    showConfirmModal(
        'Delete User Account?',
        'Are you sure you want to delete this user? This action cannot be undone and will remove all associated data.',
        async () => {
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
    );
}

async function loadTimetableManagement() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div class="page-header">
            <div class="breadcrumb">
                <span>LMU ADMIN</span>
                <span>ACADEMIC</span>
                <span>TIMETABLE</span>
            </div>
            <div class="flex justify-between items-center">
                <h1>Timetable Management</h1>
                <div class="flex flex-col items-end gap-2">
                    <div class="flex gap-2">
                        <button class="btn btn-outline" style="color: var(--primary); border-color: var(--primary);" onclick="generateTimetable()">
                            <i class="fas fa-magic"></i> &nbsp; Auto Generate
                        </button>
                        <button class="btn btn-outline" style="color: var(--primary); border-color: var(--primary);" onclick="downloadAdminTimetablePDF()">
                            <i class="fas fa-file-pdf"></i> &nbsp; Download PDF
                        </button>
                        <button class="btn btn-primary" onclick="openModalTimetableCreate()">
                            <i class="fas fa-plus"></i> &nbsp; Add Entry
                        </button>
                    </div>
                    <span style="font-size: 0.8rem; color: var(--text-muted);">Download the current admin timetable as a PDF file.</span>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="flex flex-col gap-6">
                <div id="timetableList" style="overflow-x: auto;">
                    <div style="display: flex; align-items: center; justify-content: center; height: 200px;">
                        <div class="spinner"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    try {
        const [response, deptRes, lecRes, levelRes] = await Promise.all([
            fetch(`${API_URL}/timetable`, { headers: getAuthHeaders() }),
            fetch(`${API_URL}/departments`, { headers: getAuthHeaders() }),
            fetch(`${API_URL}/lecturers`, { headers: getAuthHeaders() }),
            fetch(`${API_URL}/dashboard/levels`, { headers: getAuthHeaders() })
        ]);
        const [data, deptData, lecData, levelData] = await Promise.all([response.json(), deptRes.json(), lecRes.json(), levelRes.json()]);
        populateTimetableFilters(deptData.data || [], lecData.data || [], levelData.data || []);
        
        if (data.success) {
            window.allTimetableEntries = data.data;
            const filtered = applyTimetableFilters(data.data);
            renderTimetableTable(filtered);
        }
    } catch (error) {
        console.error('Error loading timetable:', error);
        document.getElementById('timetableList').innerHTML = `<p class="error">Error loading timetable</p>`;
    }
}

function populateTimetableFilters(departments, lecturers, levels) {
    const deptSelect = document.getElementById('filterDepartment');
    const lecturerSelect = document.getElementById('filterLecturer');
    const levelSelect = document.getElementById('filterLevel');
    if (!deptSelect || !lecturerSelect || !levelSelect) return;

    deptSelect.innerHTML = `<option value="">All Departments</option>${departments.map((d) => `<option value="${d.id}">${d.name}</option>`).join('')}`;
    lecturerSelect.innerHTML = `<option value="">All Lecturers</option>${lecturers.map((l) => `<option value="${l.id}">${l.full_name || l.user_name || 'Unknown'}</option>`).join('')}`;
    levelSelect.innerHTML = `<option value="">All Levels</option>${levels.map((l) => `<option value="${l.level_number}">${l.level_number}</option>`).join('')}`;
}

function applyTimetableFilters(timetable) {
    const deptId = document.getElementById('filterDepartment')?.value || '';
    const lecturerId = document.getElementById('filterLecturer')?.value || '';
    const levelNumber = document.getElementById('filterLevel')?.value || '';

    return timetable.filter((entry) => {
        const departmentOk = !deptId || String(entry.department_id) === String(deptId);
        const lecturerOk = !lecturerId || String(entry.lecturer_id) === String(lecturerId);
        const levelOk = !levelNumber || String(entry.level_number) === String(levelNumber);
        return departmentOk && lecturerOk && levelOk;
    });
}

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
    const startY = 25;
    const rowHeight = 8;
    const columnWidths = [28, 60, 50, 35, 25, 25, 35];
    const columnX = [margin];
    for (let i = 1; i < columnWidths.length; i++) {
        columnX[i] = columnX[i - 1] + columnWidths[i - 1];
    }

    const splitText = (text, width) => doc.splitTextToSize(text || '', width);
    const lineHeight = 6;
    let cursorY = startY;

    doc.setFontSize(12);
    doc.text('Landmark Metropolitan University - Timetable', margin, 15);
    doc.setFontSize(9);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, margin, 20);

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
        doc.setFontSize(10);
        const headerY = cursorY + 5;
        doc.text(headerCellLines[index], columnX[index] + 2, headerY);
        doc.setFontSize(prevFontSize);
    });
    cursorY += headerHeight;
    doc.setFont(undefined, 'normal');
    doc.setTextColor(0, 0, 0);

    rows.forEach((row) => {
        const cellLines = headers.map((key, index) => splitText(row[key], columnWidths[index] - 4));
        const maxLines = Math.max(...cellLines.map(lines => lines.length));
        const rowHeightPixels = maxLines * 6 + 4;

        if (cursorY + rowHeightPixels > doc.internal.pageSize.getHeight() - margin) {
            doc.addPage();
            cursorY = startY;
        }

        doc.setFillColor(255, 255, 255);
        headers.forEach((key, index) => {
            const lines = cellLines[index];
            doc.rect(columnX[index], cursorY - 5, columnWidths[index], rowHeightPixels, 'FD');
            doc.text(lines, columnX[index] + 2, cursorY);
        });
        cursorY += rowHeightPixels;
    });
}

async function downloadAdminTimetablePDF() {
    const entries = window.allTimetableEntries || [];
    if (!entries.length) {
        alert('No timetable content is available to download');
        return;
    }

    const rows = entries.map((entry) => ({
        'Course Code': entry.course_code || '',
        'Course Name': entry.course_name || '',
        'Instructor': entry.lecturer_name || entry.lecturer || 'N/A',
        'Location': entry.room_number || '',
        'Capacity': entry.room_capacity || entry.level_number || '',
        'Day': entry.day_of_week || '',
        'Time': entry.start_time && entry.end_time ? `${entry.start_time} - ${entry.end_time}` : (entry.time_slot || '')
    }));

    try {
        const jsPDF = await ensurePdfLibrary();
        const doc = new jsPDF({ orientation: 'landscape' });
        const headers = ['Course Code', 'Course Name', 'Instructor', 'Location', 'Capacity', 'Day', 'Time'];
        generatePDFTable(doc, headers, rows);
        doc.save('LMU-admin-timetable.pdf');
    } catch (error) {
        console.error('PDF export error:', error);
        alert('Unable to generate PDF. Please try again or use the browser print option.');
    }
}

function renderTimetableTable(timetable) {
    const html = `
        <div class="table-responsive">
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
                        <td><span class="entry-chip">${entry.room_number}</span></td>
                        <td><span class="entry-chip">${entry.level_number}</span></td>
                        <td><span class="entry-chip">${entry.day_of_week}</span></td>
                        <td>${entry.start_time} - ${entry.end_time}</td>
                        <td class="actions">
                            <button class="btn-sm btn-primary" onclick="openModalTimetableEdit(${entry.id}, ${entry.course_id}, ${entry.lecturer_id}, ${entry.room_id}, ${entry.level_id}, ${entry.time_slot_id}, '${entry.academic_year}', ${entry.semester})">Edit</button>
                            <button class="btn-sm btn-danger" onclick="deleteTimetableEntry(${entry.id})">Delete</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        </div>
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
    const lecOptions = lecData.data.map(l => `<option value="${l.id}">${l.full_name || l.user_name || 'Unknown'}</option>`).join('');
    const roomOptions = roomData.data.map(r => `<option value="${r.id}">${r.room_number} (${r.building})</option>`).join('');
    const levelOptions = levelData.data.map(l => `<option value="${l.id}">${l.level_number}</option>`).join('');
    const slotOptions = slotData.data.map(s => `<option value="${s.id}">${s.day_of_week} ${s.start_time}-${s.end_time}</option>`).join('');
    
    const content = `
        <form onsubmit="saveTimetableEntry(event)">
            <div class="form-section">
                <div class="form-section-title"><i class="fas fa-book"></i> Academic Resource</div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Course *</label>
                        <select id="ttCourse" class="input-field" required style="padding-left: 1rem; appearance: auto;">
                            <option value="">Select Course</option>
                            ${courseOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Lecturer *</label>
                        <select id="ttLecturer" class="input-field" required style="padding-left: 1rem; appearance: auto;">
                            <option value="">Select Lecturer</option>
                            ${lecOptions}
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Assigned Room *</label>
                    <select id="ttRoom" class="input-field" required style="padding-left: 1rem; appearance: auto;">
                        <option value="">Select Room</option>
                        ${roomOptions}
                    </select>
                </div>
            </div>

            <div class="form-section">
                <div class="form-section-title"><i class="fas fa-clock"></i> Schedule Details</div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Student Level *</label>
                        <select id="ttLevel" class="input-field" required style="padding-left: 1rem; appearance: auto;">
                            <option value="">Select Level</option>
                            ${levelOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Preferred Time Slot *</label>
                        <select id="ttSlot" class="input-field" required style="padding-left: 1rem; appearance: auto;">
                            <option value="">Select Slot</option>
                            ${slotOptions}
                        </select>
                    </div>
                </div>
            </div>

            <div id="ttSuggestions" class="suggestion-box" style="display:none; margin-bottom: var(--spacing-6); padding: var(--spacing-4); background: #f8fafc; border-radius: 8px; border-left: 4px solid var(--primary);"></div>

            <div class="modal-footer" style="margin: 0 -32px -32px -32px; padding: 24px 32px;">
                <button type="button" class="btn btn-outline" onclick="getTimetableSuggestionsFromForm()">Check Suggestions</button>
                <div style="flex: 1;"></div>
                <button type="button" class="btn btn-outline" onclick="closeModal('ttModal')">Cancel</button>
                <button type="submit" class="btn btn-primary">Add Entry</button>
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
            const suggestions = (data.suggestions || []).map((item) => item.suggestion).join('<br>');
            const suggestionsBox = document.getElementById('ttSuggestions');
            if (suggestionsBox) {
                suggestionsBox.style.display = 'block';
                suggestionsBox.innerHTML = `<strong>Conflicts:</strong><br>${data.conflicts.join('<br>')}<br><br><strong>Suggested fixes:</strong><br>${suggestions || 'No quick suggestion found'}`;
            }
            showNotification('Scheduling conflict detected', 'error');
        } else {
            showNotification(data.message, 'error');
        }
    } catch (error) {
        showNotification('Error adding timetable entry', 'error');
    }
}

async function getTimetableSuggestionsFromForm() {
    const params = new URLSearchParams({
        course_id: document.getElementById('ttCourse').value,
        lecturer_id: document.getElementById('ttLecturer').value,
        room_id: document.getElementById('ttRoom').value,
        level_id: document.getElementById('ttLevel').value,
        time_slot_id: document.getElementById('ttSlot').value
    });

    const response = await fetch(`${API_URL}/timetable/suggestions?${params.toString()}`, { headers: getAuthHeaders() });
    const data = await response.json();
    const suggestionsBox = document.getElementById('ttSuggestions');
    if (!suggestionsBox) return;
    suggestionsBox.style.display = 'block';
    suggestionsBox.innerHTML = `
        <strong>Available rooms:</strong> ${(data.data?.rooms || []).join(', ') || 'N/A'}<br>
        <strong>Free time slots:</strong> ${(data.data?.slots || []).join(', ') || 'N/A'}<br>
        <strong>Alternative lecturers:</strong> ${(data.data?.lecturers || []).join(', ') || 'N/A'}
    `;
}

async function openModalTimetableEdit(id, courseId, lecturerId, roomId, levelId, slotId, academicYear, semester) {
    await openModalTimetableCreate();
    document.querySelector('#ttModal h2').textContent = 'Edit Timetable Entry';
    document.querySelector('#ttModal form').setAttribute('onsubmit', `updateTimetableEntry(event, ${id})`);
    document.getElementById('ttCourse').value = courseId;
    document.getElementById('ttLecturer').value = lecturerId;
    document.getElementById('ttRoom').value = roomId;
    document.getElementById('ttLevel').value = levelId;
    document.getElementById('ttSlot').value = slotId;
    document.getElementById('ttModal').dataset.academicYear = academicYear || new Date().getFullYear().toString();
    document.getElementById('ttModal').dataset.semester = semester || 1;
}

async function updateTimetableEntry(event, id) {
    event.preventDefault();
    const modal = document.getElementById('ttModal');
    const payload = {
        course_id: parseInt(document.getElementById('ttCourse').value, 10),
        lecturer_id: parseInt(document.getElementById('ttLecturer').value, 10),
        room_id: parseInt(document.getElementById('ttRoom').value, 10),
        level_id: parseInt(document.getElementById('ttLevel').value, 10),
        time_slot_id: parseInt(document.getElementById('ttSlot').value, 10),
        academic_year: modal?.dataset.academicYear || new Date().getFullYear().toString(),
        semester: parseInt(modal?.dataset.semester || 1, 10)
    };
    const response = await fetch(`${API_URL}/timetable/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (data.success) {
        closeModal('ttModal');
        loadTimetableManagement();
        showNotification('Timetable entry updated successfully!', 'success');
        return;
    }
    showNotification(data.message || 'Could not update timetable entry', 'error');
}

async function generateTimetable() {
    const response = await fetch(`${API_URL}/timetable/generate`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ semester: 1, academic_year: new Date().getFullYear().toString(), persist: true })
    });
    const data = await response.json();
    if (data.success) {
        showNotification(`Generated ${data.data.entries} entries (fitness ${data.data.fitness})`, 'success');
        loadTimetableManagement();
    } else {
        showNotification(data.message || 'Timetable generation failed', 'error');
    }
}

async function deleteTimetableEntry(id) {
    showConfirmModal(
        'Delete Timetable Entry?',
        'Are you sure you want to delete this timetable entry? This will free up the room and lecturer for this slot.',
        async () => {
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
    );
}

// ==================== USER MANAGEMENT ====================
async function openModalUserCreate() {
    const content = `
        <form onsubmit="saveUser(event)">
            <div class="form-section">
                <div class="form-section-title"><i class="fas fa-user-plus"></i> User Identification</div>
                <div class="form-group">
                    <label>Full Name *</label>
                    <input type="text" id="userName" class="input-field" required placeholder="Enter user's full name" style="padding-left: 1rem;">
                </div>
                <div class="form-group">
                    <label>Email Address *</label>
                    <input type="email" id="userEmail" class="input-field" required placeholder="Enter email address" style="padding-left: 1rem;">
                </div>
            </div>

            <div class="form-section">
                <div class="form-section-title"><i class="fas fa-lock"></i> Security & Access</div>
                <div class="form-group">
                    <label>Initial Password *</label>
                    <input type="password" id="userPassword" class="input-field" required placeholder="Enter password" style="padding-left: 1rem;">
                </div>
                <div class="form-group">
                    <label>System Role *</label>
                    <div class="flex gap-4" style="margin-top: 8px;">
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="role" value="student" checked style="width: 18px; height: 18px;"> Student
                        </label>
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="role" value="lecturer" style="width: 18px; height: 18px;"> Lecturer
                        </label>
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="role" value="admin" style="width: 18px; height: 18px;"> Admin
                        </label>
                    </div>
                </div>
            </div>

            <div class="modal-footer" style="margin: 0 -32px -32px -32px; padding: 24px 32px;">
                <button type="button" class="btn btn-outline" onclick="closeModal('userModal')">Cancel</button>
                <button type="submit" class="btn btn-primary">Create User</button>
            </div>
        </form>
    `;
    createModal('userModal', 'Create New System User', content);
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
