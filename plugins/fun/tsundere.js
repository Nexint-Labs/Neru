const { SlashCommandBuilder } = require('discord.js');
const { addCommandsUsed } = require('../../functions/usageData.js');
const { embed } = require('../../functions/embed.js');

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('tsundere')
		.setDescription('I\'m not a tsundere...')
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
        const embeds = await embed("D- D- Don't get the wrong idea! >~<", `I'm not a dere, a tsun-tsundere \nI have a Jell-O heart, I'm not that mean! \nI'm not blushing, I was just rushing and forgot the sunscreen!`, null, null)
        await interaction.reply({
            embeds: [embeds]
        });
	},
};