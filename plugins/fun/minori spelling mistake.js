const { SlashCommandBuilder } = require('discord.js');
const { addCommandsUsed } = require('../../functions/usageData.js');
const { embed } = require('../../functions/embed.js');

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('minori')
		.setDescription('Minori spelling mistake.')
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
        const embeds = await embed("Minori spelling mistake", "Small spelling mistake 💀", "https://tenor.com/view/minori-hanasato-minori-pjsk-more-more-jump-project-sekai-pjsk-gif-10970315925687936087", "https://media.tenor.com/mD5kNhBwpFcAAAAC/minori-hanasato-minori-pjsk.gif")
        await interaction.reply({
            embeds: [embeds]
        });
	},
};