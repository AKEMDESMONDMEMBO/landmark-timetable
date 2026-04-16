const express = require('express');
const router = express.Router();
const timetableController = require('../controllers/timetableController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

router.post('/', authenticateToken, authorizeRole('admin'), timetableController.createTimetableEntry);
router.get('/', authenticateToken, timetableController.getAllTimetable);
router.get('/lecturer/:lecturerId', authenticateToken, timetableController.getTimetableByLecturer);
router.get('/level/:levelId', authenticateToken, timetableController.getTimetableByLevel);
router.get('/department/:departmentId', authenticateToken, timetableController.getTimetableByDepartment);
router.delete('/:id', authenticateToken, authorizeRole('admin'), timetableController.deleteTimetableEntry);

module.exports = router;