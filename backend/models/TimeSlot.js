const pool = require('../config/database');

class TimeSlot {
    static async ensureTable() {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS time_slots (
                id SERIAL PRIMARY KEY,
                day_of_week VARCHAR(20) NOT NULL,
                start_time TIME NOT NULL,
                end_time TIME NOT NULL,
                slot_name VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Migration
        await pool.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='time_slots' AND column_name='created_at') THEN
                    ALTER TABLE time_slots ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
                END IF;
            END $$;
        `);
    }

    static async create(timeSlotData) {
        const { day_of_week, start_time, end_time, slot_name } = timeSlotData;
        const result = await pool.query(
            'INSERT INTO time_slots (day_of_week, start_time, end_time, slot_name) VALUES ($1, $2, $3, $4) RETURNING *',
            [day_of_week, start_time, end_time, slot_name]
        );
        return result.rows[0];
    }

    static async findAll() {
        const result = await pool.query('SELECT * FROM time_slots ORDER BY day_of_week, start_time');
        return result.rows;
    }

    static async findById(id) {
        const result = await pool.query('SELECT * FROM time_slots WHERE id = $1', [id]);
        return result.rows[0];
    }

    static async update(id, timeSlotData) {
        const { day_of_week, start_time, end_time, slot_name } = timeSlotData;
        const result = await pool.query(
            'UPDATE time_slots SET day_of_week = $1, start_time = $2, end_time = $3, slot_name = $4 WHERE id = $5 RETURNING *',
            [day_of_week, start_time, end_time, slot_name, id]
        );
        return result.rows[0];
    }

    static async delete(id) {
        await pool.query('DELETE FROM time_slots WHERE id = $1', [id]);
        return true;
    }
}

module.exports = TimeSlot;