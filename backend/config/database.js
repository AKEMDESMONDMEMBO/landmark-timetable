const { Pool } = require('pg');
require('dotenv').config();

// Database connection using environment variables
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});

// Test connection
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Database connection error:', err.message);
        console.error('\n💡 Troubleshooting:');
        console.error('   1. Does the database "landmark_timetable" exist?');
        console.error('   2. Does user "desmond" have access to it?');
        console.error('\nRun these commands in psql:');
        console.error('   CREATE DATABASE landmark_timetable;');
        console.error('   GRANT ALL PRIVILEGES ON DATABASE landmark_timetable TO desmond;');
    } else {
        console.log('✅ Database connected successfully as: desmond');
        release();
    }
});

module.exports = pool;