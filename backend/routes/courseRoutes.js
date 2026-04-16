const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { validateCourse, validate } = require('../middleware/validation');

router.get('/', authenticateToken, courseController.getAllCourses);
router.get('/:id', authenticateToken, courseController.getCourseById);
router.post('/', authenticateToken, authorizeRole('admin'), validate(validateCourse), courseController.createCourse);
router.put('/:id', authenticateToken, authorizeRole('admin'), validate(validateCourse), courseController.updateCourse);
router.delete('/:id', authenticateToken, authorizeRole('admin'), courseController.deleteCourse);

module.exports = router;