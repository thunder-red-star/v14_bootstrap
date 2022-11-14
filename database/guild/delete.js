const fs = require('fs');
const path = require('path');

module.exports = {
    by: (id) => {
        // Get guild from database
        const data = JSON.parse(fs.readFileSync(global.config.database.path, 'utf8'));
        if (data.guilds[id]) {
            // Delete guild
            delete data.guilds[id];
            // Save database
            fs.writeFileSync(global.config.database.path, JSON.stringify(data, null, 4));
            // Return deleted guild
            return true;
        } else {
            // guild does not exist
            return null;
        }
    }
}