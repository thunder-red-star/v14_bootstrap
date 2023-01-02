const Builders = require('@discordjs/builders');
const messagePaginator = require("../../../utils/design/messagePaginator.js");

module.exports = {
	name: "errorlist",
	enabled: true,
	ownerOnly: true,
	guildOnly: false,
	shortDescription: "List errors",
	longDescription: "List errors that have occurred in the bot.",
	arguments: [{
		name: "status", type: "string", description: "The status of the error", required: false, choices: [
			{ name: "open", value: "open" },
			{ name: "won't fix", value: "won't fix" },
			{ name: "needs more info", value: "needs more info" },
			{ name: "currently working on", value: "currently working on" },
			{ name: "fixed", value: "fixed" }
		]
	}],
	botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
	userPermissions: [],
	async execute(message, client, args, Discord) {
		// Get status
		const status = args["status"];
		let errors = await global.database.error.get.all();
		if (status) {
			// Of each error's data, filter ones with status
			let filtered = [];
			// Get value of each key
			let keys = Object.keys(errors);
			for (let i = 0; i < keys.length; i++) {
				let key = keys[i];
				let error = errors[key];
				if (error.status === args["status"]) {
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
			return message.reply({embeds: [embed]});
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
				return message.reply({embeds: [embed]});
			} else {
				let embeds = [];
				let pages = Math.ceil(errors.length / 10);
				for (let i = 0; i < pages; i++) {
					let embed = new Builders.EmbedBuilder()
						.setColor(global.config.colors.error)
						.setTitle("Errors")
						.setDescription(`There are ${errors.length} errors.`);
					for (let j = 0; j < 10; j++) {
						let error = errors[i * 10 + j];
						if (!error) break;
						embed.addFields([
							{
								name: `\`${error._id}\``,
								value: `Status: ${error.status}`
							}
						])
					}
					embeds.push(embed);
				}
				return messagePaginator(message, embeds);
			}
		}
	}
}