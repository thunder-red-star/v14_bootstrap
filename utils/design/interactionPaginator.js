// Message command paginator (use buttons)
const Builders = require("@discordjs/builders");

const leftButton = new Builders.ButtonBuilder()
    .setCustomId("left")
    .setStyle(1)
    .setEmoji({
        name: "⬅️",
        id: global.config.emojis.paginator.left,
        animated: false
    });
const rightButton = new Builders.ButtonBuilder()
    .setCustomId("right")
    .setStyle(1)
    .setEmoji({
        name: "➡️",
        id: global.config.emojis.paginator.right,
        animated: false
    });
const stopButton = new Builders.ButtonBuilder()
    .setCustomId("delete")
    .setStyle(4)
    .setEmoji({
        name: "⏹️",
        id: global.config.emojis.paginator.delete,
        animated: false
    });
const firstButton = new Builders.ButtonBuilder()
    .setCustomId("first")
    .setStyle(1)
    .setEmoji({
        name: "⏪",
        id: global.config.emojis.paginator.first,
        animated: false
    });
const lastButton = new Builders.ButtonBuilder()
    .setCustomId("last")
    .setStyle(1)
    .setEmoji({
        name: "⏩",
        id: global.config.emojis.paginator.last,
        animated: false
    });
const searchButton = new Builders.ButtonBuilder()
    .setCustomId("search")
    .setStyle(1)
    .setEmoji({
        name: "🔍",
        id: global.config.emojis.paginator.search,
        animated: false
    });
const blankButton1 = new Builders.ButtonBuilder()
    .setLabel(" ")
    .setStyle(2)
    .setCustomId("blank1");

const blankButton2 = new Builders.ButtonBuilder()
    .setLabel(" ")
    .setStyle(2)
    .setCustomId("blank2");

const blankButton3 = new Builders.ButtonBuilder()
    .setLabel(" ")
    .setStyle(2)
    .setCustomId("blank3");

const blankButton4 = new Builders.ButtonBuilder()
    .setLabel(" ")
    .setStyle(2)
    .setCustomId("blank4");

let row1 = [
    firstButton,
    leftButton,
    searchButton,
    rightButton,
    lastButton
]

let row2 = [
    blankButton1,
    blankButton2,
    stopButton,
    blankButton3,
    blankButton4
]

