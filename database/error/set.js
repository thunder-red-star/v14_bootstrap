const fs = require('fs');
const path = require('path');

module.exports = {
    by: (id, update) => {
        // Get error from database
        const data = JSON.parse(fs.readFileSync(global.config.database.path, 'utf8'));
        if (data.errors[id]) {
            // Update error
            for (let key in update) {
                data.errors[id][key] = update[key];
            }
            // Save database
            fs.writeFileSync(global.config.database.path, JSON.stringify(data, null, 4));
            // Return updated error
            return data.errors[id];
        } else {
            // error does not exist
            return null;
        }
    }
}
