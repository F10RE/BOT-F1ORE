const {Client, Message} = require('discord.js') // чтобы @param-ам было легче
const {MessageEmbed} = require('discord.js') //Для создания встроенного сообщения      //Крипер, читай комменты, специально для тебя весь код и комменты писал
// const strftime = require('strftime') //Подключение strftime к файлу                    //Если ты читаешь это не с моего "тыка" - проверь пожалуйста код, мало-ли я накосячил где-то
const moment = require('moment'); // юзаем moment -- он может больше. В РАЗЫ

// я чаще всего понимаю как работает код. лучше комментируй какие-либо "нагромождения".
// ну или так, мне не сильно принципиально

/**
 * @param {Client} bot
 * @param {Message} message
 */
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

    moment.locale('ru')
    let registerUptime = moment(message.createdTimestamp).to(argsUser.createdTimestamp)
    let joinUptime = moment(message.createdTimestamp).to(message.guild.member(argsUser).joinedTimestamp)
    // moment() --> создаёт объект момента из текущего(почти) времени, с которым мы работаем.
    // moment().to() --> текстовая разница между сейчас и точкой в прошлом. moment.from() -- наоборот, между сейчас и точкой в будущем
    // moment().locale() --> ставит язык на русский
    // moment().format() --> почти как strftime, но немного другие переменные. см больше: https://momentjs.com/docs/#/displaying/format/

    let embed = new MessageEmbed()
        .setTitle(argsUser.username)
        .setDescription(game)
        .addField('Дата регистрации', `${moment(argsUser.createdTimestamp).format('D.MM.YYYY HH:mm')}\n(${registerUptime})`, true)
        .addField('Дата вступления', `${moment(message.guild.member(argsUser).joinedTimestamp).format('D.MM.YYYY HH:mm')}\n(${joinUptime})`, true)
        .addField('Роли', message.guild.member(argsUser).roles.cache.filter(r => r.id != message.guild.id).map(role => role.name).join(', ') || 'Не имеет')
        .setColor(message.guild.member(argsUser).displayHexColor) //Если у роли нет цвета, то будет отображаться чёрный
        .setTimestamp()
        .setThumbnail(message.author.avatarURL({ size: 256 }))
        .setFooter(`ID: ${argsUser.id}`)
    // ты был близок, от тебя требовалось увидеть `message.author.avatarURL({ size: 256 })` и скопировать его в .setThumbnail
    await message.channel.send(embed)
}

module.exports.help = {
    names: ["uinfo"]
};