const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const rateLimit = require('express-rate-limit');

// Always load the backend-specific .env, regardless of where `node server.js` is run from.
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

// CORS Configuration - Whitelist specific origins
const corsOptions = {
    origin: (origin, callback) => {
        const allowedOrigins = [
            'http://localhost:8000',
            'http://localhost:3000',
            'http://127.0.0.1:8000',
            'http://127.0.0.1:5502',
            'http://localhost:5000',
            'file://',  // Allow file:// protocol for local development
            process.env.FRONTEND_URL || 'http://localhost:8000'
        ];
        if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

// Rate limiting - Prevent brute force attacks
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: { success: false, message: 'Too many login attempts, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: { success: false, message: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/', apiLimiter); // Apply rate limiting to all API routes
app.use('/api/auth/login', loginLimiter); // Stricter rate limit on login

// Import Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');
const lecturerRoutes = require('./routes/lecturerRoutes');
const roomRoutes = require('./routes/roomRoutes');
const timetableRoutes = require('./routes/timetableRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const specialtyRoutes = require('./routes/specialtyRoutes');
const publicRoutes = require('./routes/publicRoutes');
const schoolRoutes = require('./routes/schoolRoutes');
const activityRoutes = require('./routes/activityRoutes');
const Notification = require('./models/Notification');
const User = require('./models/user');
const School = require('./models/School');
const Department = require('./models/Department');
const Specialty = require('./models/Specialty');
const Course = require('./models/Course');
const Room = require('./models/Room');
const TimeSlot = require('./models/TimeSlot');
const Lecturer = require('./models/Lecturer');
const Timetable = require('./models/Timetable');
const ActivityLog = require('./models/ActivityLog');

const seedInitialUsers = async () => {
    const samples = [
        { full_name: 'System Administrator', email: 'admin@landmark.edu', password: 'admin123', role: 'admin' },
        { full_name: 'Dr. John Smith', email: 'lecturer@landmark.edu', password: 'lecturer123', role: 'lecturer' },
        { full_name: 'Jane Doe', email: 'student@landmark.edu', password: 'student123', role: 'student' }
    ];

    for (const sample of samples) {
        const existing = await User.findByEmail(sample.email);
        if (!existing) {
            await User.create(sample);
        }
    }
};

// Route Middleware
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lecturers', lecturerRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/specialties', specialtyRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/schools', schoolRoutes);
app.use('/api/activity', activityRoutes);

// Error handling middleware
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// Initialize tables and start server
const initApp = async () => {
    try {
        await User.ensureTable();
        await School.ensureTable();
        await Department.ensureTable();
        await Specialty.ensureTable();
        await Course.ensureTable();
        await Room.ensureTable();
        await TimeSlot.ensureTable();
        await Lecturer.ensureTable();
        await Timetable.ensureTable();
        await Notification.ensureTable();
        await ActivityLog.ensureTable();

        await seedInitialUsers();
        
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    } catch (error) {
        console.error('Failed to initialize database tables:', error.message);
        process.exit(1);
    }
};

const PORT = 5000;
initApp();