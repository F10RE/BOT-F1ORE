const Discord = require('discord.js')
const queueManager = require('../queueManager')
const { now } = require('moment')

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
        if (args.length > 1) channel = message.guild.channels.cache.find(channel => channel.name.toLowerCase() == args.slice(1).join(' ').toLowerCase() && channel.type == 'voice')
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
                    >`!songs enable (канал)` — создаёт очередь и включает заказы. Если не указан канал — присоединяется к голосовому каналу пользователя, вызвавшего команду \n\
                    >`!songs disable` — наоборот, выключает заказы треков')
            .addField('Команды взаимодействия с очередью', '>`!songs add (трек)` — добавляет указанный трек в очередь. Трек может представлять собой ссылку на YouTube, ID видео или поисковой запрос. Длина трека должна быть больше 25 секунд и меньше 1 часа\n\
                    >`!songs now` — выводит текущий трек\n\
                    >`!songs upnext` — выводит первые 5 треков в плейлисте')
            .addField('Команды управления очередью', 'Данные команды могут быть вызваны только DJ этого сервера\n\
                    >`!songs skip` — пропускает текущий трек, убирая его из воспроизведения. Может быть вызвана человеком, который трек заказал\n\
                    >`!songs remove (номер)` — убирает трек с указанным номером из очереди. Номер должен быть больше нуля и меньше длины очереди\n\
                    >`!songs promote (номер) (целевая позиция)` — поднимает трек под номером номер на целевую позицию. Если целевая позиция не указана, поднимает его на первое место. Номер и целевая позиция должны быть больше нуля и меньше длины очереди')
            .addField('Команды управления воспроизведением', 'Данные команды могут быть вызваны только DJ этого сервера\n\
                    >`!songs volume (громкость)` — изменяет громкость текущего трека. Число может начинаться с "+" или "-", в этом случае громкость изменится на это число (Например `!songs volume -10` уменьшит громкость на 10%, когда `!songs volume 10` поставит громкость на 10%).\n\
                    Примечание: нажав ПКМ (или подержав нажатие с телефонов) на боте, вы сможете изменить его громкость только для себя.\n\
                    >`!songs pause` — ставит воспроизведение на паузу\n\
                    >`!songs resume` — возобновляет воспроизведение')
        return message.channel.send(help)
    }
    if (!queue) return message.channel.send("Очередь не найдена. Создать её можно при помощи `!songs enable`")
    if (!queue.connection) return message.channel.send("Я не вижу как такое может произойти")

    let nowplaying = queue.get(0)
    let reply = new Discord.MessageEmbed()

    if (args[0] == 'add') message.channel.send(await addSong(message.author, queue, args))
    if (args[0] == 'skip') message.channel.send(skipSong(message.author, DJ, queue))
    if (args[0] == 'remove') message.channel.send(removeSong(message.author, DJ, queue, parseInt(args[1])))
    if (args[0] == 'promote') message.channel.send(moveSong(message.author, DJ, queue, parseInt(args[1]), parseInt(args[2])))

    if (args[0] == 'upnext') message.channel.send(listQueue(message.author, queue))
    if (args[0] == 'now') message.channel.send(listSongAt(message.author, queue))

    if (args[0] == 'play' || args[0] == 'pause') message.channel.send(setPlayPause(message.author, DJ, queue, args[0] == "play"))
    if (args[0] == 'volume') message.channel.send(changeVolume(message.author, DJ, queue, args))
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
 * Возвращает true если value — целое число в пределах min и max
 * @param {Number} value 
 * @param {Number} min 
 * @param {Number} max 
 */
function inRangeInt(value, min, max) { return parseInt(value) && parseInt(value) > min && parseInt(value) < max }

