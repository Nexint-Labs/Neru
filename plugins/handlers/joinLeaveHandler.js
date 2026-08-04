const Sequelize = require('sequelize');
const { chatLog } = require('../../bot.js')
const { autoModAPI, autoModAPIToken, clientId, spamDelete, spamLog, spamDelay, spamWarn, embedURL, embedIconURL, spamWarnReason, footerText, warnColor, delMsgColor } = require('../../config.js');
const { EmbedBuilder, PermissionsBitField, Collection, Events, MessageFlags } = require('discord.js');
const { client } = require('../../bot.js');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

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

const join = moderation.define('join', {
    channelId: {
        type: Sequelize.STRING,
        unique: true,
    },
    joinMsg: {
        type: Sequelize.STRING,
    },
    serverId: {
        type: Sequelize.STRING,
    },
});

const leave = moderation.define('leave', {
    channelId: {
        type: Sequelize.STRING,
        unique: true,
    },
    joinMsg: {
        type: Sequelize.STRING,
    },
    serverId: {
        type: Sequelize.STRING,
    },
});


const channelMessage = async function (ids, member) {
    const channel = member.guild.channels.cache.get(ids.channelId);
    if (!channel) return;
    let user = member.toString();
    let userName = member.displayName;
    let server = member.guild.name;
    let memberCount = member.guild.memberCount;
    let msg = "";
    for (let i = 0; i < ids.joinMsg.length; i++) {
        let tmpMsg = ids.joinMsg[i];
        if (ids.joinMsg[i] + ids.joinMsg[i + 1] == "${") {
            tmpMsg = ids.joinMsg[i];
            while (i < ids.joinMsg.length && ids.joinMsg[i] != "}") {
                i += 1;
                tmpMsg += ids.joinMsg[i];
            }
            switch (tmpMsg.toLowerCase()) {
                case "${user}":
                    tmpMsg = user;
                    break;
                case "${server}":
                    tmpMsg = server;
                    break;
                case "${membercount}":
                    tmpMsg = memberCount;
                    break;
                case "${username}":
                    tmpMsg = userName;
                    break;
            }
        }
        msg += tmpMsg;
    }
    channel.send(msg);

}

module.exports = {
    async execute() {
        client.on("guildMemberAdd", async member => {
            const joinList = await join.findAll({
                where: {
                    serverId: member.guild.id
                }
            });
            joinList.forEach(async ids => {
                await channelMessage(ids, member)
                await delay(500);
            })
        })
        client.on("guildMemberRemove", async member => {
            const leaveList = await leave.findAll({
                where: {
                    serverId: member.guild.id
                }
            });
            leaveList.forEach(async ids => {
                await channelMessage(ids, member)
                await delay(500);
            })
        })
    }
}