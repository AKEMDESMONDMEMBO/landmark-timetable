const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
    );
};

exports.register = async (req, res) => {
    try {
        const { full_name, email, password, role } = req.body;
        
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const user = await User.create({ full_name, email, password, role });
        const token = generateToken(user);
        
        res.status(201).json({
            success: true,
            token,
            user: { id: user.id, full_name: user.full_name, email: user.email, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.publicRegister = async (req, res) => {
    try {
        const { full_name, email, password, role } = req.body;
        
        // Validate required fields
        if (!full_name || !email || !password || !role) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }
        
        // Validate role
        if (!['student', 'lecturer'].includes(role)) {
            return res.status(400).json({ success: false, message: 'Invalid role. Only student and lecturer roles are allowed for public registration.' });
        }
        
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists with this email' });
        }

        const user = await User.create({ full_name, email, password, role });
        const token = generateToken(user);
        
        res.status(201).json({
            success: true,
            message: 'Account created successfully! Please login with your credentials.',
            token,
            user: { id: user.id, full_name: user.full_name, email: user.email, role: user.role }
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
        res.json({
            success: true,
            token,
            user: { id: user.id, full_name: user.full_name, email: user.email, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};