const API_URL = 'http://localhost:5000/api';

// Test admin dashboard stats API
async function testAdminStats() {
    const token = localStorage.getItem('token');
    if (!token) {
        console.log('No token found');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/dashboard/stats`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        console.log('Stats API Response:', response.status, data);

        if (data.success) {
            console.log('✅ Admin stats API working');
        } else {
            console.log('❌ Admin stats API failed:', data.message);
        }
    } catch (error) {
        console.log('❌ Network error:', error);
    }
}

// Test departments API
async function testDepartments() {
    const token = localStorage.getItem('token');
    if (!token) {
        console.log('No token found');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/departments`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        console.log('Departments API Response:', response.status, data);

        if (data.success) {
            console.log('✅ Departments API working');
        } else {
            console.log('❌ Departments API failed:', data.message);
        }
    } catch (error) {
        console.log('❌ Network error:', error);
    }
}

// Run tests
testAdminStats();
testDepartments();