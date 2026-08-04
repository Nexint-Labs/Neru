const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { embed } = require('../../functions/embed.js');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
		.setName('credits')
	    .setDescription('NeruBot Credits!')
	    .setIntegrationTypes([0,1])
	    .setContexts([0,1,2]),
    async execute(interaction) {
        
        // Credits for MikuBot
        let msg = "";
        msg += "- Jesus Christ, our Lord and Savior"
        msg += "\n- https://seka.ing for some event related stuff (real)"
        msg += "\n- @Nexint on YT (main developer)"
        msg += "\n- You, for using this bot! (Thank you for the support <3)"
		msg = await embed("Credits", msg, null, null);
        await interaction.reply({
            embeds: [msg],
			flags: MessageFlags.Ephemeral
        });
        return;
    }
};