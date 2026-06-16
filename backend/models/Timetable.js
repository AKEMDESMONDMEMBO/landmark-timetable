const pool = require('../config/database');

class Timetable {
    static async ensureTable() {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS timetable (
                id SERIAL PRIMARY KEY,
                course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
                lecturer_id INTEGER REFERENCES lecturers(id) ON DELETE CASCADE,
                room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE,
                level_id INTEGER REFERENCES levels(id) ON DELETE CASCADE,
                time_slot_id INTEGER REFERENCES time_slots(id) ON DELETE CASCADE,
                academic_year VARCHAR(20) NOT NULL,
                semester INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
    }

    static async checkConflicts(courseId, lecturerId, roomId, levelId, timeSlotId, excludeId = null) {
        const conflicts = {
            lecturer: false,
            room: false,
            level: false
        };
        const excludeClause = excludeId ? ' AND id <> $3' : '';
        const args2 = [lecturerId, timeSlotId];
        const argsRoom = [roomId, timeSlotId];
        const argsLevel = [levelId, timeSlotId];
        if (excludeId) {
            args2.push(excludeId);
            argsRoom.push(excludeId);
            argsLevel.push(excludeId);
        }

        // Check lecturer conflict
        const lecturerConflict = await pool.query(
            `SELECT id FROM timetable WHERE lecturer_id = $1 AND time_slot_id = $2${excludeClause}`,
            args2
        );
        if (lecturerConflict.rows.length > 0) conflicts.lecturer = true;

        // Check room conflict
        const roomConflict = await pool.query(
            `SELECT id FROM timetable WHERE room_id = $1 AND time_slot_id = $2${excludeClause}`,
            argsRoom
        );
        if (roomConflict.rows.length > 0) conflicts.room = true;

        // Check level conflict
        const levelConflict = await pool.query(
            `SELECT id FROM timetable WHERE level_id = $1 AND time_slot_id = $2${excludeClause}`,
            argsLevel
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

    static async bulkCreate(entries) {
        if (!entries.length) return [];

        const created = [];
        for (const entry of entries) {
            const inserted = await this.create(entry);
            created.push(inserted);
        }
        return created;
    }

    static async update(id, entryData) {
        const { course_id, lecturer_id, room_id, level_id, time_slot_id, academic_year, semester } = entryData;
        const result = await pool.query(
            `UPDATE timetable
             SET course_id = $1, lecturer_id = $2, room_id = $3, level_id = $4, time_slot_id = $5, academic_year = $6, semester = $7
             WHERE id = $8
             RETURNING *`,
            [course_id, lecturer_id, room_id, level_id, time_slot_id, academic_year, semester, id]
        );
        return result.rows[0];
    }

    static async findByLecturer(lecturerId) {
        const result = await pool.query(
            `SELECT t.*, c.course_code, c.course_name, r.room_number, r.capacity AS room_capacity, l.level_number, l.name as level_name, ts.day_of_week, ts.start_time, ts.end_time
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
            `SELECT t.*, c.course_code, c.course_name, r.room_number, r.capacity AS room_capacity, l.level_number, l.name as level_name,
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
            `SELECT t.*, c.course_code, c.course_name, r.room_number, r.capacity AS room_capacity, l.level_number, l.name as level_name,
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
            `SELECT t.*, c.course_code, c.course_name, r.room_number, r.capacity AS room_capacity, l.level_number, l.name as level_name,
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

    static async findByStudentLevelAndDepartment(levelId, departmentId) {
        const result = await pool.query(
            `SELECT t.*, c.course_code, c.course_name, r.room_number, r.capacity AS room_capacity, l.level_number, l.name as level_name,
                    ts.day_of_week, ts.start_time, ts.end_time, u.full_name as lecturer_name
             FROM timetable t
             JOIN courses c ON t.course_id = c.id
             JOIN rooms r ON t.room_id = r.id
             JOIN levels l ON t.level_id = l.id
             JOIN time_slots ts ON t.time_slot_id = ts.id
             JOIN lecturers lec ON t.lecturer_id = lec.id
             JOIN users u ON lec.user_id = u.id
             WHERE t.level_id = $1 AND c.department_id = $2
             ORDER BY ts.day_of_week, ts.start_time`,
            [levelId, departmentId]
        );
        return result.rows;
    }

    static async delete(id) {
        await pool.query('DELETE FROM timetable WHERE id = $1', [id]);
        return true;
    }

    static async getGenerationPool(semester, academicYear) {
        const coursesQuery = await pool.query(
            'SELECT id, level_id FROM courses WHERE semester = $1 ORDER BY id',
            [semester]
        );

        const roomsQuery = await pool.query('SELECT id, room_number FROM rooms ORDER BY id');
        const slotsQuery = await pool.query('SELECT id, day_of_week, start_time, end_time FROM time_slots ORDER BY day_of_week, start_time');
        const lecturersQuery = await pool.query(
            `SELECT l.id, lc.course_id, u.full_name
             FROM lecturers l
             LEFT JOIN lecturer_courses lc ON lc.lecturer_id = l.id
             JOIN users u ON u.id = l.user_id
             ORDER BY l.id`
        );
        const existingQuery = await pool.query(
            'SELECT * FROM timetable WHERE semester = $1 AND academic_year = $2',
            [semester, academicYear]
        );

        return {
            courses: coursesQuery.rows,
            rooms: roomsQuery.rows,
            timeSlots: slotsQuery.rows,
            lecturerCourseRows: lecturersQuery.rows,
            existingEntries: existingQuery.rows
        };
    }

    static async getSuggestions({ courseId, levelId, lecturerId, roomId, timeSlotId, excludeId = null }) {
        const excludeClause = excludeId ? 'AND t.id <> $2' : '';
        const roomArgs = excludeId ? [timeSlotId, excludeId] : [timeSlotId];
        const roomQuery = await pool.query(
            `SELECT r.room_number
             FROM rooms r
             WHERE r.id NOT IN (
                SELECT t.room_id FROM timetable t WHERE t.time_slot_id = $1 ${excludeClause}
             )
             ORDER BY r.capacity DESC
             LIMIT 5`,
            roomArgs
        );

        const slotArgs = excludeId ? [lecturerId, levelId, excludeId] : [lecturerId, levelId];
        const slotExcludeClause = excludeId ? 'AND t.id <> $3' : '';
        const slotQuery = await pool.query(
            `SELECT ts.day_of_week, ts.start_time, ts.end_time
             FROM time_slots ts
             WHERE ts.id NOT IN (
                SELECT t.time_slot_id FROM timetable t
                WHERE (t.lecturer_id = $1 OR t.level_id = $2) ${slotExcludeClause}
             )
             ORDER BY ts.day_of_week, ts.start_time
             LIMIT 5`,
            slotArgs
        );

        const lecturerArgs = excludeId ? [courseId, timeSlotId, excludeId] : [courseId, timeSlotId];
        const lecturerExcludeClause = excludeId ? 'AND t.id <> $3' : '';
        const lecturerQuery = await pool.query(
            `SELECT u.full_name
             FROM lecturers l
             JOIN users u ON u.id = l.user_id
             LEFT JOIN lecturer_courses lc ON lc.lecturer_id = l.id
             WHERE (lc.course_id = $1 OR lc.course_id IS NULL)
             AND l.id NOT IN (
                SELECT t.lecturer_id FROM timetable t WHERE t.time_slot_id = $2 ${lecturerExcludeClause}
             )
             ORDER BY u.full_name
             LIMIT 5`,
            lecturerArgs
        );

        return {
            rooms: roomQuery.rows.map((row) => row.room_number),
            slots: slotQuery.rows.map((row) => `${row.day_of_week} ${row.start_time}-${row.end_time}`),
            lecturers: lecturerQuery.rows.map((row) => row.full_name)
        };
    }
}

module.exports = Timetable;