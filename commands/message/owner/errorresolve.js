const Builders = require('@discordjs/builders');
module.exports = {
	name: "errorresolve",
	enabled: true,
	ownerOnly: true,
	guildOnly: false,
	shortDescription: "Resolve an error",
	longDescription: "Resolve an error",
	arguments: [
		{
			name: "error",
			description: "The error to resolve",
			type: "string",
			required: true,
		},
		{
			name: "status",
			description: "The status of the error",
			type: "string",
			required: true,
			choices: [
				{ name: "open", value: "open" },
				{ name: "won't fix", value: "won't fix" },
				{ name: "needs more info", value: "needs more info" },
				{ name: "currently working on", value: "currently working on" },
				{ name: "fixed", value: "fixed" },
			],
		},
	],
	botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
	userPermissions: [],
	async execute(message, client, args, Discord) {
		let possibleStatuses = ["open", "won't fix", "needs more info", "currently working on", "fixed"];
		// Get the error
		let errorId = args["error"];
		let error;
		try {
			error = await global.database.error.get.by({ _id: errorId });
		} catch (e) {
			let embed = new Builders.EmbedBuilder()
				.setColor(global.config.colors.warning)
				.setDescription(`<:warning:${global.config.emojis.warning}> Are you sure that's a valid error ID?`);
			return message.reply({ embeds: [embed] });
		}
		if (!error) {
			let embed = new Builders.EmbedBuilder()
				.setColor(global.config.colors.error)
				.setDescription(`<:cross:${global.config.emojis.cross}> I couldn't find that error.`);
			return message.reply({ embeds: [embed] });
		} else {
			let status = args["status"];
			if (!possibleStatuses.includes(status)) {
				let embed = new Builders.EmbedBuilder()
					.setColor(global.config.colors.warning)
					.setDescription(`<:warning:${global.config.emojis.warning}> Are you sure that's a valid status?`);
				return message.reply({ embeds: [embed] });
			} else {
				// Update the error
				await global.database.error.set.by(errorId, { status: status });
				// Send the embed
				let embed = new Builders.EmbedBuilder()
					.setColor(global.config.colors.success)
					.setDescription(`<:check:${global.config.emojis.check}> Successfully updated the error status.`);
				return message.reply({ embeds: [embed] });
			}
		}
	}
}