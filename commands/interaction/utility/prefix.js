const Builders = require('@discordjs/builders');

module.exports = {
	name: "prefix",
	enabled: true,
	ownerOnly: false,
	guildOnly: false,
	shortDescription: "Set bot prefix",
	longDescription: "Allows you to set the bot's prefix for this server.",
	arguments: [
		{
			name: "prefix",
			description: "The new prefix to set",
			type: "string",
			required: false
		}
	],
	botPermissions: [
		"SEND_MESSAGES",
		"EMBED_LINKS"
	],
	userPermissions: [
		"MANAGE_GUILD"
	],
	cooldown: 5_000,
	execute: async function(interaction, client, args, Discord) {
		// Get prefix
		await interaction.deferReply();
		let prefix = await global.database.guild.get.by({id: interaction.guild.id})
		prefix = prefix.prefix;
		if (!prefix) prefix = global.config.defaultPrefix;
		let newPrefix = interaction.options.getString("prefix");
		// Check if prefix is the same
		if (newPrefix === null || newPrefix === undefined) {
			// Reset prefix to default
			await global.database.guild.set.by(interaction.guild.id, {prefix: global.config.defaultPrefix});
			// Send interaction
			const embed = new Builders.EmbedBuilder()
				.setColor(global.config.colors.success)
				.setDescription(`<:check:${global.config.emojis.check}> Prefix has been reset to \`${global.config.defaultPrefix}\`.`);
			return interaction.editReply({ embeds: [embed] });
		} else if (prefix === newPrefix) {
			// Reply
			const embed = new Builders.EmbedBuilder()
				.setColor(global.config.colors.warning)
				.setDescription(`<:warning:${global.config.emojis.warning}> No prefix change (new prefix is the same as the old one)`);
			return interaction.editReply({embeds: [embed]});
		}
		// Set prefix
		await global.database.guild.set.by(interaction.guild.id, {prefix: newPrefix});
		// Reply
		const embed = new Builders.EmbedBuilder()
			.setColor(global.config.colors.success)
			.setDescription(`<:check:${global.config.emojis.check}> Prefix changed to \`${newPrefix}\``);
		return interaction.editReply({embeds: [embed]});
	}
}