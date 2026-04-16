const pool = require('../config/database');

class Room {
    static async create(roomData) {
        const { room_number, building, capacity, type } = roomData;
        const result = await pool.query(
            'INSERT INTO rooms (room_number, building, capacity, type) VALUES ($1, $2, $3, $4) RETURNING *',
            [room_number, building, capacity, type]
        );
        return result.rows[0];
    }

    static async findAll() {
        const result = await pool.query('SELECT * FROM rooms ORDER BY building, room_number');
        return result.rows;
    }

    static async findById(id) {
        const result = await pool.query('SELECT * FROM rooms WHERE id = $1', [id]);
        return result.rows[0];
    }

    static async update(id, roomData) {
        const { room_number, building, capacity, type } = roomData;
        const result = await pool.query(
            'UPDATE rooms SET room_number = $1, building = $2, capacity = $3, type = $4 WHERE id = $5 RETURNING *',
            [room_number, building, capacity, type, id]
        );
        return result.rows[0];
    }

    static async delete(id) {
        await pool.query('DELETE FROM rooms WHERE id = $1', [id]);
        return true;
    }

    static async checkAvailability(roomId, timeSlotId) {
        const result = await pool.query(
            'SELECT * FROM timetable WHERE room_id = $1 AND time_slot_id = $2',
            [roomId, timeSlotId]
        );
        return result.rows.length === 0;
    }
}

module.exports = Room;