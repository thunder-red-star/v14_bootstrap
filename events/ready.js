const Discord = require('discord.js');

module.exports = async function ready (client) {
    global.logger.info(`[${client.shard.ids[0] + 1}] Shard is ready`);
    global.logger.info(`[${client.shard.ids[0] + 1}] Logged in as ${client.user.tag}`);

    client.user.setPresence({
        activities: [
            {
                name: 'b!help | /help | Example botting',
                type: Discord.ActivityType.Listening,
            },
            {
                name: 'GitHub Copilot',
                type: Discord.ActivityType.Watching,
            },
        ],
        status: 'online',
    });
}