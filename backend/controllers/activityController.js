const ActivityLog = require('../models/ActivityLog');

exports.getLogs = async (req, res) => {
    try {
        const logs = await ActivityLog.findAll(100);
        res.json({ success: true, data: logs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
