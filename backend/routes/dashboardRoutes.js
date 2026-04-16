const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticateToken } = require('../middleware/auth');

router.get('/stats', authenticateToken, dashboardController.getDashboardStats);
router.get('/levels', authenticateToken, dashboardController.getLevels);
router.get('/timeslots', authenticateToken, dashboardController.getTimeSlots);
router.get('/departments', authenticateToken, dashboardController.getDepartments);
router.get('/lecturer-timetable', authenticateToken, dashboardController.getLecturerTimetable);

module.exports = router;