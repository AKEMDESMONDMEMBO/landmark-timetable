-- Create Database
CREATE DATABASE landmark_timetable;

\c landmark_timetable;

-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('admin', 'lecturer', 'student')) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Departments Table
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    description TEXT
);

-- Specialties/Programs Table
CREATE TABLE specialties (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    department_id INTEGER REFERENCES departments(id) ON DELETE CASCADE
);

-- Levels Table
CREATE TABLE levels (
    id SERIAL PRIMARY KEY,
    level_number INTEGER CHECK (level_number BETWEEN 100 AND 400) NOT NULL,
    name VARCHAR(50) NOT NULL
);

-- Lecturers Table
CREATE TABLE lecturers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    department_id INTEGER REFERENCES departments(id),
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    specialization VARCHAR(100)
);

-- Rooms Table
CREATE TABLE rooms (
    id SERIAL PRIMARY KEY,
    room_number VARCHAR(20) UNIQUE NOT NULL,
    building VARCHAR(100),
    capacity INTEGER NOT NULL,
    type VARCHAR(50) DEFAULT 'classroom'
);

-- Courses Table
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    course_code VARCHAR(20) UNIQUE NOT NULL,
    course_name VARCHAR(200) NOT NULL,
    credits INTEGER NOT NULL,
    department_id INTEGER REFERENCES departments(id),
    level_id INTEGER REFERENCES levels(id),
    semester INTEGER CHECK (semester IN (1, 2))
);

-- Lecturer Courses Junction Table
CREATE TABLE lecturer_courses (
    id SERIAL PRIMARY KEY,
    lecturer_id INTEGER REFERENCES lecturers(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE(lecturer_id, course_id)
);

-- Time Slots Table
CREATE TABLE time_slots (
    id SERIAL PRIMARY KEY,
    day_of_week VARCHAR(10) CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    slot_name VARCHAR(50)
);

-- Timetable Table
CREATE TABLE timetable (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    lecturer_id INTEGER REFERENCES lecturers(id) ON DELETE CASCADE,
    room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE,
    level_id INTEGER REFERENCES levels(id) ON DELETE CASCADE,
    time_slot_id INTEGER REFERENCES time_slots(id) ON DELETE CASCADE,
    academic_year VARCHAR(20),
    semester INTEGER CHECK (semester IN (1, 2)),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(room_id, time_slot_id),
    UNIQUE(lecturer_id, time_slot_id),
    UNIQUE(level_id, time_slot_id)
);

-- Insert Sample Data
INSERT INTO levels (level_number, name) VALUES 
(100, '100 Level'),
(200, '200 Level'),
(300, '300 Level'),
(400, '400 Level');

INSERT INTO departments (name, code, description) VALUES
('Computer Science', 'CS', 'Department of Computer Science'),
('Electrical Engineering', 'EE', 'Department of Electrical Engineering'),
('Business Administration', 'BA', 'Department of Business Administration');

INSERT INTO time_slots (day_of_week, start_time, end_time, slot_name) VALUES
('Monday', '08:00', '10:00', 'Morning Slot 1'),
('Monday', '10:00', '12:00', 'Morning Slot 2'),
('Monday', '12:00', '14:00', 'Afternoon Slot 1'),
('Monday', '14:00', '16:00', 'Afternoon Slot 2'),
('Tuesday', '08:00', '10:00', 'Morning Slot 1'),
('Tuesday', '10:00', '12:00', 'Morning Slot 2'),
('Tuesday', '12:00', '14:00', 'Afternoon Slot 1'),
('Tuesday', '14:00', '16:00', 'Afternoon Slot 2'),
('Wednesday', '08:00', '10:00', 'Morning Slot 1'),
('Wednesday', '10:00', '12:00', 'Morning Slot 2'),
('Wednesday', '12:00', '14:00', 'Afternoon Slot 1'),
('Wednesday', '14:00', '16:00', 'Afternoon Slot 2'),
('Thursday', '08:00', '10:00', 'Morning Slot 1'),
('Thursday', '10:00', '12:00', 'Morning Slot 2'),
('Thursday', '12:00', '14:00', 'Afternoon Slot 1'),
('Thursday', '14:00', '16:00', 'Afternoon Slot 2'),
('Friday', '08:00', '10:00', 'Morning Slot 1'),
('Friday', '10:00', '12:00', 'Morning Slot 2'),
('Friday', '12:00', '14:00', 'Afternoon Slot 1'),
('Friday', '14:00', '16:00', 'Afternoon Slot 2');
-- Insert sample users (passwords are hashed versions of 'admin123', 'lecturer123', 'student123')
INSERT INTO users (full_name, email, password, role) VALUES 
('System Administrator', 'admin@landmark.edu', '$2b$10$CW.WQeXyFQr6ShQ1FtrFjOBdvKSQtiDVCBiTbveL0j6BujCxYnfIe', 'admin'),
('Dr. John Smith', 'lecturer@landmark.edu', '$2b$10$YXYOvaf68PX.H8bQoeogoetIdjaZK6U0tzzrBGw/RVflwYBGmUXwC', 'lecturer'),
('Jane Doe', 'student@landmark.edu', '$2b$10$4mQSkP328OlYXk0NKxfCV.QFS7C4FgdFc8jRcAAjK2RpoaeUiPebS', 'student');

-- Insert sample lecturers
INSERT INTO lecturers (user_id, department_id, employee_id, specialization) VALUES 
(2, 1, 'LEC001', 'Artificial Intelligence and Machine Learning');

-- Insert sample rooms
INSERT INTO rooms (room_number, building, capacity, type) VALUES 
('101', 'Main Building', 60, 'Lecture Hall'),
('102', 'Main Building', 45, 'Classroom'),
('201', 'Science Block', 50, 'Laboratory'),
('301', 'Engineering Block', 80, 'Auditorium');

-- Insert sample courses
INSERT INTO courses (course_code, course_name, credits, department_id, level_id, semester) VALUES 
('CS101', 'Introduction to Programming', 3, 1, 1, 1),
('CS201', 'Data Structures', 3, 1, 2, 1),
('CS301', 'Database Systems', 3, 1, 3, 1),
('CS401', 'Software Engineering', 3, 1, 4, 1),
('EE101', 'Circuit Analysis', 3, 2, 1, 1),
('BA101', 'Principles of Management', 3, 3, 1, 1);

-- Assign courses to lecturer
INSERT INTO lecturer_courses (lecturer_id, course_id) VALUES 
(1, 1),
(1, 2),
(1, 3);