const Discord = require('discord.js')
const skipSong = require('./songs').skipSong

/**
* @param {Discord.Client} bot
* @param {Discord.Message} message
*/
module.exports.run = async (bot, message, args) => {
    message.channel.send(skipSong(message))
}

module.exports.help = {
    names: ['skip', 'скип'],
    description: "Сокращение к `!songs skip`"
}