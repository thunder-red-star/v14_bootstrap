const { ActionRowBuilder, ButtonBuilder } = require("@discordjs/builders");

module.exports = async function confirmInteraction (interaction, embed, timeout = 30_000) {
    // Build buttons
    let yesButton = new ButtonBuilder()
        .setCustomId("yes")
        .setLabel("Yes")
        .setStyle(3);
    let noButton = new ButtonBuilder()
        .setCustomId("no")
        .setLabel("No")
        .setStyle(4);

    const buttons = new ActionRowBuilder()
        .addComponents(yesButton, noButton);
    // Send message
    await interaction.deferReply();
    const msg = await interaction.editReply({ embeds: [embed], components: [buttons] });

    // Create collector
    const filter = (i) => i.user.id === interaction.user.id;

    let interactionReply = await interaction.fetchReply();
    const collector = interactionReply.createMessageComponentCollector({ filter, time: timeout });

    // Return promise
    return new Promise(async (resolve, reject) => {
        collector.on("collect", async (i) => {
            // Update interaction
            await i.deferUpdate();
            await interaction.editReply({ embeds: [embed], components: [new ActionRowBuilder().addComponents(yesButton.setDisabled(true), noButton.setDisabled(true))] });
            // What was the button pressed?
            if (i.customId === "yes") {
                resolve(true);
            } else if (i.customId === "no") {
                resolve(false);
            }
        });
        collector.on("end", async () => {
            // Reject promise
            await interaction.editReply({ embeds: [embed], components: [new ActionRowBuilder().addComponents(yesButton.setDisabled(true), noButton.setDisabled(true))] });
            reject("timeout");
        });
    });
}