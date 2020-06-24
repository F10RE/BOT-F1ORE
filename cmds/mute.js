const Discord = require('discord.js');
const ms = require('ms');

module.exports.run = async (bot, message, args) => {
    if (!message.member.hasPermission("MANAGE_ROLES")) return message.channel.send('Недостаточно права для использования команды!')

    let member = message.guild.member(message.mentions.users.first() || message.guild.members.find(m => m.user.username == args[0] || m.id == args[0]))

    if (!member) return message.channel.send('Укажите пожалуйста участника')
    if (member.hasPermission("MANAGE_ROLES")) return message.channel.send('Я не могу замутить этого пользователя')

    let muterole = message.guild.roles.find(r => r.name == 'Muted')
    if (!muterole) muterole = await message.guild.createRole({
        name: 'Muted',
        color: 0x607d8d
    })
    let reason = args.slice(1).join(' ') || 'Не указана'
    if (!member.roles.has(muterole.id)) return message.channel.send('Пользователь уже замучен')

    await member.addRole(muterole.id)

    let embed = new Discord.RichEmbed()
    .setTitle('Мут', true)
    .addField('Модератор', `${message.author.tag}`, true)
    .addField('Пользователь', `${member}`, true)
    .addField('Причина', `${reason}`, true)
    message.channel.send(embed)
  
    setTimeout(function(){
      member.removeRole(muterole.id)
      message.channel.send(`${member.user.tag}|${member.user.id} has been unmuted after being in mute for ${ms(ms(mutetime))}`)
    }, ms(mutetime))
}

module.exports.help = {
    name: 'mute'
}