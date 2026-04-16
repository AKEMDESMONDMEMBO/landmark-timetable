const express = require('express');
const router = express.Router();
const specialtyController = require('../controllers/specialtyController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { validateSpecialty, validate } = require('../middleware/validation');

router.get('/', authenticateToken, specialtyController.getAllSpecialties);
router.get('/:id', authenticateToken, specialtyController.getSpecialtyById);
router.get('/department/:departmentId', authenticateToken, specialtyController.getSpecialtiesByDepartment);
router.post('/', authenticateToken, authorizeRole('admin'), validate(validateSpecialty), specialtyController.createSpecialty);
router.put('/:id', authenticateToken, authorizeRole('admin'), validate(validateSpecialty), specialtyController.updateSpecialty);
router.delete('/:id', authenticateToken, authorizeRole('admin'), specialtyController.deleteSpecialty);

module.exports = router;
