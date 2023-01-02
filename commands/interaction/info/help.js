const Builders = require('@discordjs/builders');
const fs = require('fs');
const path = require('path');
const interactionPaginator = require("../../../utils/design/interactionPaginator.js");
const ms = require('ms');

async function getCommandMention (interaction, cmdName) {
	let commands = interaction.guild.commands.cache;
	if (!commands.find(cmd => cmd.name === cmdName && cmd.applicationId === interaction.client.user.id)) {
		commands = await interaction.guild.commands.fetch();
	}
	if (!commands.find(cmd => cmd.name === cmdName && cmd.applicationId === interaction.client.user.id)) {
		return undefined;
	}
	return `</${cmdName}:${commands.find(cmd => cmd.name === cmdName && cmd.applicationId === interaction.client.user.id) ?.id}>`;
}

module.exports = {
	name: "help",
	enabled: true,
	ownerOnly: false,
	guildOnly: false,
	shortDescription: "Get help with commands",
	longDescription: "Get a list of commands or get help with a specific command.",
	arguments: [
		{
			name: "command",
			description: "The command to get help with",
			type: "string",
			required: false,
			choices: []
		}
	],
	botPermissions: [
		"SEND_MESSAGES",
		"EMBED_LINKS"
	],
	userPermissions: [],
	cooldown: 5_000,
	execute: async function(interaction, client, args, Discord) {
		// Get guild prefix
		let prefix = global.config.defaultPrefix;
		if (interaction.guild) {
			const guild = await global.database.guild.get.by({ id: interaction.guild.id });
			if (guild) prefix = guild.prefix;
		}
		// Is a command specified?
		if (interaction.options.getString("command")) {
			// Get command
			let query = interaction.options.getString("command");
			const command = client.interactionCommands.get(query);
			if (!command) {
				let embed = new Builders.EmbedBuilder()
					.setColor(global.config.colors.error)
					.setDescription(`<:cross:${global.config.emojis.cross}> Command \`${query}\` not found.`);
				return await interaction.reply({ embeds: [embed], ephemeral: true });
			}
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
			// Create embed
			let helpEmbed = new Builders.EmbedBuilder()
				.setTitle(`/${command.name}`)
				.setDescription(command.longDescription)
				.setColor(global.config.colors.default)
				.addFields([{
					name: "Usage",
					value: `\`/${command.name}${cmdArgString}\``,
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
			return interaction.reply({ embeds: [helpEmbed] });
		} else {
			// Get categories
			const categories = client.categories;
			// Read commands for each category
			let paginatorEmbeds = [];
			// Fetch guild's application commands
			let guildCommands = await interaction.guild.commands.fetch();
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
								text: `Not seeing a command? Maybe it's a message command! Try ${prefix}help`,
							});
						for (let command of currentCommands) {
							embed.addFields([{
								name: await getCommandMention(interaction, command.name) || `/${command.name} (Please deploy this command!)`,
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
							text: `Not seeing a command? Maybe it's a message command! Try ${prefix}help`,
						});
					for (let command of commands) {
						embed.addFields([{
							name: await getCommandMention(interaction, command.name) || `/${command.name} (Please deploy this command!)`,
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
			await interactionPaginator(interaction, paginatorEmbeds);
		}
	}
}