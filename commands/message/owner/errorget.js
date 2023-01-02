const Builders = require('@discordjs/builders');

module.exports = {
	name: "errorget",
	enabled: true,
	ownerOnly: true,
	guildOnly: false,
	shortDescription: "Get an error by ID",
	longDescription: "Get an error by ID.",
	arguments: [{
		name: "error", type: "string", description: "The error to get", required: true
	}],
	botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
	userPermissions: [],
	async execute(message, client, args, Discord) {
		// Get error
		let errorID = args["error"];
		let error = await global.database.error.get(errorID);
		if (!error) {
			let embed = new Builders.EmbedBuilder()
				.setColor(global.config.colors.error)
				.setDescription(`<:error:${global.config.emojis.error}> Error \`${errorID}\` does not exist.`);
			return message.reply({embeds: [embed]});
		} else {
			let embed = new Builders.EmbedBuilder()
				.setTitle(`Error`)
				.setDescription(`\`\`\`js\n${error.stack}\n\`\`\``)
				.addFields([
					{
						name: "Information", value: `**Guild**: ${guild.name} (${guild.id})
												**Channel**: <#${error.channelId}> (${error.channelId})
												**User**: <@${error.userId}> (${error.userId})
							  				**Message**: [Jump to message](https://discord.com/channels/${error.guildId}/${error.channelId}/${error.messageId})
												**Command**: ${error.commandName}
												**Error ID**: ${error._id}`
					}, {
						// It's a mongodb date so we need a timestamp
						name: "Time", value: `<t:${Math.floor(error.timestamp / 1000)}:F>`, inline: true
					}, {
						name: "Status", value: `${error.status}`
					}
				]);
			if (error.status === "open") {
				embed.setColor(global.config.colors.error);
			} else if (error.status === "fixed") {
				embed.setColor(global.config.colors.success);
			} else {
				embed.setColor(global.config.colors.warning);
			}
			return message.reply({embeds: [embed]});
		}
	}
}