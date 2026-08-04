// Pre-requisits. Do not touch these.
const { GatewayIntentBits, Partials, ActivityType } = require('discord.js');
let date = new Date();

module.exports = {

    // Discord Bot stuff
    // This config handles the Discord bot.

    // Bot stuff, including all API keys.
    token: "", // Bot Token
    clientId: "", // Bot Client ID
    devID: "", // Dev ID (who's running the bot?)
    devGuild: "", // dev guild ID
    tenorKey: "", // tenor api key, no longer used
    klipyKey: "", // klipy api key. It's possible to set this to empty but none of the gif commands will work.
    sekaiToken: "",
    intents: [ // All of the bot's permissions
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages,
    ],
    partials: [ // All of the bot's partials
        Partials.Channel,
        Partials.Message
    ],

    // Developer mode stuff for the economy system. Can be hooked into by other currency plugins.
    devMode: true,
    devMultiplier: 1,
    prodMultiplier: 1,
    devMsg: "This bot is running in dev mode. Developer functions are enabled.",

    // Moderation stuff
    spamLog: 4, // how many messages before logging
    spamDelete: 6, // how many messages before deleting
    spamWarn: 7, // how many messages before warning (trying to DM) - set all values except for dedlay to 2147483647 to effectively disable
    spamDelay: 2, // how many seconds before resetting this amount
    muteWarnCount: 3, // how many warns before getting muted
    muteBanCount: 3, // how many bans before getting muted

    // Custom Auto-warns
    spamWarnReason: "Spamming", // custom auto-warn reason

    // Cosmetic changes. Change these if you wish not to provide credit to me specifically, or change other things about the bot.
    // Source code MUST be available.
    botActivity: "Thinking About You! | /help",
    botStatus: "online",
    botURL: "", // Bot's URL for streaming. Automatically credits me if the botType is streaming!
    botType: ActivityType.Custom,
    embedURL: "https://nexint.ca/", // credits me in the embed, leave this blank if you want no URL
    embedIconURL: "https://yt3.ggpht.com/iQbC-EMTzqo1GakVCkw9366OcTq8O1otO3Ko2wTdR6hluhyFUS94wBtHaM_AD4qEwX9I2Wtucg=s176-c-k-c0x00ffffff-no-rj-mo", // more credit to me lol
    footerText: "Miku © 2026.",
    warnColor: 0xFFFF00,
    delMsgColor: 0x000000,
    muteColor: 0xFF8000,
    kickColor: 0xFF4000,
    banColor: 0xFF0000,
    pardonColor: 0x00FF00,
    infoColor: 0xFFFF00,

    // Known non-working commands.
    // There was supposed to be an auto mod API, but that uh... doesnt exist.
    // This is an OpenBot remnant.
    autoModAPI: false,
    autoModAPIToken: "",

    // Invite log channel (optional)
    inviteChannelID: "",

    // Emojis
    typeEmoji: "",

    // Channels to send daily Bible verses
    // I should probably fix this.
    bibleChannels: [
    ],
    biblePings: [
    ],


    // Web Server
    // This code handles how the web server handles data.

    // Port
    port: 3000,

    // API
    // This affects the Nexint API. Feel free to set all these to blank if you don't intend on using the Nexint API.
    // This bot will run standalone without the Nexint API. This bot is not reliant on my APIs.

    // Server
    server: "", // no slash at the end
    header: "",
    serverToken: "",
    delay: 300, // delay before checking servers (caching)

    // General settings
    // These affect the bot execution as a whole.

    // Customize the bot!
    devName: "Nexint",
    botName: "Neru",

    // Note that these commands are buggy, and may not work.
    restart: "start start.bat", // Restart command. This would be different on a linux based system. It would be "sh start.sh".

    // These can be changed, but only if you know what you are doing.
    dateOptions: {
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
    },
    logFormat: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`, // Log format of the bot


    // Do not change these. Used for version checking, command line functionality, names, and more.
    version: "0.3.0", // OpenBot version (now outdated)
    versionID: 10, // nexint raw server version (index.js), plugins are updated independantly
    botChannel: "dev",
    fileCount: 55, // file count, if more files are added / removed the server detects the instance is modified
    mikuVer: "0.3.1", // Bot version
    mikuChannel: "dev",
}