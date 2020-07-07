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
    let embed = new MessageEmbed()

    moment.locale('ru')
    let activityLocalized = {
        "PLAYING": "Играет",
        "STREAMING": "Стримит",
        "LISTENING": "Слушоеть",
        "WATCHING": "Смотрит"
    }
    argsUser.presence.activities.forEach(activity =>{
        if (activity.type == "CUSTOM_STATUS"){
            embed.setDescription(`Статус: ${activity.state}`)
            return
        }
        let game = {name: "", value: []}
        game.name = activityLocalized[activity.type]
        game.value.push(`**${activity.name}**`)
        if(activity.details) game.value.push(activity.details)
        if(activity.state) game.value.push(`*${activity.state}*`)
        if(activity.timestamps.start){
            let duration = moment().diff(activity.timestamps.start)
            duration = moment.utc(duration).format("HH:mm:ss").replace('/^00:/g', '')
            game.value.push(`В течение ${duration}`)
        }
        embed.addFields(game)
    })
    
    let registerUptime = moment(message.createdTimestamp).to(argsUser.createdTimestamp)
    let joinUptime = moment(message.createdTimestamp).to(message.guild.member(argsUser).joinedTimestamp)
    // moment() --> создаёт объект момента из текущего(почти) времени, с которым мы работаем.
    // moment().to() --> текстовая разница между сейчас и точкой в прошлом. moment.from() -- наоборот, между сейчас и точкой в будущем
    // moment().locale() --> ставит язык на русский
    // moment().format() --> почти как strftime, но немного другие переменные. см больше: https://momentjs.com/docs/#/displaying/format/

    embed.setTitle(argsUser.username)
        .addField('Дата регистрации', `${moment(argsUser.createdTimestamp).format('D.MM.YYYY HH:mm')}\n(${registerUptime})`, true)
        .addField('Дата вступления', `${moment(message.guild.member(argsUser).joinedTimestamp).format('D.MM.YYYY HH:mm')}\n(${joinUptime})`, true)
        .addField('Роли', message.guild.member(argsUser).roles.cache.filter(r => r.id != message.guild.id).map(role => role.name).join(', ') || 'Не имеет')
        .setColor(message.guild.member(argsUser).displayHexColor) //Если у роли нет цвета, то будет отображаться чёрный
        .setTimestamp()
        .setThumbnail(message.author.avatarURL({ size: 256 }))
        .setFooter(`ID: ${argsUser.id}`)
    // ты был близок, от тебя требовалось увидеть `message.author.avatarURL({ size: 256 })` и скопировать его в .setThumbnail
    message.channel.send(embed)
}

module.exports.help = {
    names: ["uinfo"],
    description: "Выводит информацию о пользователе — его статус, дата вступления на сервер и проч. Если пользователь не указан, выводит информацию про вас."
};