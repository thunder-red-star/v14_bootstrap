const argParser = require("../utils/parsing/argParser.js");
const createMessageError = require("../utils/error/createMessageError.js");
const {parse} = require("nodemon/lib/cli");

module.exports =  async function messageCreate(client, message) {
    // Ignore messages from bots and webhooks
    if (message.author.bot || message.webhookID) return;

    // If the message is in a guild, get the guild prefix
    let prefix = global.config.defaultPrefix;
    if (message.guild) {
        // Get the guild prefix
        let guild = await global.database.guild.get.by({id: message.guild.id});
        if (guild) {
            // Prefix?
            prefix = guild.prefix;
        } else {
            // Create the guild
            await global.database.guild.create({
                id: message.guild.id,
                prefix: global.config.defaultPrefix
            });
        }
    }

    // If the message doesn't start with the prefix, ignore it
    if (!message.content.startsWith(prefix)) return;

    // Get the command name and arguments
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // Get the command (or alias)
    let command = client.messageCommands.get(commandName) || client.messageCommands.get(client.messageCommandAliases.get(commandName));
    if (!command) return;

    // Check if the command is enabled
    if (!command.enabled) return;

    // Check if the command is guild only
    if (command.guildOnly && !message.guild) return message.reply({content: "This command can only be used in a server."});

    // Check if the command is owner only
    if (command.ownerOnly && global.config.owners.indexOf(message.author.id) === -1) {
        // Just ignore it
        return;
    }

    // Check if the user has the required permissions
    let missingPermissions = [];
    for (const permission of command.userPermissions) {
        if (!message.member.permissions.has(permission)) missingPermissions.push(permission);
    }
    if (missingPermissions.length > 0) {
        return message.reply({content: `<:cross:${global.config.emojis.cross}> You need the following permissions to use this command: \`${missingPermissions.join("`, `")}\``});
    }

    // Check if the bot has the required permissions
    missingPermissions = [];
    for (const permission of command.botPermissions) {
        if (!message.guild.members.me.permissions.has(permission)) missingPermissions.push(permission);
    }
    if (missingPermissions.length > 0) {
        return message.reply({content: `<:cross:${global.config.emojis.cross}> I need the following permissions to run this command: \`${missingPermissions.join("`, `")}\``});
    }

    // Get command from cooldowns
    let cooldown = client.cooldowns.get(commandName)
    // If the command isn't in cooldowns, add it
    if (!cooldown) {
        cooldown = new Discord.Collection();
        client.cooldowns.set(commandName, cooldown);
    }
    // Get the user from cooldowns
    let userCooldown = cooldown.get(message.author.id);
    // If the user isn't in cooldowns, add them
    if (!userCooldown) {
        userCooldown = {
            timestamp: 0, timeout: null, messagesAttempted: 0
        };
        cooldown.set(message.author.id, userCooldown);
    }
    // Check if the user is on cooldown
    if (userCooldown.timestamp + command.cooldown > Date.now()) {
        if (userCooldown.messagesAttempted > 0) return;
        // Calculate the time left
        const timeLeft = (userCooldown.timestamp + command.cooldown) - Date.now();
        // Send message
        let msg = await message.reply({content: `<:cross:${global.config.emojis.cross}> You can use that command again <t:${Math.round(Date.now() / 1000) + Math.round(timeLeft / 1000)}:R> (cooldown: ${command.cooldown / 1000}s)`});
        // Delete the message after the cooldown
        global.logger.warn(`[${client.shard.ids[0] + 1}] Command ${commandName} by ${message.author.tag} (${message.author.id}) was rate limited.`);
        userCooldown.messagesAttempted++;
        cooldown.set(message.author.id, userCooldown);
        return userCooldown.timeout = setTimeout(() => {
            msg.delete();
            userCooldown.messagesAttempted = 0;
            cooldown.set(message.author.id, userCooldown);
        }, timeLeft);
    }

    // Set the timestamp
    userCooldown.timestamp = Date.now();
    // Execute the command
    try {
        let parsedArgs = await argParser(message, command.arguments);
        for (let arg of command.arguments) {
            if (arg.required && (parsedArgs[arg.name] === undefined || parsedArgs[arg.name] === null)) {
                return message.channel.send({
                    content: `<:cross:${global.config.emojis.cross}> Missing required argument \`${arg.name}\` of type \`${arg.type}\`.`
                });
            }
            let choices = [];
            if (arg.choices) {
                for (let choice of arg.choices) {
                    choices.push(choice.name);
                }
            }
            if (arg.choices && arg.choices.length > 0 && !choices.includes(parsedArgs[arg.name]) && parsedArgs[arg.name] !== undefined && parsedArgs[arg.name] !== null) {
                return message.channel.send({
                    content: `<:cross:${global.config.emojis.cross}> Invalid choice for argument \`${arg.name}\`. Must be one of \`${choices.join("`, `")}\`.`
                });
            }
        }
        await command.execute(message, client, parsedArgs);
        global.logger.info(`[${client.shard.ids[0] + 1}] Command ${commandName} executed by ${message.author.tag} (${message.author.id}) in ${message.guild ? message.guild.name : "DMs"}`);
    } catch (error) {
        await createMessageError(error, message, command);
    }

    // Put command in cooldowns
    cooldown.set(message.author.id, userCooldown);
}