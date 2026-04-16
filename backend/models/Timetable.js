const pool = require('../config/database');

class Timetable {
    static async checkConflicts(courseId, lecturerId, roomId, levelId, timeSlotId) {
        const conflicts = {
            lecturer: false,
            room: false,
            level: false
        };

        // Check lecturer conflict
        const lecturerConflict = await pool.query(
            'SELECT * FROM timetable WHERE lecturer_id = $1 AND time_slot_id = $2',
            [lecturerId, timeSlotId]
        );
        if (lecturerConflict.rows.length > 0) conflicts.lecturer = true;

        // Check room conflict
        const roomConflict = await pool.query(
            'SELECT * FROM timetable WHERE room_id = $1 AND time_slot_id = $2',
            [roomId, timeSlotId]
        );
        if (roomConflict.rows.length > 0) conflicts.room = true;

        // Check level conflict
        const levelConflict = await pool.query(
            'SELECT * FROM timetable WHERE level_id = $1 AND time_slot_id = $2',
            [levelId, timeSlotId]
        );
        if (levelConflict.rows.length > 0) conflicts.level = true;

        return conflicts;
    }

    static async create(entryData) {
        const { course_id, lecturer_id, room_id, level_id, time_slot_id, academic_year, semester } = entryData;
        
        const result = await pool.query(
            `INSERT INTO timetable (course_id, lecturer_id, room_id, level_id, time_slot_id, academic_year, semester) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) 
             RETURNING *`,
            [course_id, lecturer_id, room_id, level_id, time_slot_id, academic_year, semester]
        );
        return result.rows[0];
    }

    static async findByLecturer(lecturerId) {
        const result = await pool.query(
            `SELECT t.*, c.course_code, c.course_name, r.room_number, l.level_number, ts.day_of_week, ts.start_time, ts.end_time
             FROM timetable t
             JOIN courses c ON t.course_id = c.id
             JOIN rooms r ON t.room_id = r.id
             JOIN levels l ON t.level_id = l.id
             JOIN time_slots ts ON t.time_slot_id = ts.id
             WHERE t.lecturer_id = $1
             ORDER BY ts.day_of_week, ts.start_time`,
            [lecturerId]
        );
        return result.rows;
    }

    static async findByLevel(levelId) {
        const result = await pool.query(
            `SELECT t.*, c.course_code, c.course_name, r.room_number, l.level_number, 
                    ts.day_of_week, ts.start_time, ts.end_time, lec.user_id, u.full_name as lecturer_name
             FROM timetable t
             JOIN courses c ON t.course_id = c.id
             JOIN rooms r ON t.room_id = r.id
             JOIN levels l ON t.level_id = l.id
             JOIN time_slots ts ON t.time_slot_id = ts.id
             JOIN lecturers lec ON t.lecturer_id = lec.id
             JOIN users u ON lec.user_id = u.id
             WHERE t.level_id = $1
             ORDER BY ts.day_of_week, ts.start_time`,
            [levelId]
        );
        return result.rows;
    }

    static async findByDepartment(departmentId) {
        const result = await pool.query(
            `SELECT t.*, c.course_code, c.course_name, r.room_number, l.level_number, 
                    ts.day_of_week, ts.start_time, ts.end_time, u.full_name as lecturer_name
             FROM timetable t
             JOIN courses c ON t.course_id = c.id
             JOIN rooms r ON t.room_id = r.id
             JOIN levels l ON t.level_id = l.id
             JOIN time_slots ts ON t.time_slot_id = ts.id
             JOIN lecturers lec ON t.lecturer_id = lec.id
             JOIN users u ON lec.user_id = u.id
             WHERE c.department_id = $1
             ORDER BY ts.day_of_week, ts.start_time`,
            [departmentId]
        );
        return result.rows;
    }

    static async findAll() {
        const result = await pool.query(
            `SELECT t.*, c.course_code, c.course_name, r.room_number, l.level_number, 
                    ts.day_of_week, ts.start_time, ts.end_time, u.full_name as lecturer_name
             FROM timetable t
             JOIN courses c ON t.course_id = c.id
             JOIN rooms r ON t.room_id = r.id
             JOIN levels l ON t.level_id = l.id
             JOIN time_slots ts ON t.time_slot_id = ts.id
             JOIN lecturers lec ON t.lecturer_id = lec.id
             JOIN users u ON lec.user_id = u.id
             ORDER BY ts.day_of_week, ts.start_time`
        );
        return result.rows;
    }

    static async delete(id) {
        await pool.query('DELETE FROM timetable WHERE id = $1', [id]);
        return true;
    }
}

module.exports = Timetable;