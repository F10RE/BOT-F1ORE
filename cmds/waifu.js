const {Random} = require("something-random-on-discord")

module.exports = {
    help: {
    names: ["waifu", "わいふ", "вайфу"]},
    description: "やめてください、でんぱい！",
run: async (client, message, args) => {

    let data = await Random.getAnimeImgURL("waifu")
    message.channel.send(data)
}
}