const pool = require('../config/database');

class Notification {
    static async ensureTable() {
        await pool.query(
            `CREATE TABLE IF NOT EXISTS notifications (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                role_target VARCHAR(20),
                title VARCHAR(150) NOT NULL,
                message TEXT NOT NULL,
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`
        );
    }

    static async create({ user_id = null, role_target = null, title, message }) {
        const result = await pool.query(
            `INSERT INTO notifications (user_id, role_target, title, message)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [user_id, role_target, title, message]
        );
        return result.rows[0];
    }

    static async findForUser({ userId, role }) {
        const result = await pool.query(
            `SELECT * FROM notifications
             WHERE user_id = $1 OR role_target = $2 OR (user_id IS NULL AND role_target IS NULL)
             ORDER BY created_at DESC
             LIMIT 50`,
            [userId, role]
        );
        return result.rows;
    }

    static async markRead(id, userId) {
        const result = await pool.query(
            `UPDATE notifications
             SET is_read = TRUE
             WHERE id = $1 AND (user_id = $2 OR user_id IS NULL)
             RETURNING *`,
            [id, userId]
        );
        return result.rows[0];
    }
}

module.exports = Notification;
