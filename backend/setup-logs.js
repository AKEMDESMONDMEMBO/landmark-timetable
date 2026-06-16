const pool = require('./config/database');

async function setupActivityLogs() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS activity_logs (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
                action VARCHAR(255) NOT NULL,
                entity_type VARCHAR(100) NOT NULL,
                entity_id INTEGER,
                details TEXT,
                ip_address VARCHAR(45),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Activity logs table created or already exists.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating activity logs table:', error.message);
        process.exit(1);
    }
}

setupActivityLogs();
