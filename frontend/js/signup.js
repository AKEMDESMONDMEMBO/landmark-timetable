var API_URL = API_URL || 'http://localhost:5000/api';

// Handle signup form
if (document.getElementById('signupForm')) {
    document.getElementById('signupForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        // Clear previous messages
        document.getElementById('errorMessage').textContent = '';
        document.getElementById('successMessage').textContent = '';

        const fullName = document.getElementById('fullName').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const role = document.getElementById('role').value;
        const departmentId = document.getElementById('department_id').value;
        const specialtyId = document.getElementById('specialty_id').value;
        const levelId = document.getElementById('level_id').value;

        // Client-side validation
        if (password !== confirmPassword) {
            document.getElementById('errorMessage').textContent = 'Passwords do not match';
            return;
        }

        if (password.length < 6) {
            document.getElementById('errorMessage').textContent = 'Password must be at least 6 characters long';
            return;
        }

        if (role === 'student' && (!departmentId || !specialtyId || !levelId)) {
            document.getElementById('errorMessage').textContent = 'Department, Specialty and Level are required for students';
            return;
        }

        try {
            const signupData = {
                full_name: fullName,
                email: email,
                password: password,
                role: role
            };

            if (role === 'student') {
                signupData.department_id = departmentId;
                signupData.specialty_id = specialtyId;
                signupData.level_id = levelId;
            }

            const response = await fetch(`${API_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(signupData)
            });

            const data = await response.json();

            if (data.success) {
                // If a token is returned, log the user in immediately
                if (data.token) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));

                    // Redirect based on role
                    if (data.user.role === 'admin') {
                        window.location.href = 'admin-dashboard.html';
                    } else if (data.user.role === 'lecturer') {
                        window.location.href = 'lecturer-dashboard.html';
                    } else {
                        window.location.href = 'student-dashboard.html';
                    }
                    return;
                }

                document.getElementById('successMessage').textContent = data.message || 'Account created successfully!';
                document.getElementById('successMessage').style.display = 'block';
                document.getElementById('signupForm').reset();
                setTimeout(() => { window.location.href = 'Login.html'; }, 2000);
            } else {
                document.getElementById('errorMessage').textContent = data.message;
            }
        } catch (error) {
            document.getElementById('errorMessage').textContent = 'Registration failed. Please try again.';
            console.error('Signup error:', error);
        }
    });
}

function toggleStudentFields() {
    const role = document.getElementById('role').value;
    const studentFields = document.getElementById('studentFields');
    const departmentSelect = document.getElementById('department_id');
    const specialtySelect = document.getElementById('specialty_id');
    const levelSelect = document.getElementById('level_id');

    if (role === 'student') {
        studentFields.style.display = 'block';
        departmentSelect.disabled = false;
        specialtySelect.disabled = false;
        levelSelect.disabled = false;
        specialtySelect.innerHTML = '<option value="">Select Specialty</option>';
        departmentSelect.innerHTML = '<option value="">Select Department</option>';
        levelSelect.innerHTML = '<option value="">Select Level</option>';
        fetchDepartments();
        fetchSpecialties();
        fetchLevels();
    } else {
        studentFields.style.display = 'none';
        departmentSelect.disabled = true;
        specialtySelect.disabled = true;
        levelSelect.disabled = true;
        departmentSelect.innerHTML = '<option value="">Select Department</option>';
        specialtySelect.innerHTML = '<option value="">Select Specialty</option>';
        levelSelect.innerHTML = '<option value="">Select Level</option>';
    }
}

async function fetchDepartments() {
    try {
        const response = await fetch(`${API_URL}/public/departments`);
        const data = await response.json();
        const deptSelect = document.getElementById('department_id');
        deptSelect.innerHTML = '<option value="">Select Department</option>';

        if (data.success) {
            data.data.forEach(dept => {
                const option = document.createElement('option');
                option.value = dept.id;
                option.textContent = dept.name;
                deptSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error fetching departments:', error);
    }
}

async function fetchSpecialties(departmentId) {
    const specialtySelect = document.getElementById('specialty_id');
    specialtySelect.innerHTML = '<option value="">Select Specialty</option>';

    try {
        const url = departmentId ? `${API_URL}/public/specialties/department/${departmentId}` : `${API_URL}/public/specialties`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.success) {
            data.data.forEach(spec => {
                const option = document.createElement('option');
                option.value = spec.id;
                option.textContent = spec.name;
                specialtySelect.appendChild(option);
            });
            specialtySelect.disabled = false;
        } else {
            specialtySelect.disabled = true;
        }
    } catch (error) {
        specialtySelect.disabled = true;
        console.error('Error fetching specialties:', error);
    }
}

function populateDefaultLevels(levelSelect) {
    const defaultLevels = [
        { id: 1, name: '100 Level' },
        { id: 2, name: '200 Level' },
        { id: 3, name: '300 Level' },
        { id: 4, name: '400 Level' }
    ];

    defaultLevels.forEach(level => {
        const option = document.createElement('option');
        option.value = level.id;
        option.textContent = level.name;
        levelSelect.appendChild(option);
    });
}

async function fetchLevels() {
    const levelSelect = document.getElementById('level_id');
    levelSelect.innerHTML = '<option value="">Select Level</option>';

    try {
        const response = await fetch(`${API_URL}/public/levels`);
        const data = await response.json();

        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
            data.data.forEach(level => {
                const option = document.createElement('option');
                option.value = level.id;
                option.textContent = level.name || `${level.level_number} Level`;
                levelSelect.appendChild(option);
            });
        } else {
            populateDefaultLevels(levelSelect);
        }

        levelSelect.disabled = false;
    } catch (error) {
        populateDefaultLevels(levelSelect);
        levelSelect.disabled = false;
        console.error('Error fetching levels:', error);
    }
}

if (document.getElementById('department_id')) {
    document.getElementById('department_id').addEventListener('change', (event) => {
        fetchSpecialties(event.target.value);
    });
}

// Password confirmation validation
if (document.getElementById('confirmPassword')) {
    document.getElementById('confirmPassword').addEventListener('input', (e) => {
        const password = document.getElementById('password').value;
        const confirmPassword = e.target.value;

        if (password !== confirmPassword) {
            e.target.setCustomValidity('Passwords do not match');
        } else {
            e.target.setCustomValidity('');
        }
    });
}