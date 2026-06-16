const API_URL = 'http://localhost:5000/api';

async function testAPI() {
    try {
        const endpoints = ['schools', 'departments', 'specialties', 'lecturers', 'rooms', 'users'];
        for (const ep of endpoints) {
            console.log(`Checking ${ep}...`);
            const res = await fetch(`${API_URL}/${ep}`);
            const data = await res.json();
            if (data.success && data.data.length > 0) {
                console.log(`Sample ${ep}:`, data.data[0]);
            } else {
                console.log(`No data or failure for ${ep}`);
            }
        }
    } catch (e) {
        console.error('Test failed:', e.message);
    }
}

// In node we don't have fetch by default unless it's latest, but I can use axios or similar.
// Since I'm in the terminal, I'll just use curl to check.
