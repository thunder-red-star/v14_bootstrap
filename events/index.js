const fs = require('fs');
const path = require('path');

// Event handler function
module.exports = function (client) {
    // Find all files in this folder
    const eventFiles = fs.readdirSync(__dirname).filter(file => file.endsWith('.js'));

    // Loop through all files, ignoring this file
    for (const file of eventFiles) {
        if (file !== 'handler.js') {
            // Import the event
            const event = require("./" + file);

            // Get the event name
            const eventName = file.split('.')[0];

            // Add the event to the client
            client.on(eventName, (...args) => {
                global.logger.debug(`Event ${eventName} triggered`);
                event(client, ...args);
            });
        }
    }
}