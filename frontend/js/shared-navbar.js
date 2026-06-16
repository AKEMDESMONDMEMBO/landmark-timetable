/**
 * Shared Navigation Bar for all pages
 */

function injectNavbar() {
    const user = JSON.parse(localStorage.getItem('user'));
    const isLoggedIn = !!localStorage.getItem('token');
    
    let authButtons = `
        <a href="Login.html" class="nav-link" style="font-weight: 600;">Login</a>
        <a href="Signup.html" class="btn btn-primary" style="padding: 10px 24px; border-radius: 8px; font-weight: 600;">Get Started</a>
    `;

    if (isLoggedIn && user) {
        let dashboardUrl = 'student-dashboard.html';
        if (user.role === 'admin') dashboardUrl = 'admin-dashboard.html';
        else if (user.role === 'lecturer') dashboardUrl = 'lecturer-dashboard.html';

        authButtons = `
            <a href="${dashboardUrl}" class="nav-link" style="font-weight: 600;">Dashboard</a>
            <button onclick="handleLogout()" class="btn btn-outline" style="padding: 10px 24px; border-radius: 8px; font-weight: 600; border-color: var(--primary); color: var(--primary);">Logout</button>
        `;
    }

    const navbarHTML = `
    <nav class="modern-nav" id="navbar">
        <a href="index.html" class="nav-logo">
            <i class="fas fa-graduation-cap"></i>
            <span>LMU Timetable</span>
        </a>
        
        <ul class="nav-menu">
            <li><a href="index.html#home" class="nav-link">Home</a></li>
            <li><a href="index.html#features" class="nav-link">Features</a></li>
            <li><a href="index.html#preview" class="nav-link">About</a></li>
            <li><a href="index.html#footer" class="nav-link">Contact</a></li>
        </ul>

        <div class="nav-cta">
            ${authButtons}
        </div>
    </nav>
    `;

    // Only inject if it doesn't already exist
    if (!document.getElementById('navbar')) {
        const body = document.body;
        const navContainer = document.createElement('div');
        navContainer.innerHTML = navbarHTML;
        body.insertBefore(navContainer.firstElementChild, body.firstChild);
    }

    // Add scroll effect logic
    window.addEventListener('scroll', () => {
        const nav = document.getElementById('navbar');
        if (nav) {
            if (window.scrollY > 50) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        }
    });
}

// Handle logout
function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Auto-inject on load
document.addEventListener('DOMContentLoaded', injectNavbar);
