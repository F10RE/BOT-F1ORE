const api = require('../f1oreconfig.json');
const api_key = api.api_key; // Отличный ключ -- undefined
const { MessageEmbed } = require('discord.js');
const axios = require('axios')

module.exports = {
    run: async (client, message, args) => {
        if(!args[0]) {
            return message.channel.send(`Пожалуйста, укажите город!`)
        }

        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(args.join(' '))}&units=imperial&appid=${api_key}`;

        let response, city;

        try {
            response = await axios.get(url);
            city = response.data
            console.log(city)
        } catch (e) {
            return message.channel.send(`Не можем найти этот город!`)
        }

        const embed = new MessageEmbed()
            .setTitle(`Погода: ${city.name}`)
            .setThumbnail(`http://openweathermap.org/img/wn/${city.weather[0].icon}@2x.png`)
            .setDescription(city.weather[0].description)
            .addFields(
                {
                    name: "Температура: ",
                    value: `${city.main.temp} °C`,
                    inline: true
                },
                {
                    name: "Погода: ",
                    value: city.weather[0].main // Нереалистично, для городов России константой возвращать "Хуёвая"
                },
                {
                    name: "Ощущается как: ",
                    value: `${city.main.feels_like} °C`, // FeelsLikeTeenSpirit
                    inline: true
                },
                {
                    name: "Самая высокая: ",
                    value: `${city.main.temp_max} °C`,
                    inline: true
                },
                {
                    name: "Самая низкая: ",
                    value: `${city.main.temp_min} °C`,
                    inline: true
                },
                {
                    name: "Восход: ",
                    value: city.sys.sunrise,
                    inline: true
                },
                {
                    name: "Закат: ",
                    value: city.sys.sunset,
                    inline: true
                }
            )

        message.channel.send(embed)
    }
}

module.exports.help = {
    names: ['weather', 'погода']
}