const Builders = require('@discordjs/builders');
const fs = require('fs');
const path = require('path');

module.exports = {
	name: "reload",
	enabled: true,
	ownerOnly: true,
	guildOnly: false,
	shortDescription: "Reload a command",
	longDescription: "Reload a command file, updating the command's backend without restarting the bot.",
	arguments: [{
		name: "command", description: "The command to reload", type: "string", required: true
	}],
	botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
	userPermissions: ["MANAGE_GUILD"],
	cooldown: 5_000,
	execute: async function (interaction, client, args, Discord) {
		// Get command
		await interaction.deferReply();
		const command = interaction.options.getString("command");
		// Check if command exists
		if (!client.interactionCommands.has(command)) {
			const embed = new Builders.EmbedBuilder()
				.setColor(global.config.colors.error)
				.setDescription(`<:error:${global.config.emojis.error}> Command \`${command}\` does not exist.`);
			return interaction.editReply({embeds: [embed]});
		}
		try {
			// Find command file
			let commandFile = null;
			let directoryName = null;
			let directories = fs.readdirSync(path.join(__dirname, ".."));
			for (let i = 0; i < directories.length; i++) {
				const directory = directories[i];
				const files = fs.readdirSync(path.join(__dirname, "..", directory));
				for (let j = 0; j < files.length; j++) {
					const file = files[j];
					if (file === `${command}.js`) {
						commandFile = path.join(__dirname, "..", directory, file);
						directoryName = directory;
						break;
					}
				}
				if (commandFile) break;
			}
			if (!commandFile) {
				const embed = new Builders.EmbedBuilder()
					.setColor(global.config.colors.error)
					.setDescription(`<:cross:${global.config.emojis.cross}> Command \`${command}\` does not exist.`);
				await interaction.editReply({embeds: [embed]});
				return;
			}

			client.interactionCommands.delete(command);
			// Put the new version in
			const newCommand = await import("file://" + commandFile);
			client.interactionCommands.set(command, newCommand.default);

			// Send success message
			const embed = new Builders.EmbedBuilder()
				.setColor(global.config.colors.success)
				.setDescription(`<:check:${global.config.emojis.check}> Command \`${command}\` has been reloaded.`);
			await interaction.editReply({embeds: [embed]});
		} catch (error) {
			global.logger.logRaw(error);
			const embed = new Builders.EmbedBuilder()
				.setColor(global.config.colors.error)
				.setDescription(`<:cross:${global.config.emojis.cross}> An error occurred while reloading command \`${command}\`.`);
			await interaction.editReply({embeds: [embed]});
		}
	}
}