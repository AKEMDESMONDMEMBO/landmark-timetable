// Manual test for admin functions
console.log('=== ADMIN DASHBOARD DEBUG ===');

// Check localStorage
const token = localStorage.getItem('token');
const user = localStorage.getItem('user');

console.log('Token exists:', !!token);
console.log('User data:', user);

if (user) {
    const userObj = JSON.parse(user);
    console.log('User role:', userObj.role);
    console.log('User email:', userObj.email);
}

// Check if functions are defined
console.log('loadAdminDashboard defined:', typeof loadAdminDashboard);
console.log('loadDepartments defined:', typeof loadDepartments);
console.log('handleAdminTab defined:', typeof handleAdminTab);

// Test manual function call
console.log('Testing loadAdminDashboard...');
try {
    loadAdminDashboard();
    console.log('✅ loadAdminDashboard executed');
} catch (error) {
    console.error('❌ loadAdminDashboard failed:', error);
}

// Test departments load
setTimeout(() => {
    console.log('Testing loadDepartments...');
    try {
        loadDepartments();
        console.log('✅ loadDepartments executed');
    } catch (error) {
        console.error('❌ loadDepartments failed:', error);
    }
}, 1000);