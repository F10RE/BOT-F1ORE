const Discord = require('discord.js')

/**
 * @param {Discord.Client} bot
 * @param {Discord.Message} message
 */
module.exports.run = async (bot, message, args) => {
    let member = message.guild.member(message.mentions.users.first() || message.guild.members.find(m => m.user.username == args[0] || m.id == args[0])) // участник
    if (!message.member.hasPermission("BAN_MEMBERS")) return message.channel.send('Недостаточно прав для использования команды!') // смотрим есть ли у участника права на бан
    else if (!message.guild.me.hasPermission("KICK_MEMBERS")) return message.channel.send('У меня недостаточно прав!') // если у него тоже такие права есть то не сможет бот забанить
    
    let reason = args.slice(1).join(' ') || 'Не указана' // причина
    await member.ban(reason) // баним

    let embed = new Discord.MessageEmbed()
        .setTitle('Бан', true)
        .addField('Модератор', `${message.author.tag}`, true)
        .addField('Пользователь', `${member.user.tag}`, true)
        .addField('Причина', `${reason}`, true)
        .setTimestamp()
        .setColor(0xDE2E0B)
    await message.channel.send(embed)

}

module.exports.help = {
    names: ['ban']
}