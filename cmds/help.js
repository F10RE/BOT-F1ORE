const Discord = module.require("discord.js");
const fs = require("fs");

module.exports.run = async (bot, message, args) => {
    let commandList = [ ...bot.commands.keys()];
    message.channel.send(`Список команд: ${commandList.join('\r\n')}`);
};
module.exports.help = {
    names: ["help"]
};