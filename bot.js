require("./utils/logger/ignoreTerminalSpam.js");

const Discord = require('discord.js');
const Logger = require('./utils/logger/logger.js');
const fs = require('fs');
const path = require('path');
const Database = require('./database/index.js');
const commandHandler = require('./commands/index.js');
const eventHandler = require('./events/index.js');
const config = require('./config/config.json');

global.logger = new Logger(path.join(__dirname, 'logs'));
global.config = config;
global.database = Database;

const client = new Discord.Client({
    intents: new Discord.IntentsBitField(3276541),
    partials: ['MESSAGE', 'CHANNEL', 'REACTION', "GUILD_MEMBER", "GUILD"],
    allowedMentions: { parse: ['users', 'roles'], repliedUser: true },
})

// Load events
eventHandler(client);
// Load commands
commandHandler(client);

// Login
client.login(config.token);

// Log unhandled promise rejections
process.on('unhandledRejection', (err) => {
    global.logger.error(`[${client.shard.ids[0] + 1}] Bot encountered an unhandled promise rejection`);
    console.error(err.stack);
});

// Log uncaught exceptions
process.on('uncaughtException', (err) => {
    global.logger.error(`[${client.shard.ids[0] + 1}] Bot encountered an uncaught exception`);
    global.logger.logRaw(err.stack);
});