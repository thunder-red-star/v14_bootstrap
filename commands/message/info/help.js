const Builders = require('@discordjs/builders');
const fs = require('fs');
const path = require('path');
const messagePaginator = require("../../../utils/design/messagePaginator.js");
const ms = require('ms');

module.exports = {
	name: "help",
	enabled: true,
	ownerOnly: false,
	guildOnly: false,
	shortDescription: "Get help with commands",
	longDescription: "Get a list of commands or get help with a specific command.",
	aliases: ["halp", "h"],
	arguments: [
		{
			name: "command",
			description: "The command to get help with",
			type: "string",
			required: false,
		}
	],
	botPermissions: [
		"SEND_MESSAGES",
		"EMBED_LINKS"
	],
	userPermissions: [],
	cooldown: 5_000,
	execute: async function(message, client, args, Discord) {
		// Get server prefix
		let prefix = global.config.defaultPrefix;
		if (message.guild) {
			const guild = await global.database.guild.get.by({ _id: message.guild.id });
			if (guild) prefix = guild.prefix;
		}
		// If no command is specified
		if (!args.command) {
			// Get categories
			const categories = client.categories;
			// Read commands for each category
			let paginatorEmbeds = [];
			for (let category of categories) {
				// Load commands from directory
				let commands = [];
				if (fs.existsSync(path.join(__dirname, `../${category}`))) {
					const commandFiles = fs.readdirSync(path.join(__dirname, `../${category}`)).filter(file => file.endsWith('.js'));
					for (const file of commandFiles) {
						const command = await import(`../${category}/${file}`);
						commands.push(command.default);
					}
				}
				// Create embed
				// If more than 10 commands, create multiple embeds
				if (commands.length > 10) {
					for (let i = 0; i < commands.length; i += 10) {
						const currentCommands = commands.slice(i, i + 10);
						const embed = new Builders.EmbedBuilder()
							.setColor(global.config.colors.default)
							.setTitle(`Commands in ${category} (${i + 1}-${i + 10})`)
							.setFooter({
								text: `Not seeing a command? Maybe it's a slash command! Try /help!`
							});
						for (let command of currentCommands) {
							embed.addFields([{
								name: `\`${prefix}${command.name}\``,
								value: command.shortDescription,
								inline: false
							}]);
						}
						paginatorEmbeds.push(embed);
					}
				} else if (commands.length > 0) {
					const embed = new Builders.EmbedBuilder()
						.setColor(global.config.colors.default)
						.setTitle(`Commands in ${category}`)
						.setFooter({
							text: `Not seeing a command? Maybe it's a slash command! Try /help!`
						});
					for (let command of commands) {
						embed.addFields([{
							name: `\`${prefix}${command.name}\``,
							value: command.shortDescription,
							inline: false
						}]);
					}
					paginatorEmbeds.push(embed);
				} else if (commands.length === 0) {
					const embed = new Builders.EmbedBuilder()
						.setColor(global.config.colors.default)
						.setTitle(`Commands in ${category}`)
						.setDescription(`No commands in this category yet! 🤷‍♂️`)
						.setFooter({
							text: `Not seeing a command? Maybe it's a slash command! Try /help!`
						});
					paginatorEmbeds.push(embed);
				}
			}
			// Create paginator
			await messagePaginator(message, paginatorEmbeds)
		}
		// If a command is specified
		else {
			// Get command
			const command = client.messageCommands.get(args.command) || client.messageCommands.find(cmd => cmd.aliases && cmd.aliases.includes(args.command));
			if (!command) {
				let failedEmbed = new Builders.EmbedBuilder()
					.setColor(global.config.colors.error)
					.setDescription(`<:error:${global.config.emojis.error}> That command doesn't exist!`);
				return message.channel.send({embeds: [failedEmbed]});
			} else {
				// Convert arguments to string for embed
				let cmdArgString = "";
				if (command.arguments.length > 0) {
					cmdArgString += " ";
				}
				for (let i = 0; i < command.arguments.length; i++) {
					if (i > 0) cmdArgString += " ";
					if (command.arguments[i].required) {
						cmdArgString += "<" + command.arguments[i].name + ">";
					} else {
						cmdArgString += "[" + command.arguments[i].name + "]";
					}
				}

				// Construct embed
				let helpEmbed = new Builders.EmbedBuilder()
					.setTitle(`${prefix}${command.name}`)
					.setDescription(command.longDescription)
					.setColor(global.config.colors.default)
					.addFields([{
						name: "Usage",
						value: `\`${prefix}${command.name}${cmdArgString}\``,
					}])
					.addFields([{
						name: "Aliases",
						value: command.aliases.length > 0 ? command.aliases.map(alias => `\`${prefix}${alias}\``).join(", ") : "None",
					}])
					.addFields([{
						name: "Cooldown",
						value: `${ms(command.cooldown, { long: true })}`,
					}])
					.addFields([{
						name: "Permissions Required",
						value: command.userPermissions.length > 0 ? command.userPermissions.map(perm => `\`${perm}\``).join(", ") : "None",
					}])
					.addFields([{
						name: "Bot Permissions Required",
						value: command.botPermissions.length > 0 ? command.botPermissions.map(perm => `\`${perm}\``).join(", ") : "None",
					}])
					.addFields([{
						name: "Other command info",
						value: `Enabled: ${command.enabled ? "Yes" : "No"}\nGuild Only: ${command.guildOnly ? "Yes" : "No"}\nOwner Only: ${command.ownerOnly ? "Yes" : "No"}`
					}]);
				await message.channel.send({embeds: [helpEmbed]});
			}
		}
	}
}