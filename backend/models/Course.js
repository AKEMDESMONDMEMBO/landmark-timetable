const pool = require('../config/database');

class Course {
    static async ensureTable() {
        // First ensure levels table exists as it's a dependency
        await pool.query(`
            CREATE TABLE IF NOT EXISTS levels (
                id SERIAL PRIMARY KEY,
                level_number INTEGER UNIQUE NOT NULL,
                name VARCHAR(100),
                description TEXT
            )
        `);

        // Migration for levels
        await pool.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='levels' AND column_name='name') THEN
                    ALTER TABLE levels ADD COLUMN name VARCHAR(100);
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='levels' AND column_name='description') THEN
                    ALTER TABLE levels ADD COLUMN description TEXT;
                END IF;
                ALTER TABLE levels DROP CONSTRAINT IF EXISTS levels_level_number_check;
            END $$;
        `);

        // Seed levels if empty
        const levelsCheck = await pool.query('SELECT COUNT(*) FROM levels');
        if (parseInt(levelsCheck.rows[0].count) === 0) {
            await pool.query("INSERT INTO levels (level_number, name) VALUES (100, '100 Level'), (200, '200 Level'), (300, '300 Level'), (400, '400 Level'), (500, '500 Level')");
        }

        await pool.query(`
            CREATE TABLE IF NOT EXISTS courses (
                id SERIAL PRIMARY KEY,
                course_code VARCHAR(20) UNIQUE NOT NULL,
                course_name VARCHAR(255) NOT NULL,
                credits INTEGER DEFAULT 3,
                department_id INTEGER REFERENCES departments(id) ON DELETE CASCADE,
                specialty_id INTEGER,
                level_id INTEGER REFERENCES levels(id) ON DELETE SET NULL,
                semester INTEGER CHECK (semester IN (1, 2)),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await pool.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='courses' AND column_name='specialty_id') THEN
                    ALTER TABLE courses ADD COLUMN specialty_id INTEGER;
                END IF;
            END $$;
        `);
    }

    static async create(courseData) {
        const { course_code, course_name, credits, department_id, specialty_id, level_id, semester } = courseData;
        const result = await pool.query(
            'INSERT INTO courses (course_code, course_name, credits, department_id, specialty_id, level_id, semester) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [course_code, course_name, credits, department_id, specialty_id || null, level_id, semester]
        );
        return result.rows[0];
    }

    static async findAll() {
        const result = await pool.query(
            `SELECT c.*, d.name as department_name, s.name as specialty_name, l.level_number, l.name as level_name
             FROM courses c
             LEFT JOIN departments d ON c.department_id = d.id
             LEFT JOIN specialties s ON c.specialty_id = s.id
             LEFT JOIN levels l ON c.level_id = l.id
             ORDER BY c.course_code`
        );
        return result.rows;
    }

    static async findById(id) {
        const result = await pool.query(
            `SELECT c.*, d.name as department_name, s.name as specialty_name, l.level_number, l.name as level_name
             FROM courses c
             LEFT JOIN departments d ON c.department_id = d.id
             LEFT JOIN specialties s ON c.specialty_id = s.id
             LEFT JOIN levels l ON c.level_id = l.id
             WHERE c.id = $1`,
            [id]
        );
        return result.rows[0];
    }

    static async update(id, courseData) {
        const { course_code, course_name, credits, department_id, specialty_id, level_id, semester } = courseData;
        const result = await pool.query(
            'UPDATE courses SET course_code = $1, course_name = $2, credits = $3, department_id = $4, specialty_id = $5, level_id = $6, semester = $7 WHERE id = $8 RETURNING *',
            [course_code, course_name, credits, department_id, specialty_id || null, level_id, semester, id]
        );
        return result.rows[0];
    }

    static async delete(id) {
        await pool.query('DELETE FROM courses WHERE id = $1', [id]);
        return true;
    }

    static async findByDepartment(departmentId) {
        const result = await pool.query(
            'SELECT * FROM courses WHERE department_id = $1 ORDER BY course_code',
            [departmentId]
        );
        return result.rows;
    }
}

module.exports = Course;