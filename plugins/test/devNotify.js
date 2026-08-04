const { SlashCommandBuilder } = require('discord.js');
const { embed } = require('../../functions/embed.js');
const { dmNotify } = require('../../functions/notify.js');
const { devID } = require('../../config.js');

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('dev-notify')
		.setDescription('Notify someone. Dev command.')
		.addUserOption(option =>
			option
				.setName('user')
				.setRequired(true)
				.setDescription('The person to notify.'))
		.addStringOption(option =>
			option
				.setName('msg')
				.setRequired(true)
				.setDescription('The message to notify.'))
		.setIntegrationTypes([0, 1])
		.setContexts([0, 1, 2]),
	async execute(interaction) {
		if (interaction.user.id == devID) {
			let msg = interaction.options.getString("msg");

			// Send reply
			const embeds = await embed("Dev Notify", `DMed ${interaction.options.getUser("user").displayName} "${msg}".`, null, null)
			await interaction.reply({
				embeds: [embeds]
			});

			// DM Notify (as a test)
			let result = await dmNotify(interaction.options.getUser("user"), `${msg} \n-# This message is from the bot developer.`, null, null, true);
			if (result !== 0 && result.rawError.message != "Cannot send messages to this user") {
				console.log(result);
			}
		} else {

			// Send reply
			const embeds = await embed("Dev Notify", `You do not have permission to use this command.`, null, null)
			await interaction.reply({
				embeds: [embeds]
			});
		}
	},
};