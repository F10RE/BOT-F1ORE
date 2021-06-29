const {Random} = require("something-random-on-discord")

module.exports = {
    help: {
    names: ["neko", "ねこ", "неко"]},
    description: "やめてください、でんぱい！",
run: async (client, message, args) => {

    let data = await Random.getNeko()
    message.channel.send(data)
}
}