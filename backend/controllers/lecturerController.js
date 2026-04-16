const Lecturer = require('../models/Lecturer');

exports.getAllLecturers = async (req, res) => {
    try {
        const lecturers = await Lecturer.findAll();
        res.json({ success: true, data: lecturers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getLecturerById = async (req, res) => {
    try {
        const lecturer = await Lecturer.findById(req.params.id);
        if (!lecturer) {
            return res.status(404).json({ success: false, message: 'Lecturer not found' });
        }
        res.json({ success: true, data: lecturer });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createLecturer = async (req, res) => {
    try {
        const lecturer = await Lecturer.create(req.body);
        res.status(201).json({ success: true, data: lecturer });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateLecturer = async (req, res) => {
    try {
        const lecturer = await Lecturer.update(req.params.id, req.body);
        if (!lecturer) {
            return res.status(404).json({ success: false, message: 'Lecturer not found' });
        }
        res.json({ success: true, data: lecturer });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteLecturer = async (req, res) => {
    try {
        await Lecturer.delete(req.params.id);
        res.json({ success: true, message: 'Lecturer deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.assignCourseToLecturer = async (req, res) => {
    try {
        const { lecturerId, courseId } = req.body;
        const assignment = await Lecturer.assignCourse(lecturerId, courseId);
        res.json({ success: true, data: assignment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getLecturerCourses = async (req, res) => {
    try {
        const courses = await Lecturer.getCourses(req.params.id);
        res.json({ success: true, data: courses });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};