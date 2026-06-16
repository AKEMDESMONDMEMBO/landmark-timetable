const Notification = require('../models/Notification');

async function notifyRole(roleTarget, title, message) {
    await Notification.create({ role_target: roleTarget, title, message });
}

async function notifySystem(title, message) {
    await Notification.create({ title, message });
}

module.exports = { notifyRole, notifySystem };
