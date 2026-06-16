const pool = require('../config/database');

class Department {
    static async ensureTable() {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS departments (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                code VARCHAR(50) UNIQUE NOT NULL,
                description TEXT,
                school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Ensure columns exist (migration)
        await pool.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='departments' AND column_name='school_id') THEN
                    ALTER TABLE departments ADD COLUMN school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='departments' AND column_name='created_at') THEN
                    ALTER TABLE departments ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
                END IF;
            END $$;
        `);
    }

    static async create(departmentData) {
        const { name, code, description, school_id } = departmentData;
        const result = await pool.query(
            'INSERT INTO departments (name, code, description, school_id) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, code, description, school_id]
        );
        return result.rows[0];
    }

    static async findAll() {
        const result = await pool.query(
            `SELECT d.*, s.name as school_name, COUNT(sp.id) as specialty_count 
             FROM departments d 
             LEFT JOIN schools s ON d.school_id = s.id
             LEFT JOIN specialties sp ON d.id = sp.department_id 
             GROUP BY d.id, s.name 
             ORDER BY d.name`
        );
        return result.rows;
    }

    static async findById(id) {
        const result = await pool.query(
            'SELECT d.*, s.name as school_name FROM departments d LEFT JOIN schools s ON d.school_id = s.id WHERE d.id = $1', 
            [id]
        );
        return result.rows[0];
    }

    static async update(id, departmentData) {
        const { name, code, description, school_id } = departmentData;
        const result = await pool.query(
            'UPDATE departments SET name = $1, code = $2, description = $3, school_id = $4 WHERE id = $5 RETURNING *',
            [name, code, description, school_id, id]
        );
        return result.rows[0];
    }

    static async delete(id) {
        await pool.query('DELETE FROM departments WHERE id = $1', [id]);
        return true;
    }
}

module.exports = Department;