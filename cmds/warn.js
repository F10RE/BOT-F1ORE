const Discord = module.require("discord.js");
const fs = require("fs");
let profile = require("../profile.json");
module.exports.run = async (bot, message, args) => {
    try {
        function send(msg) {
            message.channel.send(msg);
        }


        if (!args[0]) return send("Вы не указали пользователя!");

        console.log(message.member.permissions.toArray());

        if (!message.member.hasPermission("KICK_MEMBERS")) return message.channel.send(`${message.author.username}, у вас не хватает прав.`);
        let rUser = message.guild.member(message.mentions.users.first() || message.guild.members.fetch(args[0]));

        if (!rUser) return send("Пользователь не найден.")

        profile[rUser.id].warns++;
        fs.writeFile('./profile.json', JSON.stringify(profile), (err) => {
            if (err) console.log(err);
        });
        if (profile[rUser.id].warns >= 30) {
            message.guild.member(rUser).kick("30/30 Предупреждений.");
        }
        let embed = new Discord.MessageEmbed()
            .setDescription("Предупреждение!")
            .addField("Администратор", message.author.username)
            .addField("Выдал предупреждение", `${rUser.user.username}`)
            .addField("Кол-во предупреждений", `${profile[rUser.id].warns}/30`)

        message.channel.send(embed);
    } catch (err) {
        console.log(`1.${err.name}\n2.${err.stack}`);
    }

};
module.exports.help = {
    names: ["warn"],
};