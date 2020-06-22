const Discord = module.require("discord.js");
const fs = require("fs");

var commandList = [];

module.exports.run = async (bot, message, args) => {
    if (commandList.length == 0) {
        for (const command of bot.commands.values()) {
            if(command.help.description != commandList[Math.max(0, commandList.length - 1)]){
                commandList.push(command.help.description);
            }
        }
    }
    message.channel.send(`Список команд: ${commandList.join('\r\n')}`);
};
module.exports.help = {
    names: ["help"],
    description: '!help -- :flag_white: выводит этот список'
};