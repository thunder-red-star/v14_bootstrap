// https://github.com/thunder-red-star/PotatwoIndustries/blob/master/src/utils/parsers/argParser.js

module.exports = async function(message, argTemplate) {
    let argsArray = message.content.split(" ").slice(1);
    let parsedArgs = {};
    for (let i = 0; i < argTemplate.length; i++) {
        let arg = argTemplate[i];
        let argName = arg.name;
        let argType = arg.type;
        let argRequired = arg.required;
        let argDefault = arg.default;
        let argValue = null;
        if (argRequired && argsArray.length <= i) {
            argValue = null;
        } else if (argsArray.length <= i) {
            argValue = argDefault;
        } else {
            if (i === argTemplate.length - 1) {
                argValue = argsArray.slice(i).join(" ");
            } else {
                argValue = argsArray[i];
            }
        }
        if (argType === "number") {
            if (isNaN(argValue)) {
                argValue = null;
            } else {
                argValue = parseInt(argValue);
                if (argValue.toString().includes("NaN")) {
                    argValue = null;
                }
            }
        } else if (argType === "boolean") {
            if (argValue === "true") {
                argValue = true;
            } else if (argValue === "false") {
                argValue = false;
            } else {
                argValue = null;
            }
        } else if (argType === "user") {
            if (argValue === null || argValue === undefined) {
                argValue = null;
            } else if (argValue.match(/^<@!?(\d+)>$/)) {
                if (argValue.startsWith("<@") && argValue.endsWith(">")) {
                    if (argValue.startsWith("<@!")) {
                        argValue = await message.client.users.fetch(argValue.slice(3, argValue.length - 1));
                    } else {
                        argValue = await message.client.users.fetch(argValue.slice(2, argValue.length - 1));
                    }
                } else {
                    argValue = null;
                }
            } else {
                if (argValue.includes("#")) {
                    let argValueArray = argValue.split("#");
                    if (argValueArray.length === 2) {
                        argValue = message.client.users.cache.find(user => user.username === argValueArray[0] && user.discriminator === argValueArray[1]);
                    } else {
                        argValue = null;
                    }
                } else {
                    if (argValue.length === 18 && argValue.match(/^\d+$/)) {
                        argValue = await message.client.users.fetch(argValue);
                    } else {
                        argValue = message.client.users.cache.find(user => user.username === argValue);
                    }
                }
            }
        } else if (argType === "channel") {
            if (argValue.startsWith("<#") && argValue.endsWith(">")) {
                if (argValue.startsWith("<#!")) {
                    argValue = await message.client.channels.fetch(argValue.slice(3, argValue.length - 1));
                } else {
                    argValue = await message.client.channels.fetch(argValue.slice(2, argValue.length - 1));
                }
            } else {
                if (argValue.length <= 0) {
                    argValue = null;
                }
            }
        } else if (argType === "role") {
            if (argValue.startsWith("<@&") && argValue.endsWith(">")) {
                if (argValue.startsWith("<@&!")) {
                    argValue = await message.client.roles.fetch(argValue.slice(3, argValue.length - 1));
                } else {
                    argValue = await message.client.roles.fetch(argValue.slice(2, argValue.length - 1));
                }
            } else {
                if (argValue.length <= 0) {
                    argValue = null;
                }
            }
        } else if (argType === "string") {
            if (argValue === null || argValue === undefined) {
                argValue = null;
            }
            else if (argValue.length <= 0) {
                argValue = null;
            }
        }
        parsedArgs[argName] = argValue;
    }
    return parsedArgs;
}