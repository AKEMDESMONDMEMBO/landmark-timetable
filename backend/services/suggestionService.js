function buildSuggestionText(reason, label) {
    return { reason, suggestion: label };
}

function suggestFixes(conflicts, options = {}) {
    const fixes = [];
    if (conflicts.lecturer) {
        fixes.push(buildSuggestionText('lecturer_conflict', 'Pick another lecturer or available time slot.'));
    }
    if (conflicts.room) {
        fixes.push(buildSuggestionText('room_conflict', 'Choose another room or move to a free slot.'));
    }
    if (conflicts.level) {
        fixes.push(buildSuggestionText('level_conflict', 'Move this class to a different time slot.'));
    }

    if (options.availableRooms && options.availableRooms.length) {
        fixes.push(buildSuggestionText('available_rooms', `Try room(s): ${options.availableRooms.slice(0, 3).join(', ')}`));
    }
    if (options.availableTimeSlots && options.availableTimeSlots.length) {
        fixes.push(buildSuggestionText('available_slots', `Free slot(s): ${options.availableTimeSlots.slice(0, 3).join(', ')}`));
    }
    if (options.alternativeLecturers && options.alternativeLecturers.length) {
        fixes.push(buildSuggestionText('alternative_lecturers', `Alternative lecturer(s): ${options.alternativeLecturers.slice(0, 3).join(', ')}`));
    }

    return fixes;
}

module.exports = { suggestFixes };
