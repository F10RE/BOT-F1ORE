const Discord = require('discord.js')
const queueManager = require('../queueManager')

/**
* @param {Discord.Client} bot
* @param {Discord.Message} message
*/
module.exports.run = async (bot, message, args) => {
    var queue = queueManager.getQueue(message.guild.id)
    if (args.length == 0) {
        return message.channel.send('Используйте `!songs help` для списка команд')
    }
    let DJ = message.member.permissions.any(['MOVE_MEMBERS', 'ADMINISTRATOR', 'DEAFEN_MEMBERS']) || message.member.roles.cache.find(role => role.name == "DJ")
    if (args[0] == "enable" && DJ) {
        if (queue) return message.channel.send("Уже включены")
        let channel = message.member.voice.channel
        if (args.length > 1) channel = message.guild.channels.cache.find(channel => channel.name.toLowerCase() == args.splice(1).join(' ').toLowerCase() && channel.type == 'voice')
        if (!channel) return message.reply("Канал не найден. Вы или не подключены к голосовому каналу или опечатались")
        var queue = queueManager.newQueue(message.guild, channel)
        return
    }
    if (args[0] == "disable" && DJ) {
        if (!queue) return message.channel.send("Уже выключены")
        queueManager.removeQueue(message.guild.id)
        return
    }
    if (args[0] == "help") {
        let help = new Discord.MessageEmbed().setTitle('Справка по командам !songs')
            .addField('Понятие о DJ сервера', 'DJ это специальная роль, наличие которой позволяет управлять заказами. DJ считаются те, кто\n\
                    1) имеет одно из следующих разрешений: Администратор, Перемещать участников, Отключать участникам микрофон\n\
                    2) или имеет роль с названием "DJ"')
            .addField('Включение/выключение', 'Данные команды могут быть вызваны только DJ этого сервера.\n\
                    >`!songs enable (канал)` -- создаёт очередь и включает заказы. Если не указан (канал) -- присоединяется к голосовому каналу пользователя, вызвавшего команду \n\
                    >`!songs disable` -- наоборот, выключает заказы треков')
            .addField('Команды взаимодействия с очередью', '>`!songs add (трек)` -- добавляет указанный (трек) в очередь. (Трек) может представлять собой ссылку на YouTube, ID видео или поисковой запросю Длина трека должна быть больше 25 секунд и меньше 1 часа\n\
                    >`!songs now` -- выводит текущий трек\n\
                    >`!songs upnext` -- выводит первые 5 треков в плейлисте')
            .addField('Команды управления очередью', 'Данные команды могут быть вызваны только DJ этого сервера\n\
                    >`!songs skip` -- пропускает текущий трек, убирая его из воспроизведения. Может быть вызвана человеком, который трек заказал\n\
                    >`!songs remove (номер)` -- убирает трек с указанным (номером) из очереди. (Номер) должен быть больше нуля и меньше длины очереди\n\
                    >`!songs promote (номер) (целевая позиция)` -- поднимает трек под номером (номер) на (целевую позицию). Если (целевая позиция) не указана, поднимает его на первое место. (Номер) и (целевая) должны быть больше нуля и меньше длины очереди')
            .addField('Команды управления воспроизведением', 'Данные команды могут быть вызваны только DJ этого сервера\n\
                    >`!songs volume (громкость)` -- изменяет громкость текущего трека. Число может начинаться с "+" или "-", в этом случае громкость изменится на это число (Например `!songs volume -10` уменьшит громкость на 10%, когда `!songs volume 10` поставит громкость на 10%).\n\
                    Примечание: нажав ПКМ (или подержав нажатие с телефонов) на боте, вы сможете изменить его громкость только для себя.\n\
                    >`!songs pause` -- ставит воспроизведение на паузу\n\
                    >`!songs resume` -- возобновляет воспроизведение')
        return message.channel.send(help)
    }
    if (!queue) return message.channel.send("Очередь не найдена. Создать её можно при помощи `!songs enable`")
    if (!queue.connection) return message.channel.send("Я не вижу как такое может произойти")

    let nowplaying = queue.get(0)
    let reply = new Discord.MessageEmbed()

    switch (args[0]) {
        case "add":
            let response = await queue.add(args.slice(1).join(' '), message.author)
            if (!response) return message.reply(new Discord.MessageAttachment().setFile('https://i.imgflip.com/46mc5l.jpg'))
            let queuePosition = `Номер в очереди ~~--~~ ${response.meta.position}`
            if (response.meta.position == 0) { queuePosition = "Трек играет прямо сейчас" }
            reply.setTitle(response.meta.title)
                .setURL(response.meta.url)
                .setAuthor(message.author.tag, message.author.avatarURL({ size: 256 }))
                .addField(response.meta.author, `Длиной ${response.meta.formattedLength}`, true)
                .addField(queuePosition, '\u200B')
                .setThumbnail(`https://i.ytimg.com/vi/${response.id}/hqdefault.jpg`)
                .setColor(0x21c91e)
            message.channel.send(reply)
            break;
        case 'skip':
            if (DJ || nowplaying.song.user.id == message.author.id) {
                let something = queue.skip()
                if (!something) { return message.reply('Нечего скипать. Плейлист пуст.') }
                reply.setTitle("Скип")
                    .setAuthor(message.author.tag, message.author.avatarURL({ size: 256 }))
                    .addField(something.meta.title, something.meta.author)
                    .setThumbnail(`https://i.ytimg.com/vi/${something.id}/hqdefault.jpg`)
                    .setColor(0xde2002)
            }
            break;
        case 'remove':
            if (!DJ) {
                return message.reply(new Discord.MessageAttachment().setFile('https://i.imgflip.com/46mc5l.jpg'))
            }
            if (!parseInt(args[1])) {
                return message.reply("Укажите номер трека")
            }
            if (!inRangeInt(args[1], 0, queue.queue.length)) {
                return message.reply(new Discord.MessageAttachment().setFile('https://i.imgflip.com/46mc5l.jpg'))
            }
            let removed = queue.remove(args[1])
            reply.setTitle('Удалено')
                .addField(`${removed.meta.author} -- ${removed.meta.title}`, `С позиции ${args[1]}`)
                .addField(`Оригинально трек заказал`, `${removed.user.tag}`)
                .setColor(0xde2002)
            message.channel.send(reply)
            break;
        case 'now':
            if (!nowplaying.song) { return message.reply("Ничего. Абсолютно ничего.") }
            reply.setTitle(nowplaying.song.meta.title)
                .setURL(nowplaying.song.meta.url)
                .setThumbnail(`https://i.ytimg.com/vi/${nowplaying.song.id}/hqdefault.jpg`)
                .addFields(
                    { name: nowplaying.song.meta.author, value: `Длиной ${nowplaying.song.meta.formattedLength}` },
                    { name: "Заказал", value: nowplaying.song.user.tag }
                )
                .setColor(0x429ef5)
            message.channel.send(reply)
            break;
        case 'pause':
            if (DJ) {
                let dispatch = queue.get(0).dispatch || undefined
                if (!dispatch) { return message.reply("Мне кажется, или сейчас ничего не играет?") }
                if (!dispatch.paused) { dispatch.pause() }
            }
            break;
        case 'resume':
            if (DJ) {
                let dispatch = queue.get(0).dispatch || undefined
                if (!dispatch) { return message.reply("Мне кажется, или сейчас ничего не играет?") }
                if (dispatch.paused) { dispatch.resume() }
            }
            break;
        case 'volume':
            if (!DJ) return message.reply(new Discord.MessageAttachment().setFile('https://i.imgflip.com/46mc5l.jpg'))
            if (!nowplaying.dispatch) { return message.reply('Диспетчер воспроизведения не найден. Вы уверены что заказы включены?') }
            let volume = nowplaying.dispatch.volume * 100
            if (!args[1] || typeof parseFloat(args[1]) == "undefined") { return message.reply(`Текущая громкость: ${volume.toFixed(2)}%`) }
            if (args[1].startsWith('+') || args[1].startsWith('-')) {
                nowplaying.dispatch.setVolume(clamp(volume + parseFloat(args[1]), 0, 150) / 100)
                return message.reply(`Громкость изменена с ${volume.toFixed(2)}% на ${(nowplaying.dispatch.volume * 100).toFixed(2)}%`)
            }
            nowplaying.dispatch.setVolume(clamp(parseFloat(args[1]), 0, 150) / 100)
            return message.reply(`Громкость изменена с ${volume.toFixed(2)}% на ${(nowplaying.dispatch.volume * 100).toFixed(2)}%`)
        case 'upnext':
            let list = queue.list(1)
            if (list.length == 0) return message.reply('Плейлист пуст. Вы можете его заполнить при помощи `!songs add`')
            let nextUp = "Следующи" + (list.length == 1 ? 'й ' : 'е ')
            nextUp += list.length
            let pfx = ''
            if (list.length == 5) pfx = 'ов'
            if (list.length > 1 && list.length < 5) pfx = 'а'
            nextUp += " трек" + pfx
            let playlist = new Discord.MessageEmbed()
                .setTitle(nextUp)
                .setDescription('Вы можете дополнить плейлист используя `!songs add`')
                .setColor(0x429ef5)
            let fields = []
            let index = 0
            list.forEach((song) => {
                index += 1
                fields.push({ name: `#${index} ${song.meta.author} -- ${song.meta.title}`, value: `Заказал ${song.user.tag}` })
            })
            playlist.addFields(fields)
            message.channel.send(playlist)
            break;
        case 'promote':
            if (!DJ) return message.reply(new Discord.MessageAttachment().setFile('https://i.imgflip.com/46mc5l.jpg'))
            if (!inRangeInt(args[1], 0, queue.queue.length)) return message.reply('Укажите валидный индекс')
            let target = 1
            console.log(target)
            if (inRangeInt(args[2], 0, queue.queue.length)) target = parseInt(args[2])
            let moved = queue.move(parseInt(args[1]), target)
            reply.setTitle("Подвинуто")
                .addField(`${moved.meta.author} -- ${moved.meta.title}`, `С позиции ${args[1]} на ${target}`)
                .addField(`Оригинально трек заказал`, `${moved.user.tag}`)
                .setColor(0x21c91e)
            message.channel.send(reply)
            break;
        default:
            message.reply(`Неизвестная команда \`${args[0]}\``)
            break;
    }
}

/**
 * Возвращает исходное значение или минимальное/максимальное значение, если исходное выходит за их рамки
 * @param {Number} value Исходное значение
 * @param {Number} min Минимальное значение
 * @param {Number} max Максимальное значение
 * 
 */
function clamp(value, min, max) { return Math.min(Math.max(value, min), max) }
/**
 * Возвращает true если value -- целое число в пределах min и max
 * @param {Number} value 
 * @param {Number} min 
 * @param {Number} max 
 */
function inRangeInt(value, min, max) { return parseInt(value) && parseInt(value) > min && parseInt(value) < max }

module.exports.help = {
    names: ['songs', 'song', 's']
}