const { SlashCommandBuilder } = require('discord.js');
const { addCommandsUsed } = require('../../functions/usageData.js');
const { embed } = require('../../functions/embed.js');

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('kana')
		.setDescription('Kanade from Project Sekai.')
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
        const embeds = await embed("Kana - Kanade", "Yoisaki Kanade (宵よい崎さき 奏 ) is a third-year student taking online classes. She is the leader and composer of the online music circle 25-ji, Nightcord de., going by the alias \"K\".\n-# This is a silly command, and will be toggleable shortly.", "https://projectsekai.fandom.com/wiki/Yoisaki_Kanade", null)
        await interaction.reply({
            embeds: [embeds]
        });
	},
};