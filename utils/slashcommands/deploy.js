const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { SlashCommandBuilder } = require("@discordjs/builders");

function addSubcommand(subcommand, command) {
    subcommand
        .setName(command.name)
        .setDescription(command.shortDescription)

    for (const argument of command.arguments) {
        if (argument.type === "string") {
            subcommand.addStringOption((option) => {
                option.setName(argument.name)
                    .setDescription(argument.description)
                    .setRequired(argument.required)

                if (argument.choices) {
                    for (const choice of argument.choices) {
                        option.addChoices(choice);
                    }
                }

                return option;
            });
        } else if (argument.type === "number") {
            subcommand.addNumberOption((option) => {
                option.setName(argument.name)
                    .setDescription(argument.description)
                    .setRequired(argument.required)

                if (argument.choices) {
                    for (const choice of argument.choices) {
                        option.addChoices({
                            name: choice.name, value: choice.value
                        })
                    }
                }

                return option;
            });
        } else if (argument.type === "boolean") {
            subcommand.addBooleanOption((option) => {
                option.setName(argument.name)
                    .setDescription(argument.description)
                    .setRequired(argument.required)

                if (argument.choices) {
                    for (const choice of argument.choices) {
                        option.addChoices({
                            name: choice.name, value: choice.value
                        })
                    }
                }

                return option;
            });
        } else if (argument.type === "user") {
            subcommand.addUserOption((option) => {
                option.setName(argument.name)
                    .setDescription(argument.description)
                    .setRequired(argument.required)

                if (argument.choices) {
                    for (const choice of argument.choices) {
                        option.addChoices({
                            name: choice.name, value: choice.value
                        })
                    }
                }

                return option;
            });
        } else if (argument.type === "channel") {
            subcommand.addChannelOption((option) => {
                option.setName(argument.name)
                    .setDescription(argument.description)
                    .setRequired(argument.required)

                if (argument.choices) {
                    for (const choice of argument.choices) {
                        option.addChoices({
                            name: choice.name, value: choice.value
                        })
                    }
                }

                return option;
            });
        } else if (argument.type === "role") {
            subcommand.addRoleOption((option) => {
                option.setName(argument.name)
                    .setDescription(argument.description)
                    .setRequired(argument.required)

                if (argument.choices) {
                    for (const choice of argument.choices) {
                        option.addChoices({
                            name: choice.name, value: choice.value
                        })
                    }
                }

                return option;
            });
        } else if (argument.type === "mentionable") {
            subcommand.addMentionableOption((option) => {
                option.setName(argument.name)
                    .setDescription(argument.description)
                    .setRequired(argument.required)

                if (argument.choices) {
                    for (const choice of argument.choices) {
                        option.addChoices({
                            name: choice.name, value: choice.value
                        })
                    }
                }

                return option;
            });
        } else {
            throw new Error(`Unknown argument type: ${argument.type}`);
        }
    }

    return subcommand;
}

function convertToSlashCommand(command) {
    const slashCommand = new SlashCommandBuilder()
        .setName(command.name)
        .setDescription(command.shortDescription)
    if (command.subcommands) {
        for (const subcommand of command.subcommands) {
            slashCommand.addSubcommand((s) => {
                return addSubcommand(s, subcommand);
            });
        }
    }
    // Create option-builder for each argument
    for (const argument of command.arguments) {
        if (argument.type === "string") {
            slashCommand.addStringOption((option) => {
                option.setName(argument.name)
                    .setDescription(argument.description)
                    .setRequired(argument.required)

                if (argument.choices) {
                    for (const choice of argument.choices) {
                        option.addChoices(choice);
                    }
                }

                return option;
            });
        } else if (argument.type === "number") {
            slashCommand.addNumberOption((option) => {
                option.setName(argument.name)
                    .setDescription(argument.description)
                    .setRequired(argument.required)

                if (argument.choices) {
                    for (const choice of argument.choices) {
                        option.addChoices({
                            name: choice.name, value: choice.value
                        })
                    }
                }

                return option;
            });
        } else if (argument.type === "boolean") {
            slashCommand.addBooleanOption((option) => {
                option.setName(argument.name)
                    .setDescription(argument.description)
                    .setRequired(argument.required)

                if (argument.choices) {
                    for (const choice of argument.choices) {
                        option.addChoices({
                            name: choice.name, value: choice.value
                        })
                    }
                }

                return option;
            });
        } else if (argument.type === "user") {
            slashCommand.addUserOption((option) => {
                option.setName(argument.name)
                    .setDescription(argument.description)
                    .setRequired(argument.required)

                return option;
            });
        } else if (argument.type === "channel") {
            slashCommand.addChannelOption((option) => {
                option.setName(argument.name)
                    .setDescription(argument.description)
                    .setRequired(argument.required)

                return option;
            });
        } else if (argument.type === "role") {
            slashCommand.addRoleOption((option) => {
                option.setName(argument.name)
                    .setDescription(argument.description)
                    .setRequired(argument.required)

                return option;
            });
        } else if (argument.type === "mentionable") {
            slashCommand.addMentionableOption((option) => {
                option.setName(argument.name)
                    .setDescription(argument.description)
                    .setRequired(argument.required)

                return option;
            });
        } else {
            throw new Error(`Unknown argument type: ${argument.type}`);
        }
    }
    return slashCommand;
}

async function deployAll(client) {
    // Assuming client contains interactionCommands collection
    let commands = client.interactionCommands.map(command => convertToSlashCommand(command).toJSON());
    const rest = new REST({version: '9'}).setToken(client.token);

    try {
        await rest.put(Routes.applicationCommands(client.user.id), {body: commands},);

        global.logger.info(`[${client.shard.ids[0] + 1}] Successfully registered application commands.`);
    } catch (error) {
        global.logger.error(`[${client.shard.ids[0] + 1}] Could not register application commands: ${error}`);
    }
}

async function deployGuild(client, guildId) {
    // Assuming client contains interactionCommands collection
    const commands = client.interactionCommands.map(command => convertToSlashCommand(command).toJSON());
    const rest = new REST({version: '9'}).setToken(client.token);

    try {
        await rest.put(Routes.applicationGuildCommands(client.user.id, guildId), {body: commands},);

        global.logger.info(`[${client.shard.ids[0] + 1}] Successfully registered application commands for guild ${guildId}.`);
    } catch (error) {
        global.logger.error(`[${client.shard.ids[0] + 1}] Could not register application commands for guild ${guildId}: ${error}`);
    }
}
module.exports = {
    deployAll,
    deployGuild
}