const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

router.get('/', authenticateToken, authorizeRole('admin'), userController.getAllUsers);
router.get('/:id', authenticateToken, authorizeRole('admin'), userController.getUserById);
router.post('/', authenticateToken, authorizeRole('admin'), userController.createUser);
router.put('/:id', authenticateToken, authorizeRole('admin'), userController.updateUser);
router.delete('/:id', authenticateToken, authorizeRole('admin'), userController.deleteUser);

module.exports = router;