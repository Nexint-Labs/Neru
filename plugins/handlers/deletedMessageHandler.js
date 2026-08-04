const Sequelize = require('sequelize');
const { chatLog } = require('../../bot.js')
const { autoModAPI, autoModAPIToken, clientId, spamDelete, spamLog, spamDelay, spamWarn, embedURL, embedIconURL, spamWarnReason, footerText, warnColor, delMsgColor } = require('../../config.js');
const { EmbedBuilder, PermissionsBitField, AuditLogEvent } = require('discord.js');
const { client } = require('../../bot.js');
const moderation = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    // SQLite only
    storage: 'moderation.sqlite',
});

const sequelize = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    // SQLite only
    storage: 'database.sqlite',
});

const optOut = sequelize.define('optout', {
    author: {
        type: Sequelize.STRING,
        unique: true,
    }
});

const links = moderation.define('links', {
    channelId: {
        type: Sequelize.STRING,
        unique: true,
    },
});

const invites = moderation.define('invites', {
    channelId: {
        type: Sequelize.STRING,
        unique: true,
    },
});

const logging = moderation.define('logging', {
    channelId: {
        type: Sequelize.STRING,
        unique: true,
    },
});

const modlog = moderation.define('modlog', {
    channelId: {
        type: Sequelize.STRING,
        unique: true,
    },
});

const warnings = moderation.define('warnings', {
    userId: {
        type: Sequelize.STRING,
    },
    reason: {
        type: Sequelize.STRING,
    },
    issuer: {
        type: Sequelize.STRING,
    },
    server: {
        type: Sequelize.STRING,
    },
});

const messages = moderation.define('messages', {
    userId: {
        type: Sequelize.STRING,
    },
    content: {
        type: Sequelize.STRING,
    },
    messageId: {
        type: Sequelize.STRING,
    },
});

const blacklist = moderation.define('blacklist', {
    channelId: {
        type: Sequelize.STRING,
    },
    word: {
        type: Sequelize.STRING,
    },
    strict: {
        type: Sequelize.BOOLEAN,
    },
});

const bypassLogs = moderation.define('bypasslogs', {
    channelId: {
        type: Sequelize.STRING,
        unique: true,
    },
});

module.exports = {
    async execute() {
        client.on("messageDelete", async (message) => {
            const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

            const mes = message.content;

            if (!mes) return;

            // Bot-wide message logging functionality!
            const optedOutIDs = await optOut.findAll();
            let optedOut = false;
            optedOutIDs.forEach(async ids => {
                if (ids.author == message.author.id) {
                    optedOut = true;
                }
            })
            if (chatLog && message.author.id != clientId) {
                let replied = "";
                let redacted = `${message.author.username}`;
                if (msg.type == 19) {
                    replied = " [Replied]"
                }
                if (optedOut) {
                    redacted = "(Redacted)"
                }
            }

            // Server-side message logging functionality!
            // Will not be deprecated.
            const loggedIDs = await logging.findAll();
            const bypassLoggedMessages = await bypassLogs.findAll();
            const modChannelIDs = await modlog.findAll();
            let bypassed = false;
            bypassLoggedMessages.forEach(bypass => {
                if (bypass.channelId == message.channel.id) {
                    bypassed = true;
                }
            })
            let logged = false;
            let logTemp = false;
            let loggedChannelID;
            let logChannel;
            loggedIDs.forEach(async loggedChannel => {
                try {
                    let channel = await client.channels.fetch(loggedChannel.channelId)
                    if (channel.guildId == message.guildId) {
                        logged = true;
                        logTemp = true;
                        loggedChannelID = loggedChannel.channelId;
                    }
                } catch {
                    await logging.destroy({
                        where: {
                            channelId: loggedChannel.channelId,
                        }
                    });
                }
                if (logTemp && message.author.id != clientId) {
                    logTemp = false;
                    logChannel = await client.channels.fetch(loggedChannelID);
                    if (logChannel.permissionsFor(channel.guild.members.me).has(['ViewChannel', 'SendMessages'], true)) {
                        let replied = "";
                        let redacted = `${message.author.username}`;
                        if (optedOut) {
                            redacted = "(Redacted)"
                        }
                        await logChannel.send(`(${message.url}) \`${redacted}: ${message.cleanContent}\`${replied} [Deleted MEssage / (${message.id})]`);
                    } else {
                        await logging.destroy({
                            where: {
                                channelId: loggedChannelID,
                            }
                        });
                        logged = false;
                    }
                }
            })
            const channel = message.channel;
        })
    }
}