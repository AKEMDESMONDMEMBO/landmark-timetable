const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { validateLevel, validate } = require('../middleware/validation');

router.get('/stats', authenticateToken, dashboardController.getDashboardStats);
router.get('/levels', authenticateToken, dashboardController.getLevels);
router.get('/levels/:id', authenticateToken, dashboardController.getLevelById);
router.post('/levels', authenticateToken, authorizeRole('admin'), validate(validateLevel), dashboardController.createLevel);
router.put('/levels/:id', authenticateToken, authorizeRole('admin'), validate(validateLevel), dashboardController.updateLevel);
router.delete('/levels/:id', authenticateToken, authorizeRole('admin'), dashboardController.deleteLevel);
router.get('/timeslots', authenticateToken, dashboardController.getTimeSlots);
router.get('/departments', authenticateToken, dashboardController.getDepartments);
router.get('/lecturer-timetable', authenticateToken, dashboardController.getLecturerTimetable);
router.get('/room-usage', authenticateToken, dashboardController.getRoomUsage);
router.get('/lecturer-workload', authenticateToken, dashboardController.getLecturerWorkload);
router.get('/notifications', authenticateToken, dashboardController.getNotifications);
router.put('/notifications/:id/read', authenticateToken, dashboardController.markNotificationRead);

module.exports = router;