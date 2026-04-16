const pool = require('../config/database');
const User = require('../models/user');
const Course = require('../models/Course');
const Lecturer = require('../models/Lecturer');
const Timetable = require('../models/Timetable');

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
        
        if (!lecturer) {
            return res.status(404).json({ success: false, message: 'Lecturer profile not found' });
        }
        
        const timetable = await Timetable.findByLecturer(lecturer.id);
        res.json({ success: true, data: timetable });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};