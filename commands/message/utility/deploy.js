const Builders = require('@discordjs/builders');
const confirmMessage = require("../../../utils/design/messageConfirm.js");
const {deployGuild} = require("../../../utils/slashcommands/deploy.js");

module.exports = {
    name: "deploy",
    enabled: true,
    ownerOnly: false,
    guildOnly: false,
    shortDescription: "Deploy new slash commands",
    longDescription: "Gives your server access to the latest slash commands instantaneously, instead of waiting for 1 hour rollout.",
    aliases: [],
    arguments: [],
    botPermissions: ["SEND_MESSAGES", "EMBED_LINKS", "MANAGE_GUILD"],
    userPermissions: ["MANAGE_GUILD", "USE_APPLICATION_COMMANDS"],
    cooldown: 5_000,
    execute: async function (message, client, args, Discord) {
        // Send embed containing list of commands to deploy
        const embed = new Builders.EmbedBuilder()
            .setColor(global.config.colors.warning)
            .setTitle("Deploying slash commands...")
        let description = "Your server will receive the following commands:\n";
        const commands = client.interactionCommands.filter(c => c.enabled);
        for (const command of commands.toJSON()) {
            await message.guild.commands.fetch();
            // Check if command already exists
            if (!message.guild.commands.cache.find(c => c.name === command.name && c.applicationId === client.user.id)) {
                // Add command to description
                description += `\`/${command.name}\` - ${command.shortDescription}\n`;
            }
        }
        embed.setDescription(description);
        let response = await confirmMessage(message, embed);
        if (response) {
            // Deploy commands to guild
            await deployGuild(client, message.guild.id);
            global.logger.info(`[${client.shard.ids[0] + 1}] Deployed slash commands to guild ${message.guild.id}`);
            message.channel.send({content: "Deployed slash commands to this server."});
        } else {
            message.channel.send({content: "Cancelled command."});
        }
    }
}