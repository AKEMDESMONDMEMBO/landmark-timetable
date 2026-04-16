const pool = require('../config/database');
const bcrypt = require('bcrypt');

class User {
    static async create(userData) {
        const { full_name, email, password, role } = userData;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const result = await pool.query(
            'INSERT INTO users (full_name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, full_name, email, role',
            [full_name, email, hashedPassword, role]
        );
        return result.rows[0];
    }

    static async findByEmail(email) {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        return result.rows[0];
    }

    static async findById(id) {
        const result = await pool.query('SELECT id, full_name, email, role, created_at FROM users WHERE id = $1', [id]);
        return result.rows[0];
    }

    static async findAll() {
        const result = await pool.query('SELECT id, full_name, email, role, created_at FROM users ORDER BY created_at DESC');
        return result.rows;
    }

    static async update(id, userData) {
        const { full_name, email, role } = userData;
        const result = await pool.query(
            'UPDATE users SET full_name = $1, email = $2, role = $3 WHERE id = $4 RETURNING id, full_name, email, role',
            [full_name, email, role, id]
        );
        return result.rows[0];
    }

    static async delete(id) {
        await pool.query('DELETE FROM users WHERE id = $1', [id]);
        return true;
    }
}

module.exports = User;