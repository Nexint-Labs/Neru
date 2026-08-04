const fs = require('node:fs');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const { client } = require('../../bot.js');
const { bibleChannels, biblePings } = require("../../config.js");

const getVerse = async function () {
    const options = { method: 'GET', headers: { accept: 'application/json' } };
    try {
        const response = await fetch('https://beta.ourmanna.com/api/v1/get?format=json&order=daily', options);

        // Check if the HTTP status code is successful (e.g., 200-299)
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data);
        return data;
    } catch (error) {
        // This catches network errors, bad JSON parsing, or our thrown HTTP error
        console.error('Fetch failed:', error);
    }
}

module.exports = {
    async post(verbose) {

        // Able to use sequelize databases in plugins and have them loaded.
        while (true) {
            if (!fs.existsSync('./store')) {
                fs.mkdirSync('./store');
            }
            let date = 0;
            if (fs.existsSync('./store/lastInterestDate.txt')) {
                date = fs.readFileSync('./store/lastInterestDate.txt', { encoding: 'utf8' });
            }


            if (Math.floor(Date.now() / 1000) > Number(date) + (86400)) {
                fs.writeFileSync('./store/lastInterestDate.txt', `${Math.floor(Date.now() / 1000)}`);
                let verse = await getVerse();
                for(let i = 0; i < bibleChannels.length; i++){
                    const channel = await client.channels.fetch(bibleChannels[i]);
                    channel.send(`${biblePings[i]}\n\n"${verse.verse.details.text}"\n${verse.verse.details.reference}\n-# Bible version: ${verse.verse.details.version}. ${verse.verse.notice}`);
                }
            }

            await delay(60000);
        }
    }
}

