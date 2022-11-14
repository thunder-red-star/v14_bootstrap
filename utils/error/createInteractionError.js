const { EmbedBuilder } = require('@discordjs/builders');

module.exports = async function create (error, interaction, command = null) {
    try {
        await interaction.deferReply();
    } catch (error) {
        // Ignore
    }

    global.logger.error("An error occurred while executing a command.");
    global.logger.logRaw(error.stack);

    await global.database.error.create({
        guildId: interaction.guild.id,
        userId: interaction.user.id,
        channelId: interaction.channel.id,
        messageId: interaction.id,
        message: "Interaction",
        commandName: command.name || "Unknown",
        error: error,
        stack: error.stack
    });

    // Find the error in the database
    let errorId = await global.database.error.get.by({ messageId: interaction.id });

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

    await interaction.editReply({embeds: [ErrorMessage]});
}