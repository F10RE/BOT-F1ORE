const Discord = require('discord.js');
const bot = new Discord.Client();
bot.commands = new Discord.Collection();
const fs = require('fs');
let config = require('./f1oreconfig.json');
let token = config.token;
let prefix = config.prefix;
try {
  var profile = require('./profile.json');
} catch (exc) {
  var profile = {};
}

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
  if (!profile[uid]) {
    profile[uid] = {
      coins: 1000,
      warns: [],
      xp: 0,
      lvl: 0

    };
  };
  let u = profile[uid];
  u.coins += 10;
  u.xp += 1;
  if (u.xp >= (u.lvl * 100)) {
    u.xp = 0
    u.lvl += 1;
  }
  fs.writeFile('./profile.json', JSON.stringify(profile), (err) => {
    if (err) console.log(err);
  });
  let messageArray = message.content.split(" ");
  let command = messageArray[0].toLowerCase();
  let args = messageArray.slice(1);
  if (!message.content.startsWith(prefix)) return;
  let cmd = bot.commands.get(command.slice(prefix.length));
  if (cmd) cmd.run(bot, message, args);
});

bot.login(token);

// Exit handlers
function shutdown(status) {
  console.log('Выключаюсь...')
  fs.writeFile('./profile.json', JSON.stringify(profile), (err) => {
    if (err) console.log(err);
  });
  bot.destroy(); // Logs off Discord, leaving no stray sessions active
  if (status.exit) {
    process.exit();
  }
}

process.on('exit', shutdown.bind(null, { exit: false }));
process.on('SIGINT', shutdown.bind(null, { exit: true }));
process.on('SIGUSR1', shutdown.bind(null, { exit: true }));
process.on('SIGUSR2', shutdown.bind(null, { exit: true }));