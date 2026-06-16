const Timetable = require('../models/Timetable');
const { runGeneticScheduler } = require('../services/geneticSchedulerService');
const { suggestFixes } = require('../services/suggestionService');
const { notifyRole, notifySystem } = require('../services/notificationService');

function hasAnyConflict(conflicts) {
    return conflicts.lecturer || conflicts.room || conflicts.level;
}

function mapConflictMessages(conflicts) {
    const items = [];
    if (conflicts.lecturer) items.push('Lecturer has a conflict at this time');
    if (conflicts.room) items.push('Room is already booked at this time');
    if (conflicts.level) items.push('Level has another class at this time');
    return items;
}

exports.createTimetableEntry = async (req, res) => {
    try {
        const { course_id, lecturer_id, room_id, level_id, time_slot_id, academic_year, semester } = req.body;
        
        // Check for conflicts
        const conflicts = await Timetable.checkConflicts(course_id, lecturer_id, room_id, level_id, time_slot_id);
        
        if (hasAnyConflict(conflicts)) {
            const suggestionData = await Timetable.getSuggestions({
                courseId: course_id,
                levelId: level_id,
                lecturerId: lecturer_id,
                roomId: room_id,
                timeSlotId: time_slot_id
            });
            return res.status(409).json({
                success: false,
                message: 'Schedule conflict detected',
                conflicts: mapConflictMessages(conflicts),
                suggestions: suggestFixes(conflicts, {
                    availableRooms: suggestionData.rooms,
                    availableTimeSlots: suggestionData.slots,
                    alternativeLecturers: suggestionData.lecturers
                })
            });
        }
        
        const entry = await Timetable.create({ course_id, lecturer_id, room_id, level_id, time_slot_id, academic_year, semester });
        await notifyRole('admin', 'Timetable Updated', 'A timetable entry was created.');
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
        const user = req.user;
        let timetable;

        // For students, only show timetable entries for their level and department
        if (user.role === 'student') {
            const User = require('../models/user');
            const studentUser = await User.findById(user.id);
            
            if (!studentUser || !studentUser.level_id || !studentUser.department_id) {
                return res.json({ success: true, data: [] });
            }
            timetable = await Timetable.findByStudentLevelAndDepartment(studentUser.level_id, studentUser.department_id);
        } else {
            // For admin and lecturers, show all entries
            timetable = await Timetable.findAll();
        }

        res.json({ success: true, data: timetable });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteTimetableEntry = async (req, res) => {
    try {
        const { id } = req.params;
        await Timetable.delete(id);
        await notifyRole('admin', 'Timetable Updated', 'A timetable entry was deleted.');
        res.json({ success: true, message: 'Timetable entry deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateTimetableEntry = async (req, res) => {
    try {
        const { id } = req.params;
        const { course_id, lecturer_id, room_id, level_id, time_slot_id, academic_year, semester } = req.body;

        const conflicts = await Timetable.checkConflicts(course_id, lecturer_id, room_id, level_id, time_slot_id, id);
        if (hasAnyConflict(conflicts)) {
            const suggestionData = await Timetable.getSuggestions({
                courseId: course_id,
                levelId: level_id,
                lecturerId: lecturer_id,
                roomId: room_id,
                timeSlotId: time_slot_id,
                excludeId: id
            });
            return res.status(409).json({
                success: false,
                message: 'Schedule conflict detected',
                conflicts: mapConflictMessages(conflicts),
                suggestions: suggestFixes(conflicts, {
                    availableRooms: suggestionData.rooms,
                    availableTimeSlots: suggestionData.slots,
                    alternativeLecturers: suggestionData.lecturers
                })
            });
        }

        const updated = await Timetable.update(id, { course_id, lecturer_id, room_id, level_id, time_slot_id, academic_year, semester });
        await notifyRole('admin', 'Timetable Updated', 'A timetable entry was updated.');
        res.json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.generateTimetable = async (req, res) => {
    try {
        const semester = parseInt(req.body.semester || 1, 10);
        const academicYear = req.body.academic_year || new Date().getFullYear().toString();
        const shouldPersist = req.body.persist !== false;

        const poolData = await Timetable.getGenerationPool(semester, academicYear);
        const lecturersByCourse = new Map();
        const fallbackLecturers = [];
        poolData.lecturerCourseRows.forEach((row) => {
            if (!fallbackLecturers.some((l) => l.id === row.id)) fallbackLecturers.push({ id: row.id });
            if (!row.course_id) return;
            if (!lecturersByCourse.has(row.course_id)) lecturersByCourse.set(row.course_id, []);
            lecturersByCourse.get(row.course_id).push({ id: row.id });
        });

        for (const course of poolData.courses) {
            if (!lecturersByCourse.has(course.id) || !lecturersByCourse.get(course.id).length) {
                lecturersByCourse.set(course.id, fallbackLecturers.length ? fallbackLecturers : [{ id: 1 }]);
            }
        }

        const result = runGeneticScheduler({
            courses: poolData.courses,
            lecturersByCourse,
            rooms: poolData.rooms,
            timeSlots: poolData.timeSlots,
            defaults: { academic_year: academicYear, semester }
        });

        if (shouldPersist && result.bestChromosome.length) {
            await Timetable.bulkCreate(result.bestChromosome);
            await notifySystem('New Timetable Generated', `Automatic generation completed for semester ${semester}.`);
        }

        res.json({
            success: true,
            message: 'Timetable generated',
            data: {
                fitness: result.bestFitness,
                generations: result.generationsRun,
                entries: result.bestChromosome.length,
                timetable: result.bestChromosome
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getSuggestions = async (req, res) => {
    try {
        const { course_id, level_id, lecturer_id, room_id, time_slot_id, exclude_id } = req.query;
        const suggestions = await Timetable.getSuggestions({
            courseId: parseInt(course_id, 10),
            levelId: parseInt(level_id, 10),
            lecturerId: parseInt(lecturer_id, 10),
            roomId: parseInt(room_id, 10),
            timeSlotId: parseInt(time_slot_id, 10),
            excludeId: exclude_id ? parseInt(exclude_id, 10) : null
        });
        res.json({ success: true, data: suggestions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};