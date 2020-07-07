const Discord = require('discord.js')
const requestSong = require('./songs').addSong

/**
* @param {Discord.Client} bot
* @param {Discord.Message} message
*/
module.exports.run = async (bot, message, args) => {
    message.channel.send(await requestSong(message))
}

module.exports.help = {
    names: ['songrequest', 'sr', 'ык'],
    description: "Сокращение к `!songs add`"
}