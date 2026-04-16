// Input Validation Middleware and Helpers

const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validateMinLength = (str, minLength) => {
    return str && typeof str === 'string' && str.trim().length >= minLength;
};

const validatePositiveNumber = (num) => {
    return typeof num === 'number' && num > 0;
};

const validateRequiredFields = (obj, fields) => {
    const missing = [];
    fields.forEach(field => {
        if (!obj[field] || (typeof obj[field] === 'string' && !obj[field].trim())) {
            missing.push(field);
        }
    });
    return missing;
};

// Department Validation
exports.validateDepartment = (data) => {
    const errors = [];
    
    if (!validateMinLength(data.name, 2)) {
        errors.push('Department name must be at least 2 characters');
    }
    if (!validateMinLength(data.code, 1)) {
        errors.push('Department code is required');
    }
    if (data.description && data.description.length > 500) {
        errors.push('Description must be 500 characters or less');
    }
    
    return errors;
};

// Course Validation
exports.validateCourse = (data) => {
    const errors = [];
    const requiredFields = validateRequiredFields(data, ['course_code', 'course_name', 'credits', 'department_id', 'level_id', 'semester']);
    
    if (requiredFields.length > 0) {
        errors.push(`Missing required fields: ${requiredFields.join(', ')}`);
    }
    
    if (!validatePositiveNumber(data.credits)) {
        errors.push('Credits must be a positive number');
    }
    if (data.credits > 10) {
        errors.push('Credits cannot exceed 10');
    }
    if (![1, 2].includes(data.semester)) {
        errors.push('Semester must be 1 or 2');
    }
    if (!validateMinLength(data.course_code, 2)) {
        errors.push('Course code must be at least 2 characters');
    }
    if (!validateMinLength(data.course_name, 3)) {
        errors.push('Course name must be at least 3 characters');
    }
    
    return errors;
};

// Lecturer Validation
exports.validateLecturer = (data) => {
    const errors = [];
    const requiredFields = validateRequiredFields(data, ['user_id', 'employee_id']);
    
    if (requiredFields.length > 0) {
        errors.push(`Missing required fields: ${requiredFields.join(', ')}`);
    }
    
    if (data.employee_id && data.employee_id.length < 2) {
        errors.push('Employee ID must be at least 2 characters');
    }
    if (data.specialization && data.specialization.length > 200) {
        errors.push('Specialization must be 200 characters or less');
    }
    
    return errors;
};

// Room Validation
exports.validateRoom = (data) => {
    const errors = [];
    const requiredFields = validateRequiredFields(data, ['room_number', 'building', 'capacity', 'type']);
    
    if (requiredFields.length > 0) {
        errors.push(`Missing required fields: ${requiredFields.join(', ')}`);
    }
    
    if (!validatePositiveNumber(data.capacity)) {
        errors.push('Capacity must be a positive number');
    }
    if (data.capacity > 500) {
        errors.push('Capacity cannot exceed 500');
    }
    const validTypes = ['Classroom', 'Lecture Hall', 'Laboratory', 'Auditorium'];
    if (data.type && !validTypes.includes(data.type)) {
        errors.push(`Room type must be one of: ${validTypes.join(', ')}`);
    }
    
    return errors;
};

// Specialty Validation
exports.validateSpecialty = (data) => {
    const errors = [];
    const requiredFields = validateRequiredFields(data, ['name', 'code', 'department_id']);
    
    if (requiredFields.length > 0) {
        errors.push(`Missing required fields: ${requiredFields.join(', ')}`);
    }
    
    if (!validateMinLength(data.name, 2)) {
        errors.push('Specialty name must be at least 2 characters');
    }
    if (!validateMinLength(data.code, 1)) {
        errors.push('Specialty code is required');
    }
    
    return errors;
};

// User Validation
exports.validateUser = (data) => {
    const errors = [];
    const requiredFields = validateRequiredFields(data, ['full_name', 'email', 'password', 'role']);
    
    if (requiredFields.length > 0) {
        errors.push(`Missing required fields: ${requiredFields.join(', ')}`);
    }
    
    if (!validateEmail(data.email)) {
        errors.push('Invalid email format');
    }
    if (data.password && data.password.length < 6) {
        errors.push('Password must be at least 6 characters');
    }
    const validRoles = ['admin', 'lecturer', 'student'];
    if (data.role && !validRoles.includes(data.role)) {
        errors.push(`Role must be one of: ${validRoles.join(', ')}`);
    }
    if (!validateMinLength(data.full_name, 2)) {
        errors.push('Full name must be at least 2 characters');
    }
    
    return errors;
};

// Timetable Validation
exports.validateTimetable = (data) => {
    const errors = [];
    const requiredFields = validateRequiredFields(data, ['course_id', 'lecturer_id', 'room_id', 'level_id', 'time_slot_id', 'academic_year', 'semester']);
    
    if (requiredFields.length > 0) {
        errors.push(`Missing required fields: ${requiredFields.join(', ')}`);
    }
    
    if (![1, 2].includes(data.semester)) {
        errors.push('Semester must be 1 or 2');
    }
    if (!/^\d{4}$/.test(data.academic_year)) {
        errors.push('Academic year must be a 4-digit number');
    }
    
    return errors;
};

// Request validation middleware
exports.validate = (validatorFn) => {
    return (req, res, next) => {
        const errors = validatorFn(req.body);
        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors
            });
        }
        next();
    };
};
