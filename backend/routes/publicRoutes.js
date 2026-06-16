const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const specialtyController = require('../controllers/specialtyController');
const dashboardController = require('../controllers/dashboardController');

router.get('/departments', departmentController.getAllDepartments);
router.get('/specialties', specialtyController.getAllSpecialties);
router.get('/specialties/department/:departmentId', specialtyController.getSpecialtiesByDepartment);
router.get('/levels', dashboardController.getLevels);

module.exports = router;
