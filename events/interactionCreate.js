const createInteractionError = require('../utils/error/createInteractionError.js');
const Discord = require('discord.js');

module.exports = async function interactionCreate (client, interaction) {
    // Interaction is not a command
    if (!interaction.isCommand()) {
        return;
    }

    // Get command
    const command = client.interactionCommands.get(interaction.commandName);

    // Command not found
    if (!command) {
        return;
    }

    // Check if command is enabled
    if (!command.enabled) {
        return;
    }

    // Check if command is guild only
    if (command.guildOnly && !interaction.guild) {
        return interaction.reply({content: "This command can only be used in a server.", ephemeral: true});
    }

    // Check if command is owner only
    if (command.ownerOnly && global.config.owners.indexOf(interaction.user.id) === -1) {
        // Just ignore it
        return;
    }

    // Check if the user has the required permissions
    let missingPermissions = [];
    for (const permission of command.userPermissions) {
        if (!interaction.member.permissions.has(permission)) missingPermissions.push(permission);
    }
    if (missingPermissions.length > 0) {
        return interaction.reply({content: `<:cross:${global.config.emojis.cross}> You need the following permissions to use this command: \`${missingPermissions.join("`, `")}\``, ephemeral: true});
    }

    // Check if the bot has the required permissions
    missingPermissions = [];
    for (const permission of command.botPermissions) {
        if (!interaction.guild.members.me.permissions.has(permission)) missingPermissions.push(permission);
    }
    if (missingPermissions.length > 0) {
        return interaction.reply({content: `<:cross:${global.config.emojis.cross}> I need the following permissions to run this command: \`${missingPermissions.join("`, `")}\``, ephemeral: true});
    }

    // Get command from cooldowns
    let cooldown = client.cooldowns.get(command.name);
    // If the command isn't in cooldowns, add it
    if (!cooldown) {
        cooldown = new Discord.Collection();
        client.cooldowns.set(command.name, cooldown);
    }
    // Get the user from cooldowns
    let userCooldown = cooldown.get(interaction.user.id);
    // If the user isn't in cooldowns, add them
    if (!userCooldown) {
        userCooldown = {
            timestamp: 0,
            timeout: null,
            messagesAttempted: 0
        };
        cooldown.set(interaction.user.id, userCooldown);
    }

    // Check if the user is on cooldown
    if (userCooldown.timestamp + command.cooldown > Date.now()) {
        // Increase the messages attempted
        if (userCooldown.messagesAttempted > 0) {
            return;
        }
        userCooldown.messagesAttempted++;
        const timeLeft = (userCooldown.timestamp + command.cooldown) - Date.now();
        let msg = await interaction.reply({content: `<:cross:${global.config.emojis.cross}> You can use this command again <t:${Math.round((Date.now() + timeLeft) / 1000)}:R> (cooldown: ${command.cooldown / 1000}s).`, ephemeral: true});
        // Delete the message after the timeout
        // Delete the message after the cooldown
        global.logger.warn(`[${client.shard.ids[0] + 1}] Command ${command.name} by ${interaction.user.tag} (${interaction.user.id}) was rate limited.`);
        userCooldown.messagesAttempted++;
        cooldown.set(interaction.user.id, userCooldown);
        return userCooldown.timeout = setTimeout(() => {
            userCooldown.messagesAttempted = 0;
            cooldown.set(interaction.user.id, userCooldown);
        }, timeLeft);
    }

    // Set the timestamp
    userCooldown.timestamp = Date.now();
    // Execute the command
    try {
        let subcommand;
        try {
            subcommand = interaction.options.getSubcommand()
        } catch (e) {
            // no subcommand
        }
        if (subcommand) {
            // Find subcommand in subcommands array
            const subcommand = command.subcommands.find(subcommand => subcommand.name === interaction.options.getSubcommand());
            if (!subcommand) {
                return;
            } else {
                // Execute subcommand
                await subcommand.execute(interaction, interaction.client, Discord);
                global.logger.info(`[${client.shard.ids[0] + 1}] Command ${command.name} subcommand ${subcommand.name} by ${interaction.user.tag} (${interaction.user.id}) executed successfully.`);
            }
        } else {
            await command.execute(interaction, interaction.client, Discord);
            global.logger.info(`[${client.shard.ids[0] + 1}] Command ${command.name} by ${interaction.user.tag} (${interaction.user.id}) executed successfully.`);
        }
    } catch (error) {
        await createInteractionError(error, interaction, command);
    }

    // Put the user back in cooldowns
    cooldown.set(interaction.user.id, userCooldown);
}