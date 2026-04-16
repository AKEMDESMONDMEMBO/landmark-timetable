const pool = require('../config/database');

class Specialty {
    static async create(specialtyData) {
        const { name, code, department_id } = specialtyData;
        const result = await pool.query(
            'INSERT INTO specialties (name, code, department_id) VALUES ($1, $2, $3) RETURNING *',
            [name, code, department_id]
        );
        return result.rows[0];
    }

    static async findAll() {
        const result = await pool.query(
            'SELECT s.*, d.name as department_name FROM specialties s LEFT JOIN departments d ON s.department_id = d.id ORDER BY s.name'
        );
        return result.rows;
    }

    static async findById(id) {
        const result = await pool.query(
            'SELECT s.*, d.name as department_name FROM specialties s LEFT JOIN departments d ON s.department_id = d.id WHERE s.id = $1',
            [id]
        );
        return result.rows[0];
    }

    static async findByDepartment(departmentId) {
        const result = await pool.query(
            'SELECT * FROM specialties WHERE department_id = $1 ORDER BY name',
            [departmentId]
        );
        return result.rows;
    }

    static async update(id, specialtyData) {
        const { name, code, department_id } = specialtyData;
        const result = await pool.query(
            'UPDATE specialties SET name = $1, code = $2, department_id = $3 WHERE id = $4 RETURNING *',
            [name, code, department_id, id]
        );
        return result.rows[0];
    }

    static async delete(id) {
        await pool.query('DELETE FROM specialties WHERE id = $1', [id]);
        return true;
    }
}

module.exports = Specialty;
