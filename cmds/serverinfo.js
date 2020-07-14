const { MessageEmbed } = require('discord.js');

module.exports = {
    run: async (client, message, args) => {

        const embed = new MessageEmbed()
            .setThumbnail(message.guild.iconURL({dynamic : true}))
            .setColor('#f3f3f3')
            .setTitle(`Cтатиска сервера`)
            .addFields(
                {
                    name: "Владелец: ",
                    value: message.guild.owner.user.tag,
                    inline: true
                },
                {
                    name: "Участники: ",
                    value: `${message.guild.memberCount} участников!`,
                    inline: true
                },
                {
                    name: "Онлайн: ",
                    value: `${message.guild.members.cache.filter(m => m.user.presence.status == "online").size} участников онлайн!`,
                    inline: true
                },
                {
                    name: "Всего ботов: ",
                    value: `${message.guild.members.cache.filter(m => m.user.bot).size} ботов!`,
                    inline: true
                },
                {
                    name: "Дата создания: ",
                    value: message.guild.createdAt.toLocaleDateString("ru-GMT"),
                    inline: true
                },
                {
                    name: "Кол-во ролей: ",
                    value: `${message.guild.roles.cache.size} ролей на сервере.`,
                    inline: true,
                },
                {
                    name: `Верификация: `,
                    value: message.guild.verified ? 'Сервер верифицирован' : `Сервер не верифицирован`,
                    inline: true
                },
                {
                    name: 'Бустеры: ',
                    value: message.guild.premiumSubscriptionCount >= 1 ? `${message.guild.premiumSubscriptionCount} бустеров!` : `Бустеров нет!`,
                    inline: true
                },
                {
                    name: "Эмоджи: ",
                    value: message.guild.emojis.cache.size >= 1 ? `${message.guild.emojis.cache.size} эмоджи!` : 'Эмоджи нет!',
                    inline: true
                }
            )
        await message.channel.send(embed)
    }
}

module.exports.help = {
    names: ['serverinfo', 'sinfo']
}