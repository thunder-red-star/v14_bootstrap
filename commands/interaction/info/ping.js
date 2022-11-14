const Builders = require('@discordjs/builders');

module.exports = {
    name: "ping",
    enabled: true,
    ownerOnly: false,
    guildOnly: false,
    shortDescription: "Ping pong!",
    longDescription: "Get the bot's latency and API ping 🏓.",
    arguments: [],
    botPermissions: [
        "SEND_MESSAGES",
        "EMBED_LINKS"
    ],
    userPermissions: [],
    cooldown: 5_000,
    execute: async function(interaction, client, args) {
        // Send message
        await interaction.reply({ content: "Ping? ✉️" });
        let msg = await interaction.fetchReply();
        // Edit message
        const ping = msg.createdTimestamp - interaction.createdTimestamp;
        const embed = new Builders.EmbedBuilder()
            .setColor(global.config.colors.default)
            .setTitle("Pong!")
            .setDescription(
                `**Latency** is ${ping}ms.
				**API ping** is ${Math.round(client.ws.ping)}ms`
            );
        await interaction.editReply({ embeds: [embed], content: "Pong! 📩" });
    }
}