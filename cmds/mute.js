const Discord = require('discord.js');
const ms = require('ms');

/**
 * @param {Discord.Client} bot
 * @param {Discord.Message} message
 */
module.exports.run = async (bot, message, args) => {
    if (!message.member.hasPermission("MANAGE_ROLES")) return message.channel.send('Недостаточно права для использования команды!')

    let member = message.guild.member(message.mentions.users.first() || message.guild.members.find(m => m.user.username == args[0] || m.id == args[0]))

    if (!member) return message.channel.send('Пожалуйста, укажите участника')
    if (member.hasPermission("MANAGE_ROLES")) return message.channel.send('Я не могу замутить этого пользователя, он слишком силён')
    if (member == message.member) return message.channel.send('Извини, не могу. Рука не поднимается')

    let mutetime = args.pop(1) || '15s';
    let muterole = await message.guild.roles.fetch(r => r.name == 'Muted')
    if (!muterole) muterole = await message.guild.roles.create({
        data: {
            name: 'Muted',
            color: 0x607d8d
        }
    })
    console.log(muterole);
    let reason = args.slice(2).join(' ') || 'Не указана';
    if (member.roles.cache.has(muterole.id)) return message.channel.send('Пользователь уже замучен, дайте ему перерыв')
    await member.roles.add(muterole)

    let embed = new Discord.MessageEmbed()
        .setTitle('Мут', true)
        .addField('Модератор', `${message.author.tag}`, true)
        .addField('Пользователь', `${member}`, true)
        .addField('Причина', `${reason}`, true)
    message.channel.send(embed)

    setTimeout(function () {
        member.roles.remove(muterole.id)
        message.channel.send(`${member.user.tag}|${member.user.id} был размучен спустя ${ms(ms(mutetime))} молчания`)
    }, ms(mutetime))
}

module.exports.help = {
    names: ['mute']
}