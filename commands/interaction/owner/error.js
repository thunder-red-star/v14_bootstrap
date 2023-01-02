const Builders = require('@discordjs/builders');
const interactionPaginator = require('../../../utils/design/interactionPaginator.js');

module.exports = {
	name: "error",
	enabled: true,
	ownerOnly: true,
	guildOnly: false,
	shortDescription: "Error handling command umbrella",
	longDescription: "Base command for error handling and resolving commands.",
	arguments: [],
	subcommands: [{
		name: "get",
		enabled: true,
		ownerOnly: true,
		guildOnly: false,
		shortDescription: "Get an error",
		longDescription: "Get an error",
		arguments: [{
			name: "error", type: "string", description: "The error to get", required: true
		}],
		async execute(interaction, client, args, Discord) {
			await interaction.deferReply();
			// Get the error
			let errorId = interaction.options.getString("error");
			let error;
			try {
				error = await global.database.error.get.by({_id: errorId});
			} catch (e) {
				let embed = new Builders.EmbedBuilder()
					.setColor(global.config.colors.warning)
					.setDescription(`<:warning:${global.config.emojis.warning}> Are you sure that's a valid error ID?`);
				return interaction.editReply({embeds: [embed]});
			}
			if (!error) {
				let embed = new Builders.EmbedBuilder()
					.setColor(global.config.colors.error)
					.setDescription(`<:cross:${global.config.emojis.cross}> I couldn't find that error.`)
				return interaction.editReply({embeds: [embed]});
			} else {
				let guild = client.guilds.cache.get(error.guildId.toString());
				if (!guild) {
					guild = await client.guilds.fetch(error.guildId.toString());
				}
				let channel = client.channels.cache.get(error.channelId.toString());
				if (!channel) {
					channel = await client.channels.fetch(error.channelId.toString());
				}
				let user = client.users.cache.get(error.userId.toString());
				if (!user) {
					user = await client.users.fetch(error.userId.toString());
				}
				let embed = new Builders.EmbedBuilder()
					.setTitle("Error")
					.setDescription(`\`\`\`js\n${error.stack}\n\`\`\``)
					.addFields([{
						name: "Information", value: `**Guild**: ${guild.name} (${guild.id})
												**Channel**: <#${error.channelId}> (${error.channelId})
												**User**: <@${error.userId}> (${error.userId})
							  				**Message**: [Jump to message](https://discord.com/channels/${error.guildId}/${error.channelId}/${error.messageId})
												**Command**: ${error.commandName}
												**Error ID**: ${error._id}`,
					}, {
						// It's a date so we need a timestamp
						name: "Time", value: `<t:${Math.floor(error.timestamp / 1000)}:F>`, inline: true
					}, {
						name: "Status", value: `${error.status}`
					}
					])
				if (error.status === "open") {
					embed.setColor(global.config.colors.error);
				} else if (error.status === "fixed") {
					embed.setColor(global.config.colors.success);
				} else {
					embed.setColor(global.config.colors.warning);
				}
				// Send the embed
				await interaction.editReply({embeds: [embed]});
			}
		}
	}, {
		name: "resolve",
		enabled: true,
		ownerOnly: true,
		guildOnly: false,
		shortDescription: "Resolve an error",
		longDescription: "Resolve an error",
		arguments: [{
			name: "error", type: "string", description: "The error to resolve", required: true
		}, {
			name: "status", type: "string", description: "The status of the error", required: true, choices: [{
				name: "Open", value: "open"
			}, {
				name: "Won't fix", value: "won't fix"
			}, {
				name: "Needs more info", value: "needs more info"
			}, {
				name: "Currently working on", value: "currently working on"
			}, {
				name: "Fixed", value: "fixed"
			}]
		}],
		async execute(interaction, client, args, Discord) {
			let possibleStatuses = ["open", "won't fix", "needs more info", "currently working on", "fixed"];
			await interaction.deferReply();
			// Get the error
			let errorId = interaction.options.getString("error");
			let error;
			try {
				error = await global.database.error.get.by({_id: errorId});
			} catch (e) {
				let embed = new Builders.EmbedBuilder()
					.setColor(global.config.colors.warning)
					.setDescription(`<:warning:${global.config.emojis.warning}> Are you sure that's a valid error ID?`);
				return interaction.editReply({embeds: [embed]});
			}
			if (!error) {
				let embed = new Builders.EmbedBuilder()
					.setColor(global.config.colors.error)
					.setDescription(`<:cross:${global.config.emojis.cross}> I couldn't find that error.`)
				return interaction.editReply({embeds: [embed]});
			} else {
				let status = interaction.options.getString("status");
				if (!possibleStatuses.includes(status)) {
					let embed = new Builders.EmbedBuilder()
						.setColor(global.config.colors.error)
						.setDescription(`<:cross:${global.config.emojis.cross}> That's not a valid status.`);
					return interaction.editReply({embeds: [embed]});
				} else {
					await global.database.error.set.by(errorId, { status: status });
					let embed = new Builders.EmbedBuilder()
						.setColor(global.config.colors.success)
						.setDescription(`<:check:${global.config.emojis.check}> Successfully updated the error status.`);
					return interaction.editReply({embeds: [embed]});
				}
			}
		}
	}, {
		name: "list",
		enabled: true,
		ownerOnly: true,
		guildOnly: false,
		shortDescription: "List errors",
		longDescription: "List errors",
		arguments: [
			{
				name: "status", type: "string", description: "The status of the error", required: false, choices: [{
					name: "Open", value: "open"
				}, {
					name: "Won't fix", value: "won't fix"
				}, {
					name: "Needs more info", value: "needs more info"
				}, {
					name: "Currently working on", value: "currently working on"
				}, {
					name: "Fixed", value: "fixed"
				}]
			}
		],
		async execute(interaction, client, args, Discord) {
			// List errors.
			await interaction.deferReply();
			let errors = await global.database.error.get.all();
			if (interaction.options.getString("status")) {
				// Of each error's data, filter ones with status
				let filtered = [];
				// Get value of each key
				let keys = Object.keys(errors);
				for (let i = 0; i < keys.length; i++) {
					let key = keys[i];
					let error = errors[key];
					if (error.status === interaction.options.getString("status")) {
						filtered.push(error);
					}
				}
				errors = filtered;
			} else {
				// Turn object into array
				let keys = Object.keys(errors);
				let array = [];
				for (let i = 0; i < keys.length; i++) {
					let key = keys[i];
					let error = errors[key];
					array.push(error);
				}
				errors = array;
			}
			if (errors.length === 0) {
				let embed = new Builders.EmbedBuilder()
					.setColor(global.config.colors.success)
					.setDescription(`<:check:${global.config.emojis.check}> There are no errors. Give yourself a pat on the back!`);
				return interaction.editReply({embeds: [embed]});
			} else {
				// We'll put ten errors per page.
				if (errors.length <= 10) {
					let embed = new Builders.EmbedBuilder()
						.setColor(global.config.colors.error)
						.setTitle("Errors")
						.setDescription(`There are ${errors.length} errors.`);
					for (let i = 0; i < errors.length; i++) {
						let error = errors[i];
						embed.addFields([
							{
								name: `\`${error._id}\``,
								value: `Status: ${error.status}`
							}
						])
					}
					return interaction.editReply({embeds: [embed]});
				} else {
					let embeds = [];
					// Loop over ten errors at a time
					for (let i = 0; i < errors.length; i += 10) {
						let embed = new Builders.EmbedBuilder()
							.setColor(global.config.colors.error)
							.setTitle("Errors (page " + (i / 10 + 1) + ")")
							.setDescription(`There are ${errors.length} errors.`);
						for (let j = i; j < i + 10; j++) {
							let error = errors[j];
							embed.addFields([
								{
									name: `\`${error._id}\``,
									value: `Status: ${error.status}`
								}
							])
							if (j === errors.length - 1) {
								break;
							}
						}
						embeds.push(embed);
					}
					await interactionPaginator(interaction, embeds);
				}
			}
		}
	}],
	botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
	userPermissions: [],
	cooldown: 0,
	execute: async function (interaction, client, args, Discord) {
		let embed = new Builders.EmbedBuilder()
			.setColor(global.config.colors.default)
			.setDescription(`<:cross:${global.config.emojis.cross}> This command is not meant to be executed.`);
		return interaction.reply({embeds: [embed]});
	}
}