const Timetable = require('../models/Timetable');

exports.createTimetableEntry = async (req, res) => {
    try {
        const { course_id, lecturer_id, room_id, level_id, time_slot_id, academic_year, semester } = req.body;
        
        // Check for conflicts
        const conflicts = await Timetable.checkConflicts(course_id, lecturer_id, room_id, level_id, time_slot_id);
        
        if (conflicts.lecturer || conflicts.room || conflicts.level) {
            const errorMessages = [];
            if (conflicts.lecturer) errorMessages.push('Lecturer has a conflict at this time');
            if (conflicts.room) errorMessages.push('Room is already booked at this time');
            if (conflicts.level) errorMessages.push('Level has another class at this time');
            
            return res.status(409).json({
                success: false,
                message: 'Schedule conflict detected',
                conflicts: errorMessages
            });
        }
        
        const entry = await Timetable.create({ course_id, lecturer_id, room_id, level_id, time_slot_id, academic_year, semester });
        res.status(201).json({ success: true, data: entry });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getTimetableByLecturer = async (req, res) => {
    try {
        const { lecturerId } = req.params;
        const timetable = await Timetable.findByLecturer(lecturerId);
        res.json({ success: true, data: timetable });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getTimetableByLevel = async (req, res) => {
    try {
        const { levelId } = req.params;
        const timetable = await Timetable.findByLevel(levelId);
        res.json({ success: true, data: timetable });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getTimetableByDepartment = async (req, res) => {
    try {
        const { departmentId } = req.params;
        const timetable = await Timetable.findByDepartment(departmentId);
        res.json({ success: true, data: timetable });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllTimetable = async (req, res) => {
    try {
        const timetable = await Timetable.findAll();
        res.json({ success: true, data: timetable });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteTimetableEntry = async (req, res) => {
    try {
        const { id } = req.params;
        await Timetable.delete(id);
        res.json({ success: true, message: 'Timetable entry deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};