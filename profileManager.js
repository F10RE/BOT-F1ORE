const fs = require('fs');

class ProfileManager {
    constructor() {
        try {
            this.profile = require('./profile.json')
        } catch{
            this.profile = {}
            console.warn('No profile.json found or it\'s invalid')
        }
        this.interval = setInterval(this.store.bind(this), 60000);
    }

    update(userid, profile) {
        this.profile[userid] = { ...this.profile[userid], ...profile }
    }

    remove(userid) {
        this.profile[userid] = {}
    }

    get(userid) {
        return this.profile[userid]
    }

    add(userid) {
        this.profile[userid] = {
            coins: 1000,
            warns: 0,
            xp: 0,
            lvl: 0
        }
        return this.profile[userid]
    }

    store() {
        console.log('Автосейв профиля')
        fs.writeFile('./profile.json', JSON.stringify(this.profile), (err) => {
            if (err) console.log(err);
        });
        console.log(this.profile);
    }

    shut() {
        this.store()
        clearInterval(this.interval)
        console.log('profileManager выключен')
    }
}

let pm = new ProfileManager()
module.exports.profile = pm;