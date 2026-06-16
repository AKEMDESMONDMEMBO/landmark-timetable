const express = require('express');
const router = express.Router();
const schoolController = require('../controllers/schoolController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { validateSchool, validate } = require('../middleware/validation');

router.post('/', authenticateToken, authorizeRole('admin'), validate(validateSchool), schoolController.createSchool);
router.get('/', authenticateToken, schoolController.getAllSchools);
router.get('/:id', authenticateToken, schoolController.getSchoolById);
router.put('/:id', authenticateToken, authorizeRole('admin'), validate(validateSchool), schoolController.updateSchool);
router.delete('/:id', authenticateToken, authorizeRole('admin'), schoolController.deleteSchool);

module.exports = router;
