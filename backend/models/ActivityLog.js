const pool = require('../config/database');

class ActivityLog {
    static async ensureTable() {
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
    }

    static async create({ userId, action, entityType, entityId, details, ipAddress }) {
        try {
            const result = await pool.query(
                `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details, ip_address) 
                 VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
                [userId, action, entityType, entityId, details, ipAddress]
            );
            return result.rows[0];
        } catch (error) {
            console.error('Error creating activity log:', error);
            return null;
        }
    }

    static async findAll(limit = 100) {
        try {
            const result = await pool.query(
                `SELECT l.*, u.full_name as user_name 
                 FROM activity_logs l 
                 LEFT JOIN users u ON u.id = l.user_id 
                 ORDER BY l.created_at DESC 
                 LIMIT $1`,
                [limit]
            );
            return result.rows;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = ActivityLog;
