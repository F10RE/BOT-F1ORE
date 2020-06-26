const {MessageEmbed} = require('discord.js') //Для создания встроенного сообщения      //Крипер, читай комменты, специально для тебя весь код и комменты писал
const strftime = require('strftime') //Подключение strftime к файлу                    //Если ты читаешь это не с моего "тыка" - проверь пожалуйста код, мало-ли я накосячил где-то

module.exports.run = async (bot, message, args) => {
    let member = message.guild.member(message.mentions.users.first() || message.guild.members.fetch(args[0]))
    let argsUser
    if (member) argsUser = member.user
    else argsUser = message.author

    let statuses = {        //Обьект статусов
        online: 'В сети',
        idle: 'Нет на месте',
        dnd: 'Не беспокоить',
        offline: 'Не в сети'
    }
    let game
    if (!argsUser.presence.game) game = `Имеет статус: **${statuses[argsUser.presence.status]}**` //Если нет статуса игры, будет отображён статус активности
    else if (argsUser.presence.game.type == 0) game = `Играет в **${argsUser.presence.game.name}**` //Если участник имеет статус "Играет в ..."
    else if (argsUser.presence.game.type == 1) game = `Стримит [**${argsUser.presence.game.name}**](${argsUser.presence.game.url})` //Если участник имеет статус "Стримит ..."
    else if (argsUser.presence.game.type == 2) game = `Слушает **${argsUser.presence.game.name}**` //Если участник имеет статус "Слушает ..."
    else if (argsUser.presence.game.type == 3) game = `Смотрит **${argsUser.presence.game.name}**` //Если участник имеет статус "Смотрит ..."

    let day = 1000 * 60 * 60 * 24   //Один день = 86 400 000 миллисикунд (если не знал)
    let date1 = new Date(message.createdTimestamp) //Дата отправки командного сообщения
    let date2 = new Date(argsUser.createdTimestamp) //Дата регистрации аккаунта
    let date3 = new Date(message.guild.member(argsUser).joinedTimestamp) //Дата вступления на сервер
    let diff1 = Math.round(Math.abs((date1.getTime() - date2.getTime()) / day)) //Кол-во прошедших дней с момента регистрации
    let diff2 = Math.round(Math.abs((date1.getTime() - date3.getTime()) / day)) //Кол-во прошедших дней с момента всупления на сервер

    let embed = new MessageEmbed()
        .setTitle(argsUser.username)
        .setDescription(game)
        .addField('Дата регистрации', `${strftime('%d.%m.%Y в %H:%M', new Date(argsUser.createdTimestamp))}\n(${diff1} дн. назад)`, true)
        .addField('Дата вступления', `${strftime('%d.%m.%Y в %H:%M', new Date(message.guild.member(argsUser).joinedTimestamp))}\n(${diff2} дн. назад)`, true)
        .addField('Роли', message.guild.member(argsUser).roles.cache.filter(r => r.id != message.guild.id).map(role => role.name).join(', ') || 'Не имеет')
        .setColor(message.guild.member(argsUser).displayHexColor) //Если у роли нет цвета, то будет отображаться чёрный
        .setTimestamp()
        .setAuthor(message.author.tag, message.author.avatarURL({ size: 256 }))
        .setFooter(`ID: ${argsUser.id}`)
    await message.channel.send(embed)
}

module.exports.help = {
    names: ["userinfo"]
};