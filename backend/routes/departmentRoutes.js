const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { validateDepartment, validate } = require('../middleware/validation');

router.get('/', authenticateToken, departmentController.getAllDepartments);
router.get('/:id', authenticateToken, departmentController.getDepartmentById);
router.post('/', authenticateToken, authorizeRole('admin'), validate(validateDepartment), departmentController.createDepartment);
router.put('/:id', authenticateToken, authorizeRole('admin'), validate(validateDepartment), departmentController.updateDepartment);
router.delete('/:id', authenticateToken, authorizeRole('admin'), departmentController.deleteDepartment);

module.exports = router;
