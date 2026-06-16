const pool = require('../config/database');

class School {
    static async ensureTable() {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS schools (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                code VARCHAR(50) UNIQUE NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
    }

    static async create(schoolData) {
        const { name, code, description } = schoolData;
        const result = await pool.query(
            'INSERT INTO schools (name, code, description) VALUES ($1, $2, $3) RETURNING *',
            [name, code, description]
        );
        return result.rows[0];
    }

    static async findAll() {
        const result = await pool.query('SELECT * FROM schools ORDER BY name');
        return result.rows;
    }

    static async findById(id) {
        const result = await pool.query('SELECT * FROM schools WHERE id = $1', [id]);
        return result.rows[0];
    }

    static async update(id, schoolData) {
        const { name, code, description } = schoolData;
        const result = await pool.query(
            'UPDATE schools SET name = $1, code = $2, description = $3 WHERE id = $4 RETURNING *',
            [name, code, description, id]
        );
        return result.rows[0];
    }

    static async delete(id) {
        await pool.query('DELETE FROM schools WHERE id = $1', [id]);
        return true;
    }
}

module.exports = School;
