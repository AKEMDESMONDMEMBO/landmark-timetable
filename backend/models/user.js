const pool = require('../config/database');
const bcrypt = require('bcrypt');

class User {
    static async ensureTable() {
        // Create users table if it doesn't exist
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                full_name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(50) DEFAULT 'student',
                department_id INTEGER,
                specialty_id INTEGER,
                level_id INTEGER,
                profile_image TEXT,
                is_verified BOOLEAN DEFAULT FALSE,
                verification_otp VARCHAR(6),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Ensure columns exist (for migration of older versions)
        await pool.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='department_id') THEN
                    ALTER TABLE users ADD COLUMN department_id INTEGER;
                END IF;

                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='specialty_id') THEN
                    ALTER TABLE users ADD COLUMN specialty_id INTEGER;
                END IF;

                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='level_id') THEN
                    ALTER TABLE users ADD COLUMN level_id INTEGER;
                END IF;

                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='is_verified') THEN
                    ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;
                END IF;
                
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='verification_otp') THEN
                    ALTER TABLE users ADD COLUMN verification_otp VARCHAR(6);
                END IF;

                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='profile_image') THEN
                    ALTER TABLE users ADD COLUMN profile_image TEXT;
                END IF;
            END $$;
        `);
    }

    static async create(userData) {
        const { full_name, email, password, role, department_id = null, specialty_id = null, level_id = null } = userData;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const result = await pool.query(
            'INSERT INTO users (full_name, email, password, role, department_id, specialty_id, level_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, full_name, email, role, department_id, specialty_id, level_id, profile_image',
            [full_name, email, hashedPassword, role, department_id, specialty_id, level_id]
        );
        return result.rows[0];
    }

    static async findByEmail(email) {
        const result = await pool.query('SELECT id, full_name, email, password, role, department_id, specialty_id, level_id, is_verified, verification_otp, profile_image FROM users WHERE email = $1', [email]);
        return result.rows[0];
    }

    static async verifyOTP(email, otp) {
        const result = await pool.query(
            'UPDATE users SET is_verified = TRUE, verification_otp = NULL WHERE email = $1 AND verification_otp = $2 RETURNING id, full_name, email, role',
            [email, otp]
        );
        return result.rows[0];
    }

    static async updateOTP(email, otp) {
        const result = await pool.query(
            'UPDATE users SET verification_otp = $1 WHERE email = $2',
            [otp, email]
        );
        return result.rowCount > 0;
    }

    static async findById(id) {
        const result = await pool.query('SELECT id, full_name, email, role, department_id, specialty_id, level_id, is_verified, created_at, profile_image FROM users WHERE id = $1', [id]);
        return result.rows[0];
    }

    static async findAll() {
        const result = await pool.query('SELECT id, full_name, email, role, is_verified, created_at, profile_image, department_id, specialty_id, level_id FROM users ORDER BY created_at DESC');
        return result.rows;
    }

    static async update(id, userData) {
        const { full_name, email, role, profile_image } = userData;
        const result = await pool.query(
            'UPDATE users SET full_name = $1, email = $2, role = $3, profile_image = $4 WHERE id = $5 RETURNING id, full_name, email, role, profile_image',
            [full_name, email, role, profile_image, id]
        );
        return result.rows[0];
    }

    static async delete(id) {
        await pool.query('DELETE FROM users WHERE id = $1', [id]);
        return true;
    }
}

module.exports = User;