const Discord = require('discord.js');
const fs = require("fs");
const profile = require('../profileManager').profile;

/**
 * @param {Discord.Client} bot
 * @param {Discord.Message} message
 */
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

        let userProfile = profile.get(rUser.id) || profile.add(rUser.id);
        userProfile.warns += 1;
        profile.update(rUser.id, { warns: userProfile.warns })

        if (userProfile.warns >= 30) {
            message.guild.member(rUser).kick("30/30 Предупреждений.");
        }
        let embed = new Discord.MessageEmbed()
            .setAuthor(message.author.tag, message.author.avatarURL({ size: 256 }))
            .setTitle("Предупреждение!")
            .addField("Получатель", `${rUser.user.tag}`, true)
            .addField("Причина:", args.slice(1).join(' ') || 'Не указана. Плохой модератор. или он тестирует')
            .addField("Номер предупреждения", userProfile.warns)
            .setTimestamp()
            .setFooter(`Выдал ${message.author.tag}`)
            .setColor(0xDE8A0B)
        message.channel.send(embed);
    } catch (err) {
        console.log(`1.${err.name}\n2.${err.stack}`);
    }
};

module.exports.help = {
    names: ["warn"],
};