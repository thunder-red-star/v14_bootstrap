const Builders = require('@discordjs/builders');

module.exports = {
    name: "ping",
    enabled: true,
    ownerOnly: false,
    guildOnly: false,
    shortDescription: "Ping pong!",
    longDescription: "Get the bot's latency and API ping 🏓.",
    aliases: ["pong"],
    arguments: [],
    botPermissions: [
        "SEND_MESSAGES",
        "EMBED_LINKS"
    ],
    userPermissions: [],
    cooldown: 5_000,
    execute: async function(message, client, args) {
        // Send message
        let msg = await message.channel.send({ content: "Ping? ✉️" });
        // Edit message
        const ping = msg.createdTimestamp - message.createdTimestamp;
        const embed = new Builders.EmbedBuilder()
            .setColor(global.config.colors.default)
            .setTitle("Pong!")
            .setDescription(
                `**Latency** is ${ping}ms.
				**API ping** is ${Math.round(client.ws.ping)}ms`
            );
        await msg.edit({ embeds: [embed], content: "Pong! 📩" });
    }
}