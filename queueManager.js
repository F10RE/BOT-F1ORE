const Discord = require('discord.js')
const ytdl = require('ytdl-core')
const ytsearch = require('youtube-api-v3-search')
const moment = require('moment')
const { validateID, validateURL } = require('ytdl-core')
const youtubeKey = require('./f1oreconfig.json').youtube_api_v3

var qs = new Map()

class QueueGuild {
    /**
     * 
     * @param {Discord.Guild} guild 
     * @param {Discord.VoiceChannel} voiceChannel 
     */
    constructor(guild, voiceChannel) {
        this.queue = []
        voiceChannel.join()
            .then(VoiceConnection => this.connection = VoiceConnection)
            .catch((reason) => console.error(reason))
        console.log(`Подключился к каналу ${voiceChannel.name}`)
        this.volume = 0.75
    }

    async add(id, requester) {
        if (!(validateID(id) || validateURL(id))) {
            try {
                let result = await ytsearch(youtubeKey, { q: id, part: 'snippet', type: 'video' })
                if (!result.items[0]) return -1
                id = result.items[0].id.videoId
            } catch (err) {
                console.error(err)
                // id = 'dQw4w9WgXcQ'
				return -1
				// TODO: Авокадный репорт об ошибке
            }
        }
        let video = await ytdl.getInfo(ytdl.getVideoID(id))
			.then(info => info.videoDetails)
			.catch(e => {
				console.error(e)
				return -2
			})
        if (typeof response == "number") { return video }
		let videoLength = parseInt(video.lengthSeconds)
        if (videoLength > 3600 || videoLength < 25) {
            return -3
        }
        let position = this.queue.length
        let duration = moment.duration(videoLength, 'seconds')
        let formattedLength = `${duration.minutes()}:${duration.seconds().toString().padStart(2, '0')}`
        let videoData = {
            id: video.videoId,
            meta: {
                title: video.title,
                url: video.video_url,
                author: video.author.name,
                length: videoLength,
                formattedLength: formattedLength,
                position: position
            },
            user: requester
        }
        this.queue.push(videoData)
        if (this.queue.length == 1) this.play()
        return videoData
    }

    remove(position) {
        return this.queue.pop(position)
    }

    skip() {
        if (this.queue.length == 0) {
            return false
        }
        let skipped = this.queue[0]
        this.dispatcher.emit('finish')
        return skipped
    }

    list(rFrom, amount = 5) {
        return this.queue.slice(rFrom, rFrom + amount)
    }

    move(elementID, toPos = 1){
        let element = this.queue.pop(elementID)
        this.queue.splice(toPos, 0, element)
        return element
    }

    get(position) {
        return { song: this.queue[position], dispatch: this.dispatcher }
    }

    async play() {
        if (this.queue.length == 0) {
            console.log('No songs left to play')
            return
        }
        let videoStream = ytdl(this.queue[0].id, { filter: 'audioonly', highWaterMark: 1 << 25 })
        /** @type {Discord.StreamDispatcher} */
        this.dispatcher = this.connection.play(videoStream, { volume: this.volume })
        this.dispatcher.on('finish', () => {
            this.queue.shift()
            this.play()
        })
        this.dispatcher.on('volumeChange', (oldVolume, newVolume) => {this.volume = newVolume}) // чтобы громкость оставалась между треками
    }

    disconnect() {
        this.connection.disconnect()
    }
}

module.exports.getQueue = (guildID) => {
    /** @type {QueueGuild} */
    let queue = qs.get(guildID)
    return queue
}

module.exports.newQueue = (guild, voiceChannel) => {
    let queue = new QueueGuild(guild, voiceChannel)
    qs.set(guild.id, queue)
    return queue
}

module.exports.removeQueue = (guildID) => {
    /** @type {QueueGuild} */
    let queue = qs.get(guildID)
    if (!queue) {
        return false
    }
    queue.disconnect()
    qs.delete(guildID)
    return true
}

module.exports.qs = qs
module.exports.queueGuild = QueueGuild.prototype