const Discord = require('discord.js')

module.exports.run = async (bot, message, args) => {
  if (!message.member.hasPermission("MANAGA_MESSAGES")) return message.reply('У вас не хватает прав') // чекаем права
  let del = args[0] // число
  if (!del) return message.reply('Укажите пожалуйста кол-во сообщений, которые вы хотите удалить')

  if(del < 1) return send('Укажите пожалуйста кол-во сообщений больше 1')

  if(del > 100) return send('Укажите пожалуйста кол-во сообщений меньше 100')
 
  await message.channel.bulkDelete(del) // удаляем число сообщений
  send(`Удалено __**${del}**__ сообщений`)

}

module.exports.help = {
  names: ['clear']
}