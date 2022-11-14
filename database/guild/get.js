const fs = require('fs');
const path = require('path');

module.exports = {
    by: (query) => {
        let data = JSON.parse(fs.readFileSync(global.config.database.path, 'utf8'));
        let result = null;
        if (query.multiple) {
            delete query.multiple;
            // Query will be a dictionary of key-value pairs
            // We will return an array of objects that match all of the key-value pairs
            result = [];
            for (let guildId in data.guilds) {
                let guild = data.guilds[guildId];
                let matches = true;
                for (let key in query) {
                    if (guild[key] !== query[key]) {
                        matches = false;
                        break;
                    }
                }
                if (matches) {
                    result.push(guild);
                }
            }
        } else {
            // Return the first guild that matches the query
            for (let guildId in data.guilds) {
                let guild = data.guilds[guildId];
                let matches = true;
                for (let key in query) {
                    if (guild[key] !== query[key]) {
                        matches = false;
                        break;
                    }
                }
                if (matches) {
                    result = guild;
                    break;
                }
            }
        }
        return result;
    },

    one: (guildId) => {
        // Get guild from database
        const data = JSON.parse(fs.readFileSync(global.config.database.path, 'utf8'));
        return data.guilds[guildId];
    },

    all: () => {
        // Return data.guilds
        const data = JSON.parse(fs.readFileSync(global.config.database.path, 'utf8'));
        return data.guilds;
    }
}