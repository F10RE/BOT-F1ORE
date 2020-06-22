const Discord = require('discord.js');
const bot = new Discord.Client();
bot.commands = new Discord.Collection();
const fs = require('fs');
let config = require('./f1oreconfig.json');
let token = config.token;
let prefix = config.prefix;

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
  let user = message.author;
  let messageArray = message.content.split(" ");
  let command = messageArray[0].toLowerCase();
  let args = {
    'query': messageArray.slice(1), // Previously args
    'user': user  // user with username, userid, guilds
  }
  if (!message.content.startsWith(prefix)) return;
  let cmd = bot.commands.get(command.slice(prefix.length));
  if (cmd) cmd.run(bot, message, args);
});

bot.login(token);

// Exit handlers
function shutdown(status) {
  console.log('Выключаюсь...')
  // You can add more stuff to do when the bot stops here
  // like close open files or whatever
  bot.destroy(); // Logs off Discord, leaving no stray sessions active
  if (status.exit){
    process.exit();
  }
}

process.on('exit', shutdown.bind(null, {exit: false}));
process.on('SIGINT', shutdown.bind(null, {exit: true}));
process.on('uncaughtException', shutdown.bind(null, {exit: true}));