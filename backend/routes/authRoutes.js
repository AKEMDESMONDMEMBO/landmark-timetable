const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

router.post('/register', authenticateToken, authorizeRole('admin'), authController.register);
router.post('/signup', authController.publicRegister);
router.post('/login', authController.login);

module.exports = router;