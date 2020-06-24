const Discord = module.require("discord.js");
const fs = require("fs");
module.exports.run = async (bot, message ,args) => {
    message.channel.send('Монета подбрасывается...')
    
    var random = Math.floor(Math.random() * 4); // Объявление переменной random - она вычисляет случайное число от 1 до 3
    
    if (random == 1) { // Если вычислено число 1, то выпадает орёл.
        message.channel.send(':full_moon: Орёл!')
    } else if (random == 2) { // Если вычислено число 2, то выпадает решка.
        message.channel.send(':new_moon: Решка!')
    } else if (random == 3) { // Если вычислено число 3, то монета падает ребром.
        message.channel.send(':last_quarter_moon: Монета упала ребром!')
    }
};
    module.exports.help = {
        names: ["монетка"]
    };