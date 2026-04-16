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

        // Client-side validation
        if (password !== confirmPassword) {
            document.getElementById('errorMessage').textContent = 'Passwords do not match';
            return;
        }

        if (password.length < 6) {
            document.getElementById('errorMessage').textContent = 'Password must be at least 6 characters long';
            return;
        }

        try {
            const response = await fetch(`${API_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    full_name: fullName,
                    email: email,
                    password: password,
                    role: role
                })
            });

            const data = await response.json();

            if (data.success) {
                document.getElementById('successMessage').textContent = data.message;
                // Clear form
                document.getElementById('signupForm').reset();
                // Redirect to login after 2 seconds
                setTimeout(() => {
                    window.location.href = 'Login.html';
                }, 2000);
            } else {
                document.getElementById('errorMessage').textContent = data.message;
            }
        } catch (error) {
            document.getElementById('errorMessage').textContent = 'Registration failed. Please try again.';
            console.error('Signup error:', error);
        }
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