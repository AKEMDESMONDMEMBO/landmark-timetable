const pool = require('../config/database');
const User = require('../models/user');
const Course = require('../models/Course');
const Lecturer = require('../models/Lecturer');
const Timetable = require('../models/Timetable');
const Notification = require('../models/Notification');

exports.getDashboardStats = async (req, res) => {
    try {
        const users = await User.findAll();
        const courses = await Course.findAll();
        const lecturers = await Lecturer.findAll();
        const timetable = await Timetable.findAll();
        
        res.json({
            success: true,
            data: {
                totalUsers: users.length,
                totalCourses: courses.length,
                totalLecturers: lecturers.length,
                totalEntries: timetable.length
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getLevels = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM levels ORDER BY level_number');
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getLevelById = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM levels WHERE id = $1', [req.params.id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Level not found' });
        }
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createLevel = async (req, res) => {
    try {
        const { level_number, description } = req.body;
        if (!level_number) {
            return res.status(400).json({ success: false, message: 'Level number is required' });
        }

        const levelName = `${Number(level_number)} Level`;
        const result = await pool.query(
            'INSERT INTO levels (level_number, name, description) VALUES ($1, $2, $3) RETURNING *',
            [level_number, levelName, description || null]
        );
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateLevel = async (req, res) => {
    try {
        const { level_number, description } = req.body;
        const levelName = `${Number(level_number)} Level`;
        const result = await pool.query(
            'UPDATE levels SET level_number = $1, name = $2, description = $3 WHERE id = $4 RETURNING *',
            [level_number, levelName, description || null, req.params.id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Level not found' });
        }
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteLevel = async (req, res) => {
    try {
        await pool.query('DELETE FROM levels WHERE id = $1', [req.params.id]);
        res.json({ success: true, message: 'Level deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getTimeSlots = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM time_slots ORDER BY day_of_week, start_time');
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getDepartments = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM departments ORDER BY name');
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getLecturerTimetable = async (req, res) => {
    try {
        const user = req.user;
        const lecturer = await Lecturer.findByUserId(user.id);
        let timetable;

        if (lecturer) {
            timetable = await Timetable.findByLecturer(lecturer.id);
        } else {
            // If this lecturer does not have an attached lecturer profile yet,
            // allow access to timetable data as a fallback so lecturer users can still view schedules.
            timetable = await Timetable.findAll();
        }
        res.json({ success: true, data: timetable });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getRoomUsage = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT r.id, r.room_number, r.building, COUNT(t.id)::int AS usage_count
             FROM rooms r
             LEFT JOIN timetable t ON t.room_id = r.id
             GROUP BY r.id
             ORDER BY usage_count DESC, r.room_number`
        );
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getLecturerWorkload = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT l.id, u.full_name AS lecturer_name, COUNT(t.id)::int AS assigned_classes
             FROM lecturers l
             JOIN users u ON u.id = l.user_id
             LEFT JOIN timetable t ON t.lecturer_id = l.id
             GROUP BY l.id, u.full_name
             ORDER BY assigned_classes DESC, u.full_name`
        );
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getNotifications = async (req, res) => {
    try {
        const data = await Notification.findForUser({ userId: req.user.id, role: req.user.role });
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.markNotificationRead = async (req, res) => {
    try {
        const updated = await Notification.markRead(req.params.id, req.user.id);
        if (!updated) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }
        res.json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};