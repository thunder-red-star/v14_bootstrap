const fs = require('fs');
const path = require('path');

module.exports = {
    by: (id, update) => {
        // Get guild from database
        const data = JSON.parse(fs.readFileSync(global.config.database.path, 'utf8'));
        if (data.guilds[id]) {
            // Update guild
            for (let key in update) {
                data.guilds[id][key] = update[key];
            }
            // Save database
            fs.writeFileSync(global.config.database.path, JSON.stringify(data, null, 4));
            // Return updated guild
            return data.guilds[id];
        } else {
            // Guild does not exist
            return null;
        }
    }
}
