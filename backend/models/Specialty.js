const pool = require('../config/database');

class Specialty {
    static async ensureTable() {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS specialties (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                code VARCHAR(50) UNIQUE NOT NULL,
                department_id INTEGER REFERENCES departments(id) ON DELETE CASCADE,
                school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Migration
        await pool.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='specialties' AND column_name='school_id') THEN
                    ALTER TABLE specialties ADD COLUMN school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='specialties' AND column_name='created_at') THEN
                    ALTER TABLE specialties ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
                END IF;
            END $$;
        `);
    }

    static async create(specialtyData) {
        const { name, code, department_id, school_id } = specialtyData;
        const result = await pool.query(
            'INSERT INTO specialties (name, code, department_id, school_id) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, code, department_id, school_id]
        );
        return result.rows[0];
    }

    static async findAll() {
        const result = await pool.query(
            `SELECT s.*, d.name as department_name, sch.name as school_name 
             FROM specialties s 
             LEFT JOIN departments d ON s.department_id = d.id 
             LEFT JOIN schools sch ON s.school_id = sch.id
             ORDER BY s.name`
        );
        return result.rows;
    }

    static async findById(id) {
        const result = await pool.query(
            `SELECT s.*, d.name as department_name, sch.name as school_name 
             FROM specialties s 
             LEFT JOIN departments d ON s.department_id = d.id 
             LEFT JOIN schools sch ON s.school_id = sch.id
             WHERE s.id = $1`,
            [id]
        );
        return result.rows[0];
    }

    static async findByDepartment(departmentId) {
        const result = await pool.query(
            `SELECT s.*, d.name as department_name, sch.name as school_name 
             FROM specialties s 
             LEFT JOIN departments d ON s.department_id = d.id 
             LEFT JOIN schools sch ON s.school_id = sch.id
             WHERE s.department_id = $1 
             ORDER BY s.name`,
            [departmentId]
        );
        return result.rows;
    }

    static async update(id, specialtyData) {
        const { name, code, department_id, school_id } = specialtyData;
        const result = await pool.query(
            'UPDATE specialties SET name = $1, code = $2, department_id = $3, school_id = $4 WHERE id = $5 RETURNING *',
            [name, code, department_id, school_id, id]
        );
        return result.rows[0];
    }

    static async delete(id) {
        await pool.query('DELETE FROM specialties WHERE id = $1', [id]);
        return true;
    }
}

module.exports = Specialty;
