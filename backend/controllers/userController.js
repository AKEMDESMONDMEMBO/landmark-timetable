const pool = require('../config/database');
const User = require('../models/user');
const Lecturer = require('../models/Lecturer');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createUser = async (req, res) => {
    try {
        const { full_name, email, password, role } = req.body;
        
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }
        
        const user = await User.create({ full_name, email, password, role });
        
        // If role is lecturer, create lecturer record
        if (role === 'lecturer') {
            await Lecturer.create({
                user_id: user.id,
                department_id: req.body.department_id || null,
                employee_id: req.body.employee_id || `EMP${user.id}`,
                specialization: req.body.specialization || null
            });
        }
        
        res.status(201).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const user = await User.update(req.params.id, req.body);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        await User.delete(req.params.id);
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Enrich student academic info from the database
        if (user.role === 'student') {
            try {
                const deptResult = await pool.query('SELECT name FROM departments WHERE id = $1', [user.department_id]);
                const specResult = await pool.query('SELECT name FROM specialties WHERE id = $1', [user.specialty_id]);
                const levelResult = await pool.query('SELECT name, level_number FROM levels WHERE id = $1', [user.level_id]);

                if (deptResult.rows[0]) user.department_name = deptResult.rows[0].name;
                if (specResult.rows[0]) user.specialty_name = specResult.rows[0].name;
                if (levelResult.rows[0]) user.level_name = levelResult.rows[0].name || `Level ${levelResult.rows[0].level_number}`;
            } catch (error) {
                console.error('Error enriching student profile:', error);
            }
        }

        // Enrich lecturer academic info from the database
        if (user.role === 'lecturer') {
            try {
                const lecturerResult = await pool.query(
                    'SELECT department_id, specialization, employee_id FROM lecturers WHERE user_id = $1',
                    [user.id]
                );
                if (lecturerResult.rows[0]) {
                    const lecturer = lecturerResult.rows[0];
                    user.employee_id = lecturer.employee_id;
                    user.specialization = lecturer.specialization;

                    if (lecturer.department_id) {
                        const deptResult = await pool.query('SELECT name FROM departments WHERE id = $1', [lecturer.department_id]);
                        if (deptResult.rows[0]) {
                            user.department_name = deptResult.rows[0].name;
                        }
                    }
                }
            } catch (error) {
                console.error('Error enriching lecturer profile:', error);
            }
        }

        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { full_name, email, password, profile_image } = req.body;
        const updateData = { full_name, email, profile_image };
        if (password) updateData.password = password;
        
        const user = await User.update(req.user.id, updateData);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};