const fs = require('fs');
const path = require('path');
const uuid = require('../../utils/uuid/uuid.js');

module.exports = function create (data = {}) {
    // Get database
    const database = JSON.parse(fs.readFileSync(global.config.database.path, 'utf8'));
    data._id = uuid();
    data.status = 'open';
    data.timestamp = Date.now();
    // Create error
    database.errors[data._id] = data;
    // Save database
    fs.writeFileSync(global.config.database.path, JSON.stringify(database, null, 4));
    // Return created error
    return database.errors[data._id];
}