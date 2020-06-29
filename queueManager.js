const Discord = require('discord.js')
const ytdl = require('ytdl-core')
const ytsearch = require('youtube-api-v3-search')
const moment = require('moment')
const { validateID, validateURL } = require('ytdl-core')
const youtubeKey = require('./f1oreconfig.json').youtube_api_v3

var qs = new Map()

class queueGuild {
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
    }

    async add(id, requester) {
        if (!(validateID(id) || validateURL(id))) {
            try {
                let result = await ytsearch(youtubeKey, { q: id, part: 'snippet', type: 'video' })
                if (!result.items[0]) return null
                id = result.items[0].id.videoId
            } catch (err) {
                console.error(err)
                id = 'dQw4w9WgXcQ'
            }
        }
        let video = await ytdl.getInfo(ytdl.getVideoID(id))
        if (video.length_seconds > 3600 || video.length_seconds < 25) {
            return null
        }
        let position = this.queue.length
        let duration = moment.duration(video.length_seconds, 'seconds')
        let length = `${duration.minutes()}:${duration.seconds().toString().padStart(2, '0')}`
        let videoData = {
            id: video.video_id,
            meta: {
                title: video.title,
                url: video.video_url,
                author: video.author.name,
                length: video.length_seconds,
                formattedLength: length,
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
        this.dispatcher = this.connection.play(videoStream, { volume: 0.75 })
        this.dispatcher.on('finish', () => {
            this.queue.shift()
            this.play()
        })
    }

    disconnect() {
        this.connection.disconnect()
    }
}

module.exports.getQueue = (guildID) => {
    /** @type {queueGuild} */
    let queue = qs.get(guildID)
    return queue
}

module.exports.newQueue = (guild, voiceChannel) => {
    let queue = new queueGuild(guild, voiceChannel)
    qs.set(guild.id, queue)
    return queue
}

module.exports.removeQueue = (guildID) => {
    /** @type {queueGuild} */
    let queue = qs.get(guildID)
    if (!queue) {
        return false
    }
    queue.disconnect()
    qs.delete(guildID)
    return true
}
module.exports.qs = qs