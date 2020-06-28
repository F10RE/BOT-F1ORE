const Discord = require('discord.js');
const client = new Discord.Client();
var config = require('../f1oreconfig.json'); 

client.login(config.token);


const yt = require('ytdl-core'); 
const searchYoutube = require('youtube-api-v3-search');

var queue = {};


client.on('ready', () => {
	console.log('ready!');
});

client.on('message', msg => {
	if (!msg.content.startsWith(config.prefix)) return;
	if (commands.hasOwnProperty(msg.content.toLowerCase().slice(config.prefix.length).split(' ')[0])) commands[msg.content.toLowerCase().slice(config.prefix.length).split(' ')[0]](msg);
});

const commands = {
	'join': (msg) => {
		return new Promise((resolve, reject) => {
            const voiceChannel = msg.member.voice.channel;
			if (!voiceChannel || voiceChannel.type !== 'voice') return msg.reply('Не могу присоединиться к твоему голосовому каналу.');
			voiceChannel.join().then(connection => resolve(connection)).catch(err => reject(err));
        });
    },
	'add': (msg) => {
		let url = msg.content.split(' ')[1];
		if (url == '' || url === undefined) return msg.channel.send(`Необходимо добавить ссылку на YouTube видео или ID после ${config.prefix}add`);
		yt.getInfo(url, (err, info) => {
            if (err) {
                // Сообщение после команды !add
                var args = msg.content.slice(config.prefix.length).trim().split(" ");
                args.splice(0, 2);
                var mesg = args.join(" ");
                // Помещаем запрос в параметр для поиска
                var options = {
                    q: mesg,
                    part: 'snippet',
                    type: 'video'
                };
                // Сам поиск
                searchYoutube(config.youtube_api_key, options, function (err, result) {
                    if (err) {
                        console.log(err + " |-------|-------| " + JSON.stringify(info));
                    } else {
                        url = result.items[0].id.videoId;
                        yt.getInfo(url, (err, info) => {
                            if (!err) {
                                if (!queue.hasOwnProperty(msg.guild.id)) queue[msg.guild.id] = {}, queue[msg.guild.id].playing = false, queue[msg.guild.id].songs = [];
                                queue[msg.guild.id].songs.push({url: url, title: info.title, requester: msg.author.username});
                                msg.channel.send("Добавлено в очередь: ```"+info.title+"```");
                            }
                        });
                    }
                });
            } else {
                if (!queue.hasOwnProperty(msg.guild.id)) queue[msg.guild.id] = {}, queue[msg.guild.id].playing = false, queue[msg.guild.id].songs = [];
                queue[msg.guild.id].songs.push({url: url, title: info.title, requester: msg.author.username});
                msg.channel.send("Добавлено в очередь: ```"+info.title+"```");
            }
        });
    },
    'queue': (msg) => {
        if (queue[msg.guild.id] === undefined) return msg.channel.send(`Очередь пуста. Для добавления трека воспользуйся командой !add`);
        let tosend = [];
        queue[msg.guild.id].songs.forEach((song, i) => {
            tosend.push(`${i+1}. ${song.title} - Заказал: ${song.requester}`);
        });
        msg.channel.send(`__**${msg.guild.name} Муз. Очередь:**__ В данный момент **${tosend.length}** треков в очереди. ${(tosend.length > 10 ? '*[Показаны первые 10]*' : '')}\n\`\`\`${tosend.slice(0,10).join('\n')}\`\`\``);
    },
    'play': (msg) => {
        if (queue[msg.guild.id] === undefined) return msg.channel.send(`Очередь пуста. Для добавления трека воспользуйся командой !add`);
        if (msg.guild.voice == undefined || msg.guild.voice.channel == undefined || msg.guild.voice.connection == null) return commands.join(msg).then(() => commands.play(msg));
        if (queue[msg.guild.id].playing) return msg.channel.send('Уже играет');
        
		let dispatcher;
        queue[msg.guild.id].playing = true;
        
		(function play(song) {
            console.log(song.title);
			if (song === undefined) return msg.channel.send('Очередь пуста').then(() => {
				queue[msg.guild.id].playing = false;
				msg.member.voice.channel.leave();
            });
            msg.channel.send(`Играет: **${song.title}** по запросу от **${song.requester}**`);
            dispatcher = msg.guild.voice.connection.play(yt(song.url, {audioonly: true}), {passes : 4});

			let collector = msg.channel.createMessageCollector(m => m);
			collector.on('message', m => {
                if (m.content.startsWith(config.prefix + 'pause')) {
					m.channel.send('На паузе').then(() => {
                        dispatcher.pause();
                    });
				} else if (m.content.startsWith(config.prefix + 'resume')){
					m.channel.send('Проигрывание продолжается').then(() => {
						dispatcher.resume();
                    });
				} else if (m.content.startsWith(config.prefix + 'skip')){
					m.channel.send('Трек пропущен').then(() => {
                        dispatcher.end();
                    });
				} else if (m.content.startsWith('volume+')){
					if (Math.round(dispatcher.volume*50) >= 100) return m.channel.send(`Громкость: ${Math.round(dispatcher.volume*50)}%`);
					dispatcher.setVolume(Math.min((dispatcher.volume*50 + (2*(m.content.split('+').length-1)))/50,2));
					m.channel.send(`Громкость: ${Math.round(dispatcher.volume*50)}%`);
				} else if (m.content.startsWith('volume-')){
					if (Math.round(dispatcher.volume*50) <= 0) return m.channel.send(`Громкость: ${Math.round(dispatcher.volume*50)}%`);
					dispatcher.setVolume(Math.max((dispatcher.volume*50 - (2*(m.content.split('-').length-1)))/50,0));
					m.channel.send(`Громкость: ${Math.round(dispatcher.volume*50)}%`);
				} else if (m.content.startsWith(config.prefix + 'time')){
					m.channel.send(`Время: ${Math.floor(dispatcher.time / 60000)}:${Math.floor((dispatcher.time % 60000)/1000) <10 ? '0'+Math.floor((dispatcher.time % 60000)/1000) : Math.floor((dispatcher.time % 60000)/1000)}`);
				}
            });
            
			dispatcher.on('end', () => {
                play(queue[msg.guild.id].songs.shift());
                collector.stop();
			});
			dispatcher.on('error', (err) => {
				return msg.channel.send('Ошибка: ' + err).then(() => {
					play(queue[msg.guild.id].songs.shift());
					collector.stop();
				});
			});
        }) (queue[msg.guild.id].songs.shift());
    }
};