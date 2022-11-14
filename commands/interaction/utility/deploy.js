const Builders = require('@discordjs/builders');
const confirmInteraction = require("../../../utils/design/interactionConfirm.js");
const {deployGuild} = require("../../../utils/slashcommands/deploy.js");

module.exports = {
    name: "deploy",
    enabled: true,
    ownerOnly: false,
    guildOnly: false,
    shortDescription: "Deploy new slash commands",
    longDescription: "Gives your server access to the latest slash commands instantaneously, instead of waiting for 1 hour rollout.",
    arguments: [],
    botPermissions: [
        "SEND_MESSAGES",
        "EMBED_LINKS",
        "MANAGE_GUILD"
    ],
    userPermissions: [
        "MANAGE_GUILD",
        "USE_APPLICATION_COMMANDS"
    ],
    cooldown: 5_000,
    execute: async function(interaction, client, args, Discord) {
        // Send embed containing list of commands to deploy
        const embed = new Builders.EmbedBuilder()
            .setColor(global.config.colors.warning)
            .setTitle("Deploying slash commands...")
        let description = "Your server will receive the following commands:\n";
        const commands = client.interactionCommands.filter(c => c.enabled);
        await interaction.guild.commands.fetch();
        for (const command of commands.toJSON()) {
            // Check if command already exists
            if (!interaction.guild.commands.cache.find(c => c.name === command.name)) {
                // Add command to description
                description += `\`\/${command.name}\` - ${command.shortDescription}\n`;
            }
        }
        embed.setDescription(description);
        let response = await confirmInteraction(interaction, embed);
        if (response) {
            // Deploy commands to guild
            await deployGuild(client, interaction.guild.id);
            global.logger.info(`[${client.shard.ids[0] + 1}] Deployed slash commands to guild ${interaction.guild.id}`);
            let successEmbed = new Builders.EmbedBuilder()
                .setDescription(`<:check:${global.config.emojis.check}> Deployed slash commands to this server.`)
                .setColor(global.config.colors.success);
            await interaction.editReply({embeds: [successEmbed]});
        } else {
            let cancelEmbed = new Builders.EmbedBuilder()
                .setDescription(`<:cross:${global.config.emojis.cross}> Cancelled command.`)
                .setColor(global.config.colors.error);
            await interaction.editReply({embeds: [cancelEmbed]});
        }
    }
}