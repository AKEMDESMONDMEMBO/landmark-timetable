const pool = require('../config/database');

class Department {
    static async create(departmentData) {
        const { name, code, description } = departmentData;
        const result = await pool.query(
            'INSERT INTO departments (name, code, description) VALUES ($1, $2, $3) RETURNING *',
            [name, code, description]
        );
        return result.rows[0];
    }

    static async findAll() {
        const result = await pool.query(
            'SELECT d.*, COUNT(s.id) as specialty_count FROM departments d LEFT JOIN specialties s ON d.id = s.department_id GROUP BY d.id ORDER BY d.name'
        );
        return result.rows;
    }

    static async findById(id) {
        const result = await pool.query('SELECT * FROM departments WHERE id = $1', [id]);
        return result.rows[0];
    }

    static async update(id, departmentData) {
        const { name, code, description } = departmentData;
        const result = await pool.query(
            'UPDATE departments SET name = $1, code = $2, description = $3 WHERE id = $4 RETURNING *',
            [name, code, description, id]
        );
        return result.rows[0];
    }

    static async delete(id) {
        await pool.query('DELETE FROM departments WHERE id = $1', [id]);
        return true;
    }
}

module.exports = Department;