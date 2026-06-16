var API_URL = API_URL || 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', () => {
    const email = localStorage.getItem('pendingVerificationEmail');
    if (!email) {
        window.location.href = 'Login.html';
        return;
    }
    
    document.getElementById('displayEmail').textContent = email;
    
    const digits = document.querySelectorAll('.otp-digit');
    
    // Handle digit input behavior
    digits.forEach((digit, index) => {
        digit.addEventListener('input', (e) => {
            if (e.target.value && index < digits.length - 1) {
                digits[index + 1].focus();
            }
        });
        
        digit.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !e.target.value && index > 0) {
                digits[index - 1].focus();
            }
        });
    });
    
    document.getElementById('verifyForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const otp = Array.from(digits).map(d => d.value).join('');
        if (otp.length !== 6) return;
        
        try {
            const response = await fetch(`${API_URL}/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp })
            });
            
            const data = await response.json();
            
            if (data.success) {
                document.getElementById('successMessage').textContent = data.message;
                document.getElementById('successMessage').style.display = 'block';
                document.getElementById('errorMessage').textContent = '';
                
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.removeItem('pendingVerificationEmail');
                
                setTimeout(() => {
                    const role = data.user.role;
                    if (role === 'admin') {
                        window.location.href = 'admin-dashboard.html';
                    } else if (role === 'lecturer') {
                        window.location.href = 'lecturer-dashboard.html';
                    } else {
                        window.location.href = 'student-dashboard.html';
                    }
                }, 1500);
            } else {
                document.getElementById('errorMessage').textContent = data.message;
            }
        } catch (error) {
            document.getElementById('errorMessage').textContent = 'Verification failed. Please try again.';
        }
    });

    // Handle Resend OTP
    const resendBtn = document.getElementById('resendBtn');
    if (resendBtn) {
        resendBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            
            try {
                const response = await fetch(`${API_URL}/auth/resend-otp`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    document.getElementById('successMessage').textContent = data.message;
                    document.getElementById('successMessage').style.display = 'block';
                    document.getElementById('errorMessage').textContent = '';
                    
                    setTimeout(() => {
                        document.getElementById('successMessage').style.display = 'none';
                    }, 5000);
                } else {
                    document.getElementById('errorMessage').textContent = data.message;
                }
            } catch (error) {
                document.getElementById('errorMessage').textContent = 'Failed to resend OTP. Please try again.';
            }
        });
    }
});
