// Test script to check if admin functions are working
console.log('Testing admin functions...');

// Check if admin functions are defined
console.log('handleAdminTab defined:', typeof handleAdminTab);
console.log('loadDepartments defined:', typeof loadDepartments);
console.log('loadAdminDashboard defined:', typeof loadAdminDashboard);

// Check API_URL
console.log('API_URL:', API_URL);

// Check auth headers
console.log('getAuthHeaders defined:', typeof getAuthHeaders);

// Test a simple API call
fetch(`${API_URL}/dashboard/stats`, {
    headers: getAuthHeaders()
})
.then(response => response.json())
.then(data => {
    console.log('Stats API response:', data);
})
.catch(error => {
    console.error('Stats API error:', error);
});

// Test departments API
fetch(`${API_URL}/departments`, {
    headers: getAuthHeaders()
})
.then(response => response.json())
.then(data => {
    console.log('Departments API response:', data);
})
.catch(error => {
    console.error('Departments API error:', error);
});