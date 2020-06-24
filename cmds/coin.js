const Discord = module.require("discord.js");
const fs = require("fs");
module.exports.run = async (bot, message ,args) => {
    message.channel.send('Монета подбрасывается...')
    
    var random = Math.floor(Math.random() * 2); // Объявление переменной random - она вычисляет случайное число от 1 до 3
    
    if (random == 0) { // Если вычислено число 1, то выпадает орёл.
        message.channel.send(':full_moon: Орёл!')
    } else if (random == 1) { // Если вычислено число 2, то выпадает решка.
        message.channel.send(':new_moon: Решка!')
    }
};
    module.exports.help = {
        names: ["монетка"]
    };