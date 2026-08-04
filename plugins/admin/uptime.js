const { InteractionContextType, SlashCommandBuilder, PermissionFlagsBits, PermissionsBitField, MessageFlags } = require('discord.js');
const { devID, botName } = require('../../config.js');
// Databases used.
const Sequelize = require('sequelize');
const moderation = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    // SQLite only
    storage: 'moderation.sqlite',
});

const nexint = moderation.define('nexint', {
    status: {
        type: Sequelize.STRING,
    },
    type: {
        type: Sequelize.STRING,
    },
});

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('uptime')
        .setDescription('Check uptime of Nexint services!')
        .setIntegrationTypes([0, 1])
        .setContexts([0, 1, 2]),
    async execute(interaction) {
        // interaction.user is the object representing the User who ran the command
        // interaction.member is the GuildMember object, which represents the user in the specific guild
        await interaction.deferReply();

        const { isBlacklisted } = require('../../functions/blacklist.js');
        const { server } = require('../../config.js');
        if (await isBlacklisted(interaction.user.id, server)) {
            let msg = await embed("Warning", "You have been blacklisted from all Nexint services.", null, null);
            await interaction.editReply({
                embeds: [msg]
            });
            return;
        }

        // Uptime only works if you're pinging Nexint services.
        // This entire uptime command needs to be changed if you wish to fork this bot.
        // This is to prevent misuse of the Nexint API.
        if (server != "https://api.nexint.org") {
            let msg = await embed("Warning", `This instance of ${botName} is not connected to the Nexint API. Please remove this command by deleting the file /plugins/admin/uptime.js`, null, null);
            await interaction.editReply({
                embeds: [msg]
            });
            return;
        }

        await interaction.editReply("Pinging Nexint Services...");
        let prevBotStatus = [1, 1, 1, 1];

        let websiteArray = ["https://nexint.ca/", "https://www.nexint.org/", "https://spacelink.cc/", "https://www.the-gospel.xyz/", "https://files.nexint.ca", "https://api.nexint.org"];
        let websiteInfo = ["", "\n-# Mirror of nexint.ca, may be discontinued.", "\n-# Discontinued service.", "", "", ""];
        let websiteDown = [0, 0, 0, 0, 0, 0];
        let websiteResponse = [];
        let startDate = Date.now();
        const https = require('https');

        // Get a page
        async function get_page(url, i) {

            return new Promise((resolve) => {
                let data = ''
                startDate = Date.now();

                https.get(url, res => {
                    if (res.statusCode > 299) {
                        if (websiteDown[i] == 0) {
                            websiteDown[i] = 1;
                        }
                        websiteResponse.push(`${websiteArray[i]}: :x: Offline (${res.statusCode}, ${Date.now() - startDate}ms) ${websiteInfo[i]}`);
                    } else {
                        if (websiteDown[i] == 1) {
                            websiteDown[i] = 0;
                        }
                        websiteResponse.push(`${websiteArray[i]}: :white_check_mark: Online (${res.statusCode}, ${Date.now() - startDate}ms) ${websiteInfo[i]}`);
                    }
                    resolve();
                }).on('error', err => {
                    console.log('Error: ', err.message);
                    websiteResponse.push(`${websiteArray[i]}: :x: Offline (${err.message}) ${websiteInfo[i]}`);
                    resolve();
                });
            })
        }

        websiteResponse = [];
        for (let i = 0; i < websiteArray.length; i++) {
            await get_page(websiteArray[i], i)
        }

        let website = "";
        for (let i = 0; i < websiteArray.length; i++) {
            website += websiteResponse[i];
            website += "\n"

        }
        interaction.editReply(`**Pinged Services!**\nWebsites:\n${website}\nLast Updated: <t:${Math.floor(Date.now() / 1000)}:R>.`);
        return;
    }
};