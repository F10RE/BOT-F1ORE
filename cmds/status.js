const Discord = require("discord.js");
const fs = require("fs");

/**
 * @param {Discord.Client} bot
 * @param {Discord.Message} message
 */
module.exports.run = async (bot, message, args) => {
    message.channel.send('Я работаю!))');
};
module.exports.help = {
    names: ["."]
};