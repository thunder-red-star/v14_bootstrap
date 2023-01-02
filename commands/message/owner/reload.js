const Builders = require('@discordjs/builders');
const fs = require('fs');
const path = require('path');
module.exports = {
	name: "reload",
	enabled: true,
	ownerOnly: true,
	guildOnly: false,
	shortDescription: "Reload a command",
	longDescription: "Reload a message command file, updating the command's backend without restarting the bot.",
	arguments: [
		{
			name: "command",
			description: "The command to reload",
			type: "string",
			required: true
		}
	],
	botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
	userPermissions: [],
	cooldown: 0,
	execute: async function (message, client, args, Discord) {
		// Get command
		const command = args["command"];
		// Check if command exists
		if (!client.messageCommands.has(command)) {
			const embed = new Builders.EmbedBuilder()
				.setColor(global.config.colors.error)
				.setDescription(`<:cross:${global.config.emojis.cross}> Command \`${command}\` does not exist.`);
			return message.reply({embeds: [embed]});
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
				await message.reply({embeds: [embed]});
				return;
			}

			client.messageCommands.delete(command);
			// Put the new version in
			const newCommand = await import("file://" + commandFile);
			client.messageCommands.set(command, newCommand.default);
			// Log
			const embed = new Builders.EmbedBuilder()
				.setColor(global.config.colors.success)
				.setDescription(`<:check:${global.config.emojis.check}> Command \`${command}\` reloaded.`);
			await message.reply({embeds: [embed]});
		} catch (error) {
			// Log error
			console.error(error);
			// Send error message
			const embed = new Builders.EmbedBuilder()
				.setColor(global.config.colors.error)
				.setDescription(`<:cross:${global.config.emojis.cross}> An error occurred while reloading command \`${command}\`.`);
			await message.reply({embeds: [embed]});
		}
	}
}