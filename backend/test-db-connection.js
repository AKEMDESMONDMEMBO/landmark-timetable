const pool = require('./config/database');

async function testDb() {
    try {
        const res = await pool.query('SELECT count(*) FROM users');
        console.log('User count:', res.rows[0].count);
        const users = await pool.query('SELECT email, role FROM users');
        console.log('Users found:', users.rows);
        process.exit(0);
    } catch (err) {
        console.error('Database test failed:', err.message);
        process.exit(1);
    }
}

testDb();
