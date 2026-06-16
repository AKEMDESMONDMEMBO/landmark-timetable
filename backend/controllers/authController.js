const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('../config/database');

const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
    );
};

exports.register = async (req, res) => {
    try {
        const { full_name, email, password, role, department_id, specialty_id, level_id } = req.body;
        
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const user = await User.create({ full_name, email, password, role, department_id, specialty_id, level_id });
        const token = generateToken(user);
        
        res.status(201).json({
            success: true,
            token,
            user: { id: user.id, full_name: user.full_name, email: user.email, role: user.role, department_id: user.department_id, specialty_id: user.specialty_id, level_id: user.level_id }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.publicRegister = async (req, res) => {
    try {
        const { full_name, email, password, role, department_id, specialty_id, level_id } = req.body;
        const normalizedRole = ['student', 'lecturer'].includes(role) ? role : 'student';
        
        if (!full_name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Full name, email and password are required' });
        }

        if (normalizedRole === 'student') {
            if (!department_id || !specialty_id || !level_id) {
                return res.status(400).json({ success: false, message: 'Student department, specialty and level are required' });
            }

            const Department = require('../models/Department');
            const Specialty = require('../models/Specialty');
            const department = await Department.findById(department_id);
            const specialty = await Specialty.findById(specialty_id);

            if (!department) {
                return res.status(400).json({ success: false, message: 'Selected department does not exist' });
            }
            if (!specialty || String(specialty.department_id) !== String(department_id)) {
                return res.status(400).json({ success: false, message: 'Selected specialty does not belong to the chosen department' });
            }
        }
        
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const user = await User.create({ full_name, email, password, role: normalizedRole, department_id, specialty_id, level_id });

        // Auto-verify public signups so students/lecturers can log in immediately
        await pool.query('UPDATE users SET is_verified = TRUE WHERE id = $1', [user.id]);

        // Generate token for immediate login
        const token = generateToken(user);
        
        const userData = { id: user.id, full_name: user.full_name, email: user.email, role: user.role };

        // For students, fetch department, specialty, and level information
        if (normalizedRole === 'student' && department_id && specialty_id && level_id) {
            try {
                const deptResult = await pool.query('SELECT name FROM departments WHERE id = $1', [department_id]);
                const specResult = await pool.query('SELECT name FROM specialties WHERE id = $1', [specialty_id]);
                const levelResult = await pool.query('SELECT name, level_number FROM levels WHERE id = $1', [level_id]);

                if (deptResult.rows[0]) userData.department_name = deptResult.rows[0].name;
                if (specResult.rows[0]) userData.specialty_name = specResult.rows[0].name;
                if (levelResult.rows[0]) userData.level_name = levelResult.rows[0].name || `Level ${levelResult.rows[0].level_number}`;
                
                userData.department_id = department_id;
                userData.specialty_id = specialty_id;
                userData.level_id = level_id;
            } catch (error) {
                console.error('Error fetching student details:', error);
            }
        }

        res.status(201).json({
            success: true,
            token,
            user: userData
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = generateToken(user);
        const userData = { id: user.id, full_name: user.full_name, email: user.email, role: user.role };

        // For students, fetch department, specialty, and level information
        if (user.role === 'student' && user.department_id && user.specialty_id && user.level_id) {
            try {
                const deptResult = await pool.query('SELECT name FROM departments WHERE id = $1', [user.department_id]);
                const specResult = await pool.query('SELECT name FROM specialties WHERE id = $1', [user.specialty_id]);
                const levelResult = await pool.query('SELECT name, level_number FROM levels WHERE id = $1', [user.level_id]);

                if (deptResult.rows[0]) userData.department_name = deptResult.rows[0].name;
                if (specResult.rows[0]) userData.specialty_name = specResult.rows[0].name;
                if (levelResult.rows[0]) userData.level_name = levelResult.rows[0].name || `Level ${levelResult.rows[0].level_number}`;
                
                userData.department_id = user.department_id;
                userData.specialty_id = user.specialty_id;
                userData.level_id = user.level_id;
            } catch (error) {
                console.error('Error fetching student details:', error);
            }
        }

        // For lecturers, fetch department and specialization information
        if (user.role === 'lecturer') {
            try {
                const lecturerResult = await pool.query(
                    'SELECT department_id, specialization, employee_id FROM lecturers WHERE user_id = $1',
                    [user.id]
                );
                
                if (lecturerResult.rows[0]) {
                    const lecturer = lecturerResult.rows[0];
                    userData.employee_id = lecturer.employee_id;
                    userData.specialization = lecturer.specialization;
                    
                    if (lecturer.department_id) {
                        const deptResult = await pool.query('SELECT name FROM departments WHERE id = $1', [lecturer.department_id]);
                        if (deptResult.rows[0]) {
                            userData.department_name = deptResult.rows[0].name;
                            userData.department_id = lecturer.department_id;
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching lecturer details:', error);
            }
        }

        res.json({
            success: true,
            token,
            user: userData
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};