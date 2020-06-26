const Discord = require('discord.js')

/**
 * @param {Discord.Client} bot
 * @param {Discord.Message} message
 */
module.exports.run = async (bot, message, args) => {
    if (!message.member.hasPermission("MANAGE_MESSAGES")) return message.reply('У вас не хватает прав') // чекаем права
    let del = args[0] // число
    if (!del) return message.reply('Укажите пожалуйста кол-во сообщений, которые вы хотите удалить')
    
    if (del < 1 || del > 100) return message.reply('Укажите пожалуйста кол-во сообщений в пределах 1 и 100')

    await message.channel.bulkDelete(del) // удаляем число сообщений
    // console.log(`Удалено __**${del}**__ сообщений`)
}

module.exports.help = {
    names: ['clear']
}