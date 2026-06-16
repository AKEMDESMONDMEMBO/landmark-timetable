const http = require('http');

async function get(url) {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        }).on('error', reject);
    });
}

async function test() {
    try {
        const schools = await get('http://localhost:5000/api/schools');
        console.log('Schools Data:', schools.data && schools.data[0]);

        const depts = await get('http://localhost:5000/api/departments');
        console.log('Departments Data:', depts.data && depts.data[0]);

        const specs = await get('http://localhost:5000/api/specialties');
        console.log('Specialties Data:', specs.data && specs.data[0]);

        const users = await get('http://localhost:5000/api/users');
        console.log('Users Data:', users.data && users.data[0]);
    } catch (e) {
        console.error(e);
    }
}

test();
