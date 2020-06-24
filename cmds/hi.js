const Discord = module.require("discord.js");
const fs = require("fs");
module.exports.run = async (bot, message, args) => {
    message.channel.send(`Приветик, ${message.author.username}!))`);
};
module.exports.help = {
    names: ["привет", "hi"],
    description: '!привет (!hi) -- :wave: и тебе привет'
};