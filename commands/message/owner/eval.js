const Builders = require('@discordjs/builders');
const ms = require('ms');

module.exports = {
	name: "eval",
	enabled: true,
	ownerOnly: true,
	guildOnly: false,
	shortDescription: "Evaluate arbitrary JavaScript code",
	longDescription: "Evaluate arbitrary JavaScript code",
	arguments: [
		{
			name: "code",
			description: "The code to evaluate",
			type: "string",
			required: true,
		}
	],
	botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
	userPermissions: [],
	cooldown: 0,
	execute: async function (message, client, args, Discord) {
		const code = args.code;
		const startTimestamp = Date.now();
		try {
			const evaled = eval(code);
			const endTimestamp = Date.now();
			let successEmbed = new Builders.EmbedBuilder()
				.setColor(global.config.colors.success)
				.setTitle("Success!")
				.setDescription(`<:check:${global.config.emojis.check}> I've evaluated your code.`)
				.addFields([
					{
						name: "Result",
						value: `\`\`\`js\n${evaled}\n\`\`\``,
					},
					{
						name: "Type",
						value: `\`\`\`js\n${typeof evaled}\n\`\`\``,
					},
					{
						name: "Time",
						value: `\`\`\`js\n${ms(endTimestamp - startTimestamp)}\n\`\`\``,
					}
				])
				.setFooter({
					text: `Requested by ${message.author.tag}`,
					iconUrl: message.author.avatarURL(),
				});
			return message.reply({ embeds: [successEmbed] });
		} catch (error) {
			const endTimestamp = Date.now();
			let errorEmbed = new Builders.EmbedBuilder()
				.setColor(global.config.colors.error)
				.setTitle("Error!")
				.setDescription(`<:cross:${global.config.emojis.cross}> I attempted to evaluate your code, but an error occurred.`)
				.addFields([
					{
						name: "Result",
						value: `\`\`\`js\n${error}\n\`\`\``,
					},
					{
						name: "Stack",
						value: `\`\`\`js\n${error.stack}\n\`\`\``,
					},
					{
						name: "Time",
						value: `\`\`\`js\n${ms(endTimestamp - startTimestamp)}\n\`\`\``,
					}
				])
				.setFooter({
					text: `Requested by ${message.author.tag}`,
					iconUrl: message.author.avatarURL(),
				});
			return message.reply({ embeds: [errorEmbed] });
		}
	}
}