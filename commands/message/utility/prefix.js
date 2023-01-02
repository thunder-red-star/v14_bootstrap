const Builders = require('@discordjs/builders');
module.exports = {
	name: "prefix",
	enabled: true,
	ownerOnly: false,
	guildOnly: false,
	shortDescription: "Set or reset bot prefix",
	longDescription: "Allows you to set or reset the bot's prefix for this server.",
	aliases: [],
	arguments: [
		{
			name: "prefix",
			description: "The new prefix to set",
			type: "string",
			required: false,
		}
	],
	botPermissions: [
		"SEND_MESSAGES",
		"EMBED_LINKS"
	],
	userPermissions: [
		"MANAGE_GUILD"
	],
	cooldown: 1_000,
	execute: async function(message, client, args, Discord) {
		// Get prefix
		let prefix = await global.database.guild.get.by({id: message.guild.id})
		prefix = prefix.prefix;
		if (!prefix) prefix = global.config.defaultPrefix;
		// Check if prefix is the same
		if (args.prefix === null || args.prefix === undefined) {
			// Reset prefix to default
			await global.database.guild.set.by(message.guild.id, {prefix: global.config.defaultPrefix});
			// Send message
			const embed = new Builders.EmbedBuilder()
				.setColor(global.config.colors.success)
				.setDescription(`<:check:${global.config.emojis.check}> Prefix has been reset to \`${global.config.defaultPrefix}\`.`);
			return message.channel.send({ embeds: [embed] });
		} else if (prefix === args.prefix) {
			// Reply
			const embed = new Builders.EmbedBuilder()
				.setColor(global.config.colors.warning)
				.setDescription(`<:warning:${global.config.emojis.warning}> No prefix change (new prefix is the same as the old one)`);
			return message.channel.send({embeds: [embed]});
		}
		// Set prefix
		await global.database.guild.set.by(message.guild.id, {prefix: args.prefix});
		// Reply
		const embed = new Builders.EmbedBuilder()
			.setColor(global.config.colors.success)
			.setDescription(`<:check:${global.config.emojis.check}> Prefix changed to \`${args.prefix}\``);
		return message.channel.send({embeds: [embed]});
	}
}