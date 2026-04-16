const Specialty = require('../models/Specialty');

exports.getAllSpecialties = async (req, res) => {
    try {
        const specialties = await Specialty.findAll();
        res.json({ success: true, data: specialties });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getSpecialtyById = async (req, res) => {
    try {
        const specialty = await Specialty.findById(req.params.id);
        if (!specialty) {
            return res.status(404).json({ success: false, message: 'Specialty not found' });
        }
        res.json({ success: true, data: specialty });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getSpecialtiesByDepartment = async (req, res) => {
    try {
        const specialties = await Specialty.findByDepartment(req.params.departmentId);
        res.json({ success: true, data: specialties });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createSpecialty = async (req, res) => {
    try {
        const { name, code, department_id } = req.body;

        // Validation
        if (!name || !code || !department_id) {
            return res.status(400).json({ success: false, message: 'Name, code, and department_id are required' });
        }

        const specialty = await Specialty.create({ name, code, department_id });
        res.status(201).json({ success: true, data: specialty });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateSpecialty = async (req, res) => {
    try {
        const { name, code, department_id } = req.body;

        if (!name || !code || !department_id) {
            return res.status(400).json({ success: false, message: 'Name, code, and department_id are required' });
        }

        const specialty = await Specialty.update(req.params.id, { name, code, department_id });
        if (!specialty) {
            return res.status(404).json({ success: false, message: 'Specialty not found' });
        }
        res.json({ success: true, data: specialty });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteSpecialty = async (req, res) => {
    try {
        await Specialty.delete(req.params.id);
        res.json({ success: true, message: 'Specialty deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
