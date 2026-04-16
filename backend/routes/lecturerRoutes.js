const express = require('express');
const router = express.Router();
const lecturerController = require('../controllers/lecturerController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { validateLecturer, validate } = require('../middleware/validation');

router.get('/', authenticateToken, lecturerController.getAllLecturers);
router.get('/:id', authenticateToken, lecturerController.getLecturerById);
router.post('/', authenticateToken, authorizeRole('admin'), validate(validateLecturer), lecturerController.createLecturer);
router.put('/:id', authenticateToken, authorizeRole('admin'), validate(validateLecturer), lecturerController.updateLecturer);
router.delete('/:id', authenticateToken, authorizeRole('admin'), lecturerController.deleteLecturer);
router.post('/assign-course', authenticateToken, authorizeRole('admin'), lecturerController.assignCourseToLecturer);
router.get('/:id/courses', authenticateToken, lecturerController.getLecturerCourses);

module.exports = router;