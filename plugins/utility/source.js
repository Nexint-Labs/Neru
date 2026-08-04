const { SlashCommandBuilder } = require('discord.js');
const { embed } = require('../../functions/embed.js');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
		.setName('source')
	    .setDescription('Source code of Mikubot.')
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

        // Support message
        let msg = await embed("Source", "MikuBot's source code is available here! https://github.com/Nexints/MikuBot", null, null);
        await interaction.reply({
            embeds: [msg]
        });
        return;
    }
};