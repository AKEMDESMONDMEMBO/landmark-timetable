const pool = require('../config/database');

class Lecturer {
    static async create(lecturerData) {
        const { user_id, department_id, employee_id, specialization } = lecturerData;
        const result = await pool.query(
            'INSERT INTO lecturers (user_id, department_id, employee_id, specialization) VALUES ($1, $2, $3, $4) RETURNING *',
            [user_id, department_id, employee_id, specialization]
        );
        return result.rows[0];
    }

    static async findAll() {
        const result = await pool.query(
            `SELECT l.*, u.full_name, u.email, d.name as department_name
             FROM lecturers l
             JOIN users u ON l.user_id = u.id
             LEFT JOIN departments d ON l.department_id = d.id
             ORDER BY u.full_name`
        );
        return result.rows;
    }

    static async findById(id) {
        const result = await pool.query(
            `SELECT l.*, u.full_name, u.email, d.name as department_name
             FROM lecturers l
             JOIN users u ON l.user_id = u.id
             LEFT JOIN departments d ON l.department_id = d.id
             WHERE l.id = $1`,
            [id]
        );
        return result.rows[0];
    }

    static async findByUserId(userId) {
        const result = await pool.query('SELECT * FROM lecturers WHERE user_id = $1', [userId]);
        return result.rows[0];
    }

    static async update(id, lecturerData) {
        const { department_id, specialization } = lecturerData;
        const result = await pool.query(
            'UPDATE lecturers SET department_id = $1, specialization = $2 WHERE id = $3 RETURNING *',
            [department_id, specialization, id]
        );
        return result.rows[0];
    }

    static async delete(id) {
        await pool.query('DELETE FROM lecturers WHERE id = $1', [id]);
        return true;
    }

    static async assignCourse(lecturerId, courseId) {
        const result = await pool.query(
            'INSERT INTO lecturer_courses (lecturer_id, course_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *',
            [lecturerId, courseId]
        );
        return result.rows[0];
    }

    static async getCourses(lecturerId) {
        const result = await pool.query(
            `SELECT c.* FROM courses c
             JOIN lecturer_courses lc ON c.id = lc.course_id
             WHERE lc.lecturer_id = $1`,
            [lecturerId]
        );
        return result.rows;
    }
}

module.exports = Lecturer;