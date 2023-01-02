const { EmbedBuilder } = require('@discordjs/builders');
const os = require("os");
const ms = require("ms");
const fs = require("fs");
const path = require("path")
const chalk = require('chalk');


function buildGaugeString (value, max) {
	// Max gauge width excluding the side borders is 20.
	const gaugeWidth = 50;
	const gaugeFill = "█";
	const gaugeEmpty = " ";
	let calculatedValue = value / max * gaugeWidth;
	let string = "";
	for (let i = 0; i < gaugeWidth; i++) {
		if (i < calculatedValue) {
			string += gaugeFill;
		} else {
			string += gaugeEmpty;
		}
	}
	return chalk.green(string.split("").slice(0, Math.round(gaugeWidth * 0.7)).join("")) +
		chalk.yellow(string.split("").slice(Math.round(gaugeWidth * 0.7), Math.round(gaugeWidth * 0.9)).join("")) +
		chalk.red(string.split("").slice(Math.round(gaugeWidth * 0.9)).join(""));
}

function toCodeBlock (string, language = "") {
	return `\`\`\`${language}\n${string}\`\`\``;
}

function calculateLoadPercentAndReturnAString() {
	// The string will be formatted as "<average load>% <gauge>"
	const load = os.loadavg();
	const averageLoad = Math.round(load[0] * 100);
	const gauge = toCodeBlock(buildGaugeString(averageLoad, 100), "ansi");
	return `${averageLoad}% ${gauge}`;
}

function calculateMemoryUsageAndReturnAString() {
	const memoryUsage = process.memoryUsage();
	const totalMemory = Math.round(memoryUsage.heapTotal / 1024 / 1024);
	const usedMemory = Math.round(memoryUsage.heapUsed / 1024 / 1024);
	const gauge = toCodeBlock(buildGaugeString(usedMemory, totalMemory), "ansi");
	return `${usedMemory}/${totalMemory}MB ${gauge}`;
}

function calculateSystemMemoryUsageAndReturnAString() {
	const memoryUsage = os.freemem();
	const totalMemory = Math.round(os.totalmem() / 1024 / 1024);
	const usedMemory = Math.round(memoryUsage / 1024 / 1024);
	const gauge = toCodeBlock(buildGaugeString(usedMemory, totalMemory), "ansi");
	return `${usedMemory}/${totalMemory}MB ${gauge}`;
}

module.exports = {
	name: 'stats',
	enabled: true,
	ownerOnly: false,
	guildOnly: false,
	shortDescription: 'Get bot stats',
	longDescription: 'Get the bot\'s stats, including uptime, memory usage, and more.',
	arguments: [],
	botPermissions: [
		'SEND_MESSAGES',
		'EMBED_LINKS',
	],
	userPermissions: [],
	cooldown: 5_000,
	execute: async function(interaction, client, args, Discord) {
		// Get package.json
		const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../package.json'), 'utf8'));

		let totalUsers = 0;
		for (let guild of client.guilds.cache.values()) {
			totalUsers += guild.memberCount;
		}
		// Create a statistics embed.
		let discordJSVersion = packageJson.dependencies["discord.js"].replace(/^(\d+\.\d+\.\d+).*$/, "$1");
		let otherDependencies = Object.keys(packageJson.dependencies).filter(dependency => dependency !== "discord.js");
		let otherDependenciesString = "";
		if (otherDependencies.length > 0) {
			// Create a string of other dependencies. Each line should look like this:
			// "name@version"
			otherDependenciesString = otherDependencies.map(dependency => `•  ${dependency}: \`${packageJson.dependencies[dependency].replace(/^(\d+\.\d+\.\d+).*$/, "$1").replace("^", "").replace("~", "")}\``).join("\n");
		}
		const statsEmbed = new EmbedBuilder()
			.setTitle("Statistics")
			.addFields([
				{
					name: "Development statistics",
					value: `Node Version: ${process.version}
					Library: discord.js v${discordJSVersion.replace("^", "")}
					Depends on: 
					${otherDependenciesString}
					`
				},
				{
					name: "System statistics",
					value: `
					OS: ${os.type()} ${os.release()}
					CPU: ${os.cpus()[0].model} (${os.cpus()[0].speed} MHz) x${os.cpus().length}
					System Load: ${calculateLoadPercentAndReturnAString()}
					System Memory: ${calculateSystemMemoryUsageAndReturnAString()}
				  `
				},
				{
					name: "Bot statistics",
					value: `
					Uptime: ${ms(client.uptime)}
					Memory Usage: ${calculateMemoryUsageAndReturnAString()}
					Number of guilds: ${client.guilds.cache.size}
					Number of users: ${totalUsers}
					Number of cached users: ${client.users.cache.size}
					`
				}
			])
			.setColor(global.config.colors.default)
			.setFooter({
				text: `${client.user.username} v${packageJson.version}`
			})
			.setTimestamp()

		await interaction.deferReply();

		return interaction.editReply({
			embeds: [statsEmbed]
		});
	}
}