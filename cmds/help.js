const Discord = require("discord.js");
const pfx = require('../f1oreconfig.json').prefix

var commandList = [];

/**
 * @param {Discord.Client} bot
 * @param {Discord.Message} message
 * @param {Array} args
 */
module.exports.run = async (bot, message, args) => {
    if (commandList.length == 0) {
        let last = ""
        for(const command of bot.commands.values()) {
            if(command.help.description && last != command.help.description){
                commandList.push({name: command.help.names.join(', '), value: command.help.description})
                last = command.help.description
            }
        }
    }
    let list = new Discord.MessageEmbed()
        .setTitle("Список команд")
        .setDescription(`Каждая команда имеет префикс ${pfx}`)
        .addFields(commandList)
    message.channel.send(list);
};
module.exports.help = {
    names: ["help"],
    description: ':flag_white: выводит этот список'
};