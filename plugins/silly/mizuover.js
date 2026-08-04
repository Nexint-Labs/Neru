const { SlashCommandBuilder } = require('discord.js');
const { addCommandsUsed } = require('../../functions/usageData.js');
const { embed } = require('../../functions/embed.js');

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('mizuover')
		.setDescription('It\'s mizuover.')
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
        const embeds = await embed("It's so mizuover. **1003.**", "Akiyama Mizuki (暁山 瑞希) is a second year student at Kamiyama High School. They are the animator of the online music circle 25-ji, Nightcord de., going by the alias \"Amia\".\n-# This is a silly command, and will be toggleable shortly.", "https://projectsekai.fandom.com/wiki/Akiyama_Mizuki", null)
        await interaction.reply({
            embeds: [embeds]
        });
	},
};