const Discord = module.require("discord.js");
const fs = require("fs");
module.exports.run = async (bot, message,args) => {
    message.channel.send('Список команд: ping, привет, .');
};
module.exports.help = {
    name: "help"
};