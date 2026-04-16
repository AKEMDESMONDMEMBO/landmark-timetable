const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { validateRoom, validate } = require('../middleware/validation');

router.get('/', authenticateToken, roomController.getAllRooms);
router.get('/:id', authenticateToken, roomController.getRoomById);
router.post('/', authenticateToken, authorizeRole('admin'), validate(validateRoom), roomController.createRoom);
router.put('/:id', authenticateToken, authorizeRole('admin'), validate(validateRoom), roomController.updateRoom);
router.delete('/:id', authenticateToken, authorizeRole('admin'), roomController.deleteRoom);
router.get('/:roomId/availability/:timeSlotId', authenticateToken, roomController.checkRoomAvailability);

module.exports = router;