const { client } = require('../bot.js');

const getServer = async (guildID) => {
    // try to get guild from all the shards
    const req = await client.cluster.broadcastEval((c, id) => c.guilds.cache.get(id), {
        context: guildID
    });

    // return Guild or null if not found
    return req.find(res => !!res) || null;
}

const getUser = async (userID) => {
    // try to get guild from all the shards
    const req = await client.cluster.broadcastEval((c, id) => c.users.cache.get(id), {
        context: userID
    });

    // return Guild or null if not found
    return req.find(res => !!res) || null;
}

const sendMessage = async (channelId, msg) => {
    let messageContent = msg;
    const sentArray = await client.cluster.broadcastEval(async (c, {channelId, messageContent}) => {
        const channel = c.channels.cache.get(channelId);
        if (channel && channel.isTextBased()) {
            await channel.send(messageContent);
            return true; // Indicate that the message was sent
        }
        return false; // Indicate that the message was not sent by this shard
    }, { context: { channelId, messageContent } }); // Pass the channelId as context

    // Check the results from all shards
    if (!sentArray.includes(true)) {
        return false;
    }
    return true;
}

module.exports = {
    getServer,
    getUser,
    sendMessage,
};