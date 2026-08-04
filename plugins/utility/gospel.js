const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { embed } = require('../../functions/embed.js');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
		.setName('gospel')
	    .setDescription('Gives a link to the Christian Gospel')
	    .setIntegrationTypes([0,1])
	    .setContexts([0,1,2]),
    async execute(interaction) {
        
        // Gospel message
		let msg = await embed("Gospel", "Check out the Christian Gospel here! https://the-gospel.xyz", null, null);
        await interaction.reply({
            embeds: [msg],
			flags: MessageFlags.Ephemeral
        });
        return;
    }
};