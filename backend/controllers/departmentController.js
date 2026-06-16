const Department = require('../models/Department');

exports.getAllDepartments = async (req, res) => {
    try {
        const departments = await Department.findAll();
        res.json({ success: true, data: departments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getDepartmentById = async (req, res) => {
    try {
        const department = await Department.findById(req.params.id);
        if (!department) {
            return res.status(404).json({ success: false, message: 'Department not found' });
        }
        res.json({ success: true, data: department });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createDepartment = async (req, res) => {
    try {
        const { name, code, description, school_id } = req.body;

        // Validation
        if (!name || !code || !school_id) {
            return res.status(400).json({ success: false, message: 'Name, code, and school are required' });
        }

        const School = require('../models/School');
        const school = await School.findById(school_id);
        if (!school) {
            return res.status(400).json({ success: false, message: 'Selected school does not exist' });
        }

        const department = await Department.create({ name, code, description, school_id });
        res.status(201).json({ success: true, data: department });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateDepartment = async (req, res) => {
    try {
        const { name, code, description, school_id } = req.body;

        if (!name || !code || !school_id) {
            return res.status(400).json({ success: false, message: 'Name, code, and school are required' });
        }

        const School = require('../models/School');
        const school = await School.findById(school_id);
        if (!school) {
            return res.status(400).json({ success: false, message: 'Selected school does not exist' });
        }

        const department = await Department.update(req.params.id, { name, code, description, school_id });
        if (!department) {
            return res.status(404).json({ success: false, message: 'Department not found' });
        }
        res.json({ success: true, data: department });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteDepartment = async (req, res) => {
    try {
        await Department.delete(req.params.id);
        res.json({ success: true, message: 'Department deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
