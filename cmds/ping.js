const Discord = module.require("discord.js");
const fs = require("fs");

/**
 * @param {Discord.Client} bot
 * @param {Discord.Message} message
 */
module.exports.run = async (bot, message, args) => {
    message.channel.send('Pong!');
};
module.exports.help = {
    names: ["ping", "зштп"],
    description: '!ping (!зштп) -- Понг'
};