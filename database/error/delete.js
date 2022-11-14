const fs = require('fs');
const path = require('path');

module.exports = {
    by: (id) => {
        // Get error from database
        const data = JSON.parse(fs.readFileSync(global.config.database.path, 'utf8'));
        if (data.errors[id]) {
            // Delete error
            delete data.errors[id];
            // Save database
            fs.writeFileSync(global.config.database.path, JSON.stringify(data, null, 4));
            // Return deleted error
            return true;
        } else {
            // error does not exist
            return null;
        }
    }
}