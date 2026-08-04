const { SlashCommandBuilder } = require('discord.js');
const { embed } = require('../../functions/embed.js');
const { dmNotify } = require('../../functions/notify.js');
const { blacklistServerRemove } = require('../../functions/checkBlacklist.js');
const { devID } = require('../../config.js');
const { client } = require('../../bot.js');

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('dev-whitelist')
		.setDescription('Removes a blacklisted server.')
		.addStringOption(option =>
			option
				.setName('id')
				.setRequired(true)
				.setDescription('The server ID to blacklist.'))
		.setIntegrationTypes([0, 1])
		.setContexts([0, 1, 2]),
	async execute(interaction) {
		if (interaction.user.id == devID) {
			const blacklisted = await blacklistServerRemove(interaction.options.getString("id"));

			// Send reply
			let embeds = await embed("Dev Whitelist", `Whitelisted server ${interaction.options.getString("id")}.`, null, null);
			if (!blacklisted) {
				embeds = await embed("Dev Whitelist", `The server has already been whitelisted.`, null, null);
			}
			await interaction.reply({
				embeds: [embeds]
			});
		} else {

			// Send reply
			const embeds = await embed("Dev Whitelist", `You do not have permission to use this command.`, null, null)
			await interaction.reply({
				embeds: [embeds]
			});
		}
	},
};