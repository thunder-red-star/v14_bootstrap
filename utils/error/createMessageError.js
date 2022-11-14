const { EmbedBuilder } = require('@discordjs/builders');

module.exports =  async function create (error, message, command = null) {
    global.logger.error("An error occurred while executing a command.");
    global.logger.logRaw(error.stack);

    await global.database.error.create({
        guildId: message.guild.id,
        userId: message.author.id,
        channelId: message.channel.id,
        messageId: message.id,
        message: message.content,
        commandName: command.name || "Unknown",
        error: error,
        stack: error.stack
    });

    // Find the error in the database
    let errorId = await global.database.error.get.by({ messageId: message.id });

    // Send the error message
    let ErrorMessage = new EmbedBuilder()
        .setColor(global.config.colors.error)
        .setTitle("Error")
        .setDescription(`<:cross:${global.config.emojis.cross}> An error occurred while executing the command. Please report this error to the bot developer by joining the support server or by using the \`report\` command. You may be DMed on the status of the error.`);
    if (errorId) {
        ErrorMessage.addFields([
            {
                name: "Error ID",
                value: `\`${errorId._id}\``,
                inline: true
            },
            {
                name: "Timestamp",
                value: `<t:${Math.round(Date.now() / 1000)}:F>`,
                inline: true
            }
        ]);
    }
    await message.reply({embeds: [ErrorMessage]});
}