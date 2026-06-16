const express = require('express');
const router = express.Router();
const timetableController = require('../controllers/timetableController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

router.post('/', authenticateToken, authorizeRole('admin'), timetableController.createTimetableEntry);
router.post('/generate', authenticateToken, authorizeRole('admin'), timetableController.generateTimetable);
router.get('/suggestions', authenticateToken, timetableController.getSuggestions);
router.get('/', authenticateToken, timetableController.getAllTimetable);
router.get('/lecturer/:lecturerId', authenticateToken, timetableController.getTimetableByLecturer);
router.get('/level/:levelId', authenticateToken, timetableController.getTimetableByLevel);
router.get('/department/:departmentId', authenticateToken, timetableController.getTimetableByDepartment);
router.put('/:id', authenticateToken, authorizeRole('admin'), timetableController.updateTimetableEntry);
router.delete('/:id', authenticateToken, authorizeRole('admin'), timetableController.deleteTimetableEntry);

module.exports = router;