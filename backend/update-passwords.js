const pool = require('./config/database');
const bcrypt = require('bcrypt');

async function updatePasswords() {
    try {
        // Hash the passwords
        const adminHash = await bcrypt.hash('admin123', 10);
        const lecturerHash = await bcrypt.hash('lecturer123', 10);
        const studentHash = await bcrypt.hash('student123', 10);

        console.log('Hashes generated:');
        console.log('Admin:', adminHash);
        console.log('Lecturer:', lecturerHash);
        console.log('Student:', studentHash);

        // Update the database
        const queries = [
            pool.query('UPDATE users SET password = $1 WHERE email = $2', [adminHash, 'admin@landmark.edu']),
            pool.query('UPDATE users SET password = $1 WHERE email = $2', [lecturerHash, 'lecturer@landmark.edu']),
            pool.query('UPDATE users SET password = $1 WHERE email = $2', [studentHash, 'student@landmark.edu'])
        ];

        await Promise.all(queries);
        console.log('\n✅ Passwords updated successfully!');
        
        // Verify
        const result = await pool.query('SELECT email, password FROM users WHERE email IN ($1, $2, $3)', 
            ['admin@landmark.edu', 'lecturer@landmark.edu', 'student@landmark.edu']);
        
        console.log('\nVerification:');
        result.rows.forEach(row => {
            console.log(`${row.email}: ${row.password}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

updatePasswords();
