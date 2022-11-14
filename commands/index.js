const fs = require('fs');
const path = require('path');

const { Collection } = require('discord.js');

module.exports = function commandLoader(client) {
    client.categories = JSON.parse(fs.readFileSync(path.join(__dirname, 'categories.json'), 'utf8'));
    client.messageCommands = new Collection();
    client.messageCommandAliases = new Collection();
    client.interactionCommands = new Collection();

    // Read commands in each category
    global.logger.info(`[${client.shard.ids[0] + 1}] Loading message commands...`);
    for (const category of client.categories) {
        if (!fs.existsSync(path.join(__dirname, 'message', category))) {
            continue;
        }
        const commandFiles = fs.readdirSync(path.join(__dirname, "message", category)).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            let command = require("./message/" + category + "/" + file);
            client.messageCommands.set(command.name, command);

            global.logger.info(`[${client.shard.ids[0] + 1}] Loaded message command ${command.name}`);

            // Add aliases
            if (command.aliases) {
                for (const alias of command.aliases) {
                    client.messageCommandAliases.set(alias, command.name);
                }
            }
        }
    }

    // Read slash commands
    global.logger.info(`[${client.shard.ids[0] + 1}] Loading slash commands...`);
    for (const category of client.categories) {
        if (!fs.existsSync(path.join(__dirname, 'interaction', category))) {
            continue;
        }
        const commandFiles = fs.readdirSync(path.join(__dirname, "interaction", category)).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            let command = require("./interaction/" + category + "/" + file);
            client.interactionCommands.set(command.name, command);
            global.logger.info(`[${client.shard.ids[0] + 1}] Loaded slash command ${command.name}`);
        }
    }

    // Create cooldowns for each command (message commands and interaction commands with the same name should share cooldowns)
    client.cooldowns = new Collection();
    for (const command of client.messageCommands.toJSON()) {
        // Set cooldowns
        client.cooldowns.set(command.name, new Collection());
    }
}