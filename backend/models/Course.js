const pool = require('../config/database');

class Course {
    static async create(courseData) {
        const { course_code, course_name, credits, department_id, level_id, semester } = courseData;
        const result = await pool.query(
            'INSERT INTO courses (course_code, course_name, credits, department_id, level_id, semester) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [course_code, course_name, credits, department_id, level_id, semester]
        );
        return result.rows[0];
    }

    static async findAll() {
        const result = await pool.query(
            `SELECT c.*, d.name as department_name, l.level_number 
             FROM courses c
             LEFT JOIN departments d ON c.department_id = d.id
             LEFT JOIN levels l ON c.level_id = l.id
             ORDER BY c.course_code`
        );
        return result.rows;
    }

    static async findById(id) {
        const result = await pool.query(
            `SELECT c.*, d.name as department_name, l.level_number 
             FROM courses c
             LEFT JOIN departments d ON c.department_id = d.id
             LEFT JOIN levels l ON c.level_id = l.id
             WHERE c.id = $1`,
            [id]
        );
        return result.rows[0];
    }

    static async update(id, courseData) {
        const { course_code, course_name, credits, department_id, level_id, semester } = courseData;
        const result = await pool.query(
            'UPDATE courses SET course_code = $1, course_name = $2, credits = $3, department_id = $4, level_id = $5, semester = $6 WHERE id = $7 RETURNING *',
            [course_code, course_name, credits, department_id, level_id, semester, id]
        );
        return result.rows[0];
    }

    static async delete(id) {
        await pool.query('DELETE FROM courses WHERE id = $1', [id]);
        return true;
    }

    static async findByDepartment(departmentId) {
        const result = await pool.query(
            'SELECT * FROM courses WHERE department_id = $1 ORDER BY course_code',
            [departmentId]
        );
        return result.rows;
    }
}

module.exports = Course;