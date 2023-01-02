const Builders = require('@discordjs/builders');
const ms = require('ms');

module.exports = {
	name: "eval",
	enabled: true,
	ownerOnly: true,
	guildOnly: false,
	shortDescription: "Evaluate code",
	longDescription: "Evaluate code",
	arguments: [],
	botPermissions: [
		"SEND_MESSAGES",
		"EMBED_LINKS"
	],
	userPermissions: [],
	cooldown: 0,
	execute: async function(interaction, client, args, Discord) {
		// Defer reply
		const modal = new Builders.ModalBuilder()
			.setTitle("Evaluate code")
			.setCustomId("eval")
			.addComponents([
				new Builders.ActionRowBuilder()
					.addComponents(
						new Builders.TextInputBuilder()
							.setCustomId("code")
							.setPlaceholder("console.log('Hello world!')")
							.setStyle(2)
							.setLabel("The code to evaluate")
							.setMinLength(1)
					)
			])

		// Send the modal
		await interaction.showModal(modal);

		// Await the modal submit
		let modalSubmission = await interaction.awaitModalSubmit({time: 60_000, max: 1});
		await modalSubmission.deferUpdate();
		if (!modalSubmission) {
			await interaction.channel.send({
				content: "Timed out",
				ephemeral: true
			});
			return;
		} else {
			// Get the code
			let code = modalSubmission.fields.getTextInputValue("code");

			// Evaluate the code
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
						text: `Requested by ${interaction.user.tag}`,
						iconUrl: interaction.user.avatarURL(),
					});
				await interaction.channel.send({ embeds: [successEmbed] });
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
						text: `Requested by ${interaction.user.tag}`,
						iconUrl: interaction.user.avatarURL(),
					});
				await interaction.channel.send({ embeds: [errorEmbed] });
			}
		}
	}
}