async function addSong(user, queue, query) {
    let response = await queue.add(query.slice(1).join(' '), user)
    if (typeof response == "number") {
		let reply = new Discord.MessageEmbed()
			.setTitle("An error has occured")
			.setColor(0xde2002)
		let errorCause = {title: "It was some other, unexpected error", subtitle: "Thus we can't provide much info on the error"}
		switch(response) {
			case -1: 
				errorCause.title = "We weren't able to find the video"
				errorCause.subtitle = "Try a different search term or check your tokens" // Лучше так не делать но говорить правильно я точно не умею
				break
			case -2:
				errorCause.title = "YouTube info library had a stroke"
				errorCause.subtitle = "We're sorry about that, yet the situation is out of our control"
				break
			case -3:
				errorCause.title = "The requested video was too long. Or too short"
				errorCause.subtitle = "Try looking for a shorter one"
				break
		}
		reply.addField(errorCause.title, errorCause.subtitle)
		return reply
	}
    let queuePosition = `Номер в очереди — ${response.meta.position}`
    if (response.meta.position == 0) { queuePosition = "Трек играет прямо сейчас" }
    reply = new Discord.MessageEmbed()
        .setTitle(response.meta.title)
        .setURL(response.meta.url)
        .setAuthor(user.tag, user.avatarURL({ size: 256 }))
        .addField(response.meta.author, `Длиной ${response.meta.formattedLength}`, true)
        .addField(queuePosition, '\u200B')
        .setThumbnail(`https://i.ytimg.com/vi/${response.id}/hqdefault.jpg`)
        .setColor(0x21c91e)
    return reply
}

/**
 * 
 * @param {Discord.User} user 
 * @param {Boolean} isDJ 
 * @param {queueManager.queueGuild} queue 
 * @param {number} position
 */
function removeSong(user, isDJ, queue, position) {
    if (!isDJ) return `<@${user.id}> Вы должны быть DJ, чтобы удалять треки.`
    if (!position) return `<@${user.id}> Укажите валидный номер трека.`
    if (!inRangeInt(position, 0, queue.queue.length)) return message.reply(new Discord.MessageAttachment().setFile('https://i.imgflip.com/46mc5l.jpg'))
    let removed = queue.remove(position)
    let reply = new Discord.MessageEmbed()
        .setTitle('Удалено')
        .addField(`${removed.meta.author} — ${removed.meta.title}`, `С позиции ${position}`)
        .addField(`Оригинально трек заказал`, `${removed.user.tag}`)
        .setColor(0xde2002)
    return reply
}

/**
 * 
 * @param {Discord.User} user 
 * @param {Boolean} isDJ 
 * @param {queueManager.queueGuild} queue 
 */
function skipSong(user, isDJ, queue) {
    let nowplaying = queue.get(0)
    if (isDJ || nowplaying.song.user.id == user.id) {
        let something = queue.skip()
        if (!something) { return message.reply('Нечего скипать. Плейлист пуст.') }
        let reply = new Discord.MessageEmbed()
            .setTitle("Скип")
            .setAuthor(user.tag, user.avatarURL({ size: 256 }))
            .addField(something.meta.title, something.meta.author)
            .setThumbnail(`https://i.ytimg.com/vi/${something.id}/hqdefault.jpg`)
            .setColor(0xde2002)
        return reply
    }
    return `<@${user.id}> Вы должны являться DJ или быть автором заказа, чтобы скипать.`
}

/**
 * 
 * @param {Discord.User} user 
 * @param {queueManager.queueGuild} queue 
 */
function listQueue(user, queue) {
    let list = queue.list(1)
    if (list.length == 0) return `<@${user.id}> Плейлист пуст. Вы можете добавить треки при помощи \`!songs add\``
    let nextUp = "После этого трека вас ждёт:"
    let playlist = new Discord.MessageEmbed()
        .setTitle(nextUp)
        .setDescription('Вы можете дополнить плейлист, используя `!songs add`')
        .setColor(0x429ef5)
    let fields = []
    let index = 0
    list.forEach((song) => {
        index += 1
        fields.push({ name: `#${index} ${song.meta.author} — ${song.meta.title}`, value: `Заказал ${song.user.tag}` })
    })
    playlist.addFields(fields)
    return playlist
}

/**
 * 
 * @param {Discord.User} user 
 * @param {queueManager.queueGuild} queue 
 * @param {number} position
 */
function listSongAt(user, queue, position = 1) {
    let nowplaying = queue.get(position)
    if (!nowplaying.song) return `<@${user.id}> Ничего. Абсолютно ничего.`
    let reply = new Discord.MessageEmbed()
        .setTitle(nowplaying.song.meta.title)
        .setURL(nowplaying.song.meta.url)
        .setThumbnail(`https://i.ytimg.com/vi/${nowplaying.song.id}/hqdefault.jpg`)
        .addFields(
            { name: nowplaying.song.meta.author, value: `Длиной ${nowplaying.song.meta.formattedLength}` },
            { name: "Заказал", value: nowplaying.song.user.tag }
        )
        .setColor(0x429ef5)
    return reply
}

