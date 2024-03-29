const Discord = require("discord.js");
const fs = require("fs");

/**
 * @param {Discord.Client} bot
 * @param {Discord.Message} message
 */
module.exports.run = async (bot, message, args) => {
    message.channel.send('Монета подбрасывается...')

    var random = Math.floor(Math.random() * 2); // Объявление переменной random - она вычисляет случайное число от 0 до 1

    if (random == 0) { // Если вычислено число 0, то выпадает орёл.
        message.channel.send(':full_moon: Орёл!')
    } else if (random == 1) { // Если вычислено число 1, то выпадает решка.
        message.channel.send(':new_moon: Решка!')
    }
};

module.exports.help = {
    names: ["монетка"],
    description: ':first_quarter_moon: Подкинь монетку, проверь свою удачу'
};