const { delay, header } = require('../config.js');
let blacklist = [];
let date = Math.floor(Date.now() / 1000);

const isBlacklisted = async function (id, server) {

    // cached blacklist data
    // this limits the API requests to MAX once every 5 minutes
    if ((blacklist.length == 0 || Math.floor(Date.now() / 1000) > Number(date) + delay) && (server != null && server != "")) {
        try {

            // try to get the info from my server
            const update = await fetch(server + '/api/v1/blacklist', {
                method: 'GET',
                headers: {
                    'Authorization': header,
                    'Content-Type': `application/json`
                }
            });
            const event = await update.json();
            blacklist = event.content.blacklist;
            date = Math.floor(Date.now() / 1000);
        } catch {

            // else, use a local blacklist
            // this blacklist is empty on purpose
            if (blacklist == undefined) {
                blacklist = [];
            }

            // log the error in the console
            console.log("[" + DateFormatter.format(Date.now()) + `] [ERROR] Could not hit the Nexint API.`);
            console.log("[" + DateFormatter.format(Date.now()) + `] [INFO] Relying on old data. Will get data next time.`);
        }
    }

    // check blacklist
    for (let i = 0; i < blacklist.length; i++) {
        if (blacklist[i] == id) {
            return true;
        }
    }
    return false;
}

module.exports = {
    isBlacklisted
};