const { SlashCommandBuilder } = require('discord.js');
const { addCommandsUsed } = require('../../functions/usageData.js');
const { embed } = require('../../functions/embed.js');

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('bean')
		.setDescription('bean.')
		.setIntegrationTypes([0,1])
		.setContexts([0,1,2]),
	async execute(interaction) {

        const { isBlacklisted } = require('../../functions/blacklist.js');
        const { server } = require('../../config.js');
        if (await isBlacklisted(interaction.user.id, server)) {
            let msg = await embed("Warning", "You have been blacklisted from all Nexint services.", null, null);
            await interaction.reply({
                embeds: [msg]
            });
            return;
        }

		// Add to analytics
		addCommandsUsed(interaction.user);

		// Send reply
        const embeds = await embed("Bean", "bean.", null, null)
        await interaction.reply({
            embeds: [embeds]
        });
	},
};