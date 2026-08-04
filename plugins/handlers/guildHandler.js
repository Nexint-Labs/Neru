const { Collection, Events, MessageFlags } = require('discord.js');
const { embed } = require('../../functions/embed.js');
const { blacklistServerCheck } = require('../../functions/checkBlacklist.js');
const { client } = require('../../bot.js');
const { inviteChannelID, botName } = require("../../config.js");
const { sendMessage } = require('../../functions/shardInfo.js');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
	async execute() {
		client.on("guildCreate", async guild => {
			// check for undefined guild
			if(guild.name === undefined){
				return;
			}
			let joinEmbed = await embed(`Welcome to ${botName}Bot!`, `- Run /help to obtain help on how to use ${botName}Bot!\n- Join our support server for additional support! /support\n\nHave fun! :D`, null, null);

			const blacklisted = await blacklistServerCheck(guild.id)
			if(blacklisted){
				await delay(1000);
				guild.leave();
				return;
			}

			// send embed message
			try {
				guild.systemChannel.send({
					embeds: [joinEmbed],
				});
			} catch {
				try {
					let owner = await guild.systemChannel.fetchOwner();
					owner.send({
						embeds: [joinEmbed],
					})
				} catch { }
			}
			
			// check for undefined log channel
			if(inviteChannelID === undefined){
				return;
			}

			// try catch
			try {
				// Send the created invite link to the user who requested it
				sendMessage(inviteChannelID, `Joined a new guild: ${guild.name} (ID: ${guild.id}) - Members: ${guild.memberCount}`);
			} catch (error) {
				console.error(error);
			}
		})
		client.on('guildDelete', (guild) => {
			// check for undefined guild
			if(guild.name === undefined){
				return;
			}
			
			// check for undefined log channel
			if(inviteChannelID === undefined){
				return;
			}

			// try sending the message in the log channel
			try {
				// Send the created invite link to the user who requested it
				sendMessage(inviteChannelID,`Left guild: ${guild.name} (ID: ${guild.id}) - Members: ${guild.memberCount}`);
			} catch (error) {
				console.error(error);
			}
		});
	}
}