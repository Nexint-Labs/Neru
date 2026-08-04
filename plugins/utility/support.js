const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { embed } = require('../../functions/embed.js');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
		.setName('support')
	    .setDescription('Need support? Here\'s our support server!')
	    .setIntegrationTypes([0,1])
	    .setContexts([0,1,2]),
    async execute(interaction) {

        // Support message
        let msg = await embed("Support", "Check out our Discord support server here! https://discord.nexint.ca/", null, null);
        await interaction.reply({
            embeds: [msg],
			flags: MessageFlags.Ephemeral
        });
        return;
    }
};