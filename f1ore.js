const Discord = require('discord.js');
const bot = new Discord.Client();
bot.commands = new Discord.Collection();
const fs = require('fs');
let config = require('./f1oreconfig.json');
let token = config.token;
let prefix = config.prefix;
const profile = require('./profileManager').profile;
const queues= require('./queueManager').qs

fs.readdir('./cmds/', (err, files) => {
    if (err) console.log(err);
    let jsfiles = files.filter(f => f.split(".").pop() === "js");
    if (jsfiles.length <= 0) console.log("Нет комманд для загрузки!!");
    console.log(`Загружено ${jsfiles.length} комманд`);
    jsfiles.forEach((f, i) => {
        let props = require(`./cmds/${f}`);
        console.log(`${i + 1}.${f} Загружен!`);
        props.help.names.forEach(name => {
            bot.commands.set(name, props);
        });
    })
})


bot.on('ready', () => {
    console.log(`Запустился бот ${bot.user.username}`)
    bot.generateInvite(["ADMINISTRATOR"]).then(link => {
        console.log(link);
    })
});

bot.on('message', async message => {
    if (message.author.bot) return;
    if (message.channel.type == "dm") return;
    let uid = message.author.id;
    let user = profile.get(uid) || profile.add(uid);
    user.coins += 10;
    user.xp += 1;
    if (user.xp >= (user.lvl * 100)) {
        user.xp = 0
        user.lvl += 1;
    }
    profile.update(uid, user);
    let messageArray = message.content.split(" ");
    let command = messageArray[0].toLowerCase();
    let args = messageArray.slice(1);
    if (!message.content.startsWith(prefix)) return;
    let cmd = bot.commands.get(command.slice(prefix.length));
    if (cmd) cmd.run(bot, message, args);
});

bot.on("message", async message => {
    if (message.guild.id != "485861240711938058") return;
    if (!message.mentions.has(bot.user.id)) return;
    if (!["269766141533093890", "485858994901221408"].includes(message.author.id)) return;
    if (message.content.includes("Съеби нахуй, пожалуйста")){
        process.emit("SIGINT")
        console.log("Убиваюсь..")
    }
})

bot.login(token);

// Exit handlers
function shutdown(status) {
    console.log('Выключаюсь...')
    if (status.store){
        profile.shut()
        queues.forEach((queue) => {
            queue.disconnect()
        })
    }
    bot.destroy(); // Logs off Discord, leaving no stray sessions active
    if (status.exit) {
        process.exit();
    }
}

process.on('SIGINT', shutdown.bind(null, { exit: false, store: true }));
process.on('SIGUSR1', shutdown.bind(null, { exit: true }));
process.on('SIGUSR2', shutdown.bind(null, { exit: true }));