/**
 * 
 * @param {Discord.User} user 
 * @param {boolean} isDJ
 * @param {queueManager.queueGuild} queue 
 * @param {number} position
 * @param {number} target
 */
function moveSong(user, isDJ, queue, position, target) {
    if (!isDJ) return `<@${user.id}> вы должны быть DJ, чтобы передвигать заказанные треки`
    if (!inRangeInt(position, 0, queue.queue.length)) return `<@${user.id}> Укажите валидный индекс трека`
    if (!inRangeInt(target, 0, queue.queue.length)) target = 1
    let moved = queue.move(position, target)
    let reply = new Discord.MessageEmbed()
        .setTitle("Подвинуто")
        .addField(`${moved.meta.author} — ${moved.meta.title}`, `С позиции ${position} на ${target}`)
        .addField(`Оригинально трек заказал`, `${moved.user.tag}`)
        .setColor(0x21c91e)
    return reply
}

/**
 * 
 * @param {Discord.User} user 
 * @param {boolean} isDJ 
 * @param {queueManager.queueGuild} queue 
 * @param {Array<string>} query 
 */
function changeVolume(user, isDJ, queue, query) {
    if (!isDJ) return `<@${user.id}> Вы должны быть DJ, чтобы менять громкость воспроизведения. *Однако вы можете изменить громкость воспроизведения только для себя, сделав правый клик по боту в голосовом канале*`
    let nowplaying = queue.get(0)
    if (!nowplaying.dispatch) return `<@${user.id}> Диспетчер воспроизведения не найден. Вы уверены что заказы включены?`
    let volume = nowplaying.dispatch.volume * 100
    if (!query[1] || typeof parseFloat(query[1]) == "undefined") return `<@${user.id}> Текущая громкость: ${volume.toFixed(2)}%`
    if (query[1].startsWith('+') || query[1].startsWith('-')) {
        nowplaying.dispatch.setVolume(clamp(volume + parseFloat(query[1]), 0, 150) / 100)
        return `<@${user.id}> Громкость изменена с ${volume.toFixed(2)}% на ${(nowplaying.dispatch.volume * 100).toFixed(2)}%`
    }
    nowplaying.dispatch.setVolume(clamp(parseFloat(query[1]), 0, 150) / 100)
    return `<@${user.id}> Громкость изменена с ${volume.toFixed(2)}% на ${(nowplaying.dispatch.volume * 100).toFixed(2)}%`

}

/**
 * 
 * @param {Discord.User} user 
 * @param {Boolean} isDJ 
 * @param {queueManager.queueGuild} queue 
 * @param {Boolean} playing true если снять паузу, иначе false
 */
function setPlayPause(user, isDJ, queue, playing) {
    if (!isDJ) return `<@${user.id}> Вы должны быть DJ, чтобы приостанавливать/воспроизводить трансляции.`
    let nowplaying = queue.get(0)
    if (!nowplaying.song || !nowplaying.dispatch) return `<@${user.id}> диспетчер воспроизведения не найден или сейчас ничего не играет.`
    let state = nowplaying.dispatch.paused ? "на паузе" : "воспроизводится"
    if (playing == !nowplaying.dispatch.paused) return `${user.username} Успешно поменял состояние трека с "**${state}**" на "**${state}**"`
    if (playing) { nowplaying.dispatch.resume() } else { nowplaying.dispatch.pause() }
    return `Трек ${nowplaying.song.meta.title} теперь ${nowplaying.dispatch.paused ? "на паузе" : "воспроизводится"}`
}

module.exports.help = {
    names: ['songs', 'song', 's'],
    description: "Используйте `!songs help`"
}

/**
 * 
 * @param {Discord.Message} message 
 */
module.exports.addSong = async (message) => {
    let queue = queueManager.getQueue(message.guild.id)
    if (!queue) return `@${message.author.username} Очередь заказов не найдена`
    return await addSong(message.author, queue, message.content.split(' '))
}

/**
 * 
 * @param {Discord.Message} message 
 */
module.exports.skipSong = (message) => {
    let queue = queueManager.getQueue(message.guild.id)
    if (!queue) return `@${message.author.username} Очередь заказов не найдена`
    let DJ = message.member.permissions.any(['MOVE_MEMBERS', 'ADMINISTRATOR', 'DEAFEN_MEMBERS']) || message.member.roles.cache.find(role => role.name == "DJ")
    return skipSong(message.author, DJ, queue)
}