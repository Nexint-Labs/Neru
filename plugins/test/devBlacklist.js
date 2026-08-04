const { SlashCommandBuilder } = require('discord.js');
const { embed } = require('../../functions/embed.js');
const { dmNotify } = require('../../functions/notify.js');
const { blacklistServerAdd } = require('../../functions/checkBlacklist.js');
const { devID, botName } = require('../../config.js');
const { client } = require('../../bot.js');

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('dev-blacklist')
		.setDescription(`Blacklist a server from ${botName}bot. Dev command.`)
		.addStringOption(option =>
			option
				.setName('id')
				.setRequired(true)
				.setDescription('The server ID to blacklist.'))
		.addStringOption(option =>
			option
				.setName('msg')
				.setRequired(true)
				.setDescription('Reason.'))
		.setIntegrationTypes([0, 1])
		.setContexts([0, 1, 2]),
	async execute(interaction) {
		if (interaction.user.id == devID) {
			const guildId = interaction.options.getString("id");
			const message = interaction.options.getString("msg");

			const guildArray = await client.cluster.broadcastEval(async (c, { guildId, message }) => {
				const guild = c.guilds.cache.get(guildId);
				if (guild) {
					const user = (await guild.fetchOwner()).user;
					try {
						guild.systemChannel.send({
							content: `This server has been blacklisted from ${botName}bot. Reason: ${message}.\nAppeal this by contacting the bot developer.\n-# This message is from the bot developer.`,
						});
					} catch { }
					guild.leave();
					return true; // Indicate that the message was sent
				}
				return false; // Indicate that the message was not sent by this shard
			}, { context: { guildId, message } }); // Pass the channelId as context

			const blacklisted = await blacklistServerAdd(interaction.options.getString("id"));

			// Send reply
			let embeds = await embed("Dev Blacklist", `Blacklisted server ${interaction.options.getString("id")}.`, null, null);
			if (!blacklisted) {
				embeds = await embed("Dev Blacklist", `The server has already been blacklisted.`, null, null);
			}
			await interaction.reply({
				embeds: [embeds]
			});
		} else {

			// Send reply
			const embeds = await embed("Dev Blacklist", `You do not have permission to use this command.`, null, null)
			await interaction.reply({
				embeds: [embeds]
			});
		}
	},
};