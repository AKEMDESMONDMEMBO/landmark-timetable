const Room = require('../models/Room');

exports.getAllRooms = async (req, res) => {
    try {
        const rooms = await Room.findAll();
        res.json({ success: true, data: rooms });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getRoomById = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) {
            return res.status(404).json({ success: false, message: 'Room not found' });
        }
        res.json({ success: true, data: room });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createRoom = async (req, res) => {
    try {
        const room = await Room.create(req.body);
        res.status(201).json({ success: true, data: room });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateRoom = async (req, res) => {
    try {
        const room = await Room.update(req.params.id, req.body);
        if (!room) {
            return res.status(404).json({ success: false, message: 'Room not found' });
        }
        res.json({ success: true, data: room });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteRoom = async (req, res) => {
    try {
        await Room.delete(req.params.id);
        res.json({ success: true, message: 'Room deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.checkRoomAvailability = async (req, res) => {
    try {
        const { roomId, timeSlotId } = req.params;
        const isAvailable = await Room.checkAvailability(roomId, timeSlotId);
        res.json({ success: true, available: isAvailable });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};