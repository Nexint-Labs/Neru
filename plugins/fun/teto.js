const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { klipyKey } = require('../../config.js');
const { searchGif } = require('../../functions/gifs.js');
const { embed } = require('../../functions/embed.js');
const { addCommandsUsed } = require('../../functions/usageData.js');
const { expGain } = require('../../functions/currency.js');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('teto')
        .setDescription('Pulls a gif of Teto!')
        .setIntegrationTypes([0, 1])
        .setContexts([0, 1, 2]),
    async execute(interaction) {
        // defer Reply
		await interaction.deferReply({
			withResponse: true,
		});

        const { isBlacklisted } = require('../../functions/blacklist.js');
        const { server } = require('../../config.js');
        if (await isBlacklisted(interaction.user.id, server)) {
            let msg = await embed("Warning", "You have been blacklisted from all Nexint services.", null, null);
            await interaction.editReply({
                embeds: [msg]
            });
            return;
        }

        // Check for klipy key
        if (klipyKey == "") {
            await interaction.editReply({
                content: "The bot owner didn't set up an API key for Klipy.",
                flags: MessageFlags.Ephemeral
            });
            return;
        }

		// Add to analytics
		addCommandsUsed(interaction.user);

        // Level Gain (50/50)
        if(interaction.guild != null && Math.random() > 0.5){
            await expGain(interaction.user);
        }

        // Search for Gif
        const results = await searchGif("kasane teto")

        // Configure the gif response
        let description = `Via Klipy API.`;
        let title = `Found a Teto Gif!`;

        // Send gif
        const teto = await embed(title, description, results.url, results.shortURL)
        await interaction.editReply({
            embeds: [teto]
        });
        return;
    }
};