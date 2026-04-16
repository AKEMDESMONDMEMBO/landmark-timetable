const pool = require('../config/database');

class TimeSlot {
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