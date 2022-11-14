const fs = require('fs');
const path = require('path');
const uuid = require("../../utils/uuid/uuid");

module.exports = function create (data = {}) {
    // Get database
    const database = JSON.parse(fs.readFileSync(global.config.database.path, 'utf8'));
    data._id = uuid();
    // Create guild
    database.guilds[data.id] = data;
    // Save database
    fs.writeFileSync(global.config.database.path, JSON.stringify(database, null, 4));
    // Return created guild
    return database.guilds[data.id];
}