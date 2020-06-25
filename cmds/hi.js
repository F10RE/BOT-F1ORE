const Discord = require("discord.js");
const fs = require("fs");
/**
 * @param {Discord.Client} bot
 * @param {Discord.Message} message
 */
module.exports.run = async (bot, message, args) => {
    message.channel.send(`Приветик, ${message.author.username}!))`);
};
module.exports.help = {
    names: ["привет", "hi"],
    description: '!привет (!hi) -- :wave: и тебе привет'
};