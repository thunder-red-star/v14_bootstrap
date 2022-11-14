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
            for (let errorId in data.errors) {
                let error = data.errors[errorId];
                let matches = true;
                for (let key in query) {
                    if (error[key] !== query[key]) {
                        matches = false;
                        break;
                    }
                }
                if (matches) {
                    result.push(error);
                }
            }
        } else {
            // Return the first error that matches the query
            for (let errorId in data.errors) {
                let error = data.errors[errorId];
                let matches = true;
                for (let key in query) {
                    if (error[key] !== query[key]) {
                        matches = false;
                        break;
                    }
                }
                if (matches) {
                    result = error;
                    break;
                }
            }
        }
        return result;
    },

    one: (errorId) => {
        // Get error from database
        const data = JSON.parse(fs.readFileSync(global.config.database.path, 'utf8'));
        return data.errors[errorId];
    },

    all: () => {
        // Return data.errors
        const data = JSON.parse(fs.readFileSync(global.config.database.path, 'utf8'));
        return data.errors;
    }
}