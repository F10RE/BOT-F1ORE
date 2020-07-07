const Discord = require('discord.js')

module.exports.run = async (bot, message, args) => {
    let member = message.guild.member(message.mentions.users.first() || message.guild.members.find(m => m.user.username == args[0] || m.id == args[0])) // участник
    if (!message.member.hasPermission("KICK_MEMBERS")) return message.channel.send('Недостаточно прав для использования команды!') // чек прав
    else if (!message.guild.me.hasPermission("KICK_MEMBERS")) return message.channel.send('У меня недостаточно прав!') // чек прав у участника

    let reason = args.slice(1).join(' ') || 'Не указана' // причина
    await member.kick(reason) // кик
  
    let embed = new Discord.MessageEmbed()
    .setTitle('Кик', true)
    .addField('Модератор', `${message.author.tag}`)
    .addField('Пользователь', `${member.user.tag}`)
    .addField('Причина', `${reason}`)
    .setTimestamp()
    message.channel.send(embed)
}

module.exports.help = {
    names: ['kick']
}