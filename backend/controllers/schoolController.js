const School = require('../models/School');

exports.createSchool = async (req, res) => {
    try {
        const { name, code, description } = req.body;
        if (!name || !code) {
            return res.status(400).json({ success: false, message: 'Name and code are required' });
        }
        const school = await School.create({ name, code, description });
        res.status(201).json({ success: true, data: school });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllSchools = async (req, res) => {
    try {
        const schools = await School.findAll();
        res.json({ success: true, data: schools });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getSchoolById = async (req, res) => {
    try {
        const school = await School.findById(req.params.id);
        if (!school) {
            return res.status(404).json({ success: false, message: 'School not found' });
        }
        res.json({ success: true, data: school });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateSchool = async (req, res) => {
    try {
        const school = await School.update(req.params.id, req.body);
        if (!school) {
            return res.status(404).json({ success: false, message: 'School not found' });
        }
        res.json({ success: true, data: school });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteSchool = async (req, res) => {
    try {
        await School.delete(req.params.id);
        res.json({ success: true, message: 'School deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