module.exports = async function(interaction, pages) {
    let titles = [];
    for (let i = 0; i < pages.length; i++) {
        titles.push(pages[i].data.title || null);
    }
    let actionRow1 = new Builders.ActionRowBuilder();
    let actionRow2 = new Builders.ActionRowBuilder();
    let page = 0;
    for (let i = 0; i < row1.length; i++) {
        // Copy the button into a new button
        let button = new Builders.ButtonBuilder()
            .setCustomId(row1[i].data.custom_id)
            .setStyle(row1[i].data.style)
            .setEmoji(row1[i].data.emoji)
        if (page === 0 && (i === 0 || i === 1)) {
            button.setDisabled(true);
        }
        if (page === pages.length - 1 && (i === 3 || i === 4)) {
            button.setDisabled(true);
        }
        actionRow1.addComponents([button]);
    }
    for (let i = 0; i < row2.length; i++) {
        actionRow2.addComponents([row2[i]]);
    }
    try {
        await interaction.deferReply();
    } catch (error) {
        // Do nothing
    }
    let reply = await interaction.editReply({
        content: `Page ${page + 1} of ${pages.length}`,
        embeds: [pages[page]],
        components: [actionRow1, actionRow2]
    });

    // Create the button collector
    const filter = (button) => {
        button.user.id === interaction.user.id;
    };

    const collector = await reply.createMessageComponentCollector(filter, {
        filter,
        timeout: 60000
    });

    collector.on("collect", async (button) => {
        if (button.user.id !== interaction.user.id) return;
        // Reset the button collector timeout
        collector.resetTimer();
        switch (button.customId) {
            case 'first':
                page = 0;
                break;
            case 'left':
                if (page > 0) {
                    page--;
                }
                break;
            case 'delete':
                interaction.delete();
                return;
            case 'right':
                if (page < pages.length - 1) {
                    page++;
                }
                break;
            case 'last':
                page = pages.length - 1;
                break;
            case 'search':
                // Build a modal
                let searchModal = new Builders.ModalBuilder()
                    .setTitle("Search for a page")
                    .setCustomId("searchModal")
                    .addComponents([
                        new Builders.ActionRowBuilder()
                            .addComponents(
                                new Builders.TextInputBuilder()
                                    .setCustomId("searchInput")
                                    .setPlaceholder("Page number or title")
                                    .setMinLength(1)
                                    .setMaxLength(100)
                                    .setLabel("Type in a page number or your query")
                                    .setStyle(1)
                            )
                    ])

                // Send the modal
                await button.showModal(searchModal);
                let modalSubmission = await button.awaitModalSubmit({time: 15_000, max: 1});
                if (!modalSubmission) {
                    await button.reply({
                        content: "Timed out",
                        ephemeral: true
                    });
                    return;
                } else {
                    // Get the input
                    let input = modalSubmission.fields.getTextInputValue("searchInput");
                    if (isNaN(input)) {
                        // Search for the title
                        let found = false;
                        for (let i = 0; i < titles.length; i++) {
                            if (titles[i].toLowerCase().includes(input.toLowerCase())) {
                                page = i;
                                found = true;
                                break;
                            }
                        }
                        if (!found) {
                            await modalSubmission.reply({
                                content: "No page found",
                                ephemeral: true
                            });
                            return;
                        }
                    } else {
                        // Search for the page number
                        if (input > pages.length || input < 1) {
                            await modalSubmission.reply({
                                content: "No page found",
                                ephemeral: true
                            });
                            return;
                        }
                        page = input - 1;
                    }
                    // Update the page
                    let actionRow1 = new Builders.ActionRowBuilder();
                    let actionRow2 = new Builders.ActionRowBuilder();
                    for (let i = 0; i < row1.length; i++) {
                        // Copy the button into a new button
                        let button = new Builders.ButtonBuilder()
                            .setCustomId(row1[i].data.custom_id)
                            .setStyle(row1[i].data.style)
                            .setEmoji(row1[i].data.emoji)
                        if (page === 0 && (i === 0 || i === 1)) {
                            button.setDisabled(true);
                        }
                        if (page === pages.length - 1 && (i === 3 || i === 4)) {
                            button.setDisabled(true);
                        }
                        actionRow1.addComponents([button]);
                    }
                    for (let i = 0; i < row2.length; i++) {
                        actionRow2.addComponents([row2[i]]);
                    }

                    await modalSubmission.reply({
                        content: `Gotcha!`,
                        ephemeral: true
                    });

                    // Send the new page
                    await interaction.editReply({
                        content: `Page ${page + 1} of ${pages.length}`,
                        embeds: [pages[page]],
                        components: [actionRow1, actionRow2]
                    });
                }
                break;
        }

        try {
            await button.deferUpdate();
        } catch (e) {
            // Ignore
        }

        // Update the page
        let actionRow1 = new Builders.ActionRowBuilder();
        let actionRow2 = new Builders.ActionRowBuilder();
        for (let i = 0; i < row1.length; i++) {
            // Copy the button into a new button
            let button = new Builders.ButtonBuilder()
                .setCustomId(row1[i].data.custom_id)
                .setStyle(row1[i].data.style)
                .setEmoji(row1[i].data.emoji)
            if (page === 0 && (i === 0 || i === 1)) {
                button.setDisabled(true);
            }
            if (page === pages.length - 1 && (i === 3 || i === 4)) {
                button.setDisabled(true);
            }
            actionRow1.addComponents([button]);
        }
        for (let i = 0; i < row2.length; i++) {
            actionRow2.addComponents([row2[i]]);
        }

        // Send the new page
        await interaction.editReply({
            content: `Page ${page + 1} of ${pages.length}`,
            embeds: [pages[page]],
            components: [actionRow1, actionRow2]
        });
    });

    collector.on('end', async (collected, reason) => {
        // If message was deleted, do nothing
        try {
            // Create a new action row, but with all buttons disabled
            let actionRow1 = new Builders.ActionRowBuilder();
            let actionRow2 = new Builders.ActionRowBuilder();
            for (let i = 0; i < row1.length; i++) {
                // Copy the button into a new button
                let button = new Builders.ButtonBuilder()
                    .setCustomId(row1[i].data.custom_id)
                    .setStyle(row1[i].data.style)
                    .setEmoji(row1[i].data.emoji)
                    .setDisabled(true);
                actionRow1.addComponents([button]);
            }
            for (let i = 0; i < row2.length; i++) {
                actionRow2.addComponents([button.setDisabled(true)]);
            }

            // Send the new page
            await interaction.editReply({
                content: `Page ${page + 1} of ${pages.length}`,
                embeds: [pages[page]],
                components: [actionRow1, actionRow2]
            });
        } catch (e) {
            // Do nothing since message was deleted
        }
    });
};