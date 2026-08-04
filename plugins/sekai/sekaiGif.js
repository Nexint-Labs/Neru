const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { klipyKey } = require('../../config.js');
const { characterSelectPJSK } = require('../../functions/sekai.js');
const { searchGif } = require('../../functions/gifs.js');
const { embed } = require('../../functions/embed.js');
const { addCommandsUsed } = require('../../functions/usageData.js');
const { expGain } = require('../../functions/currency.js');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('gif-pjsk')
        .setDescription('Pulls a Project Sekai gif!')
		.addStringOption(option =>
			option
				.setName('character')
				.setDescription('Which character?')
				.setRequired(true)
				.addChoices(
					{ name: 'Ichika', value: 'ichika' },
					{ name: 'Saki', value: 'saki' },
					{ name: 'Honami', value: 'honami' },
					{ name: 'Shiho', value: 'shiho' },
					{ name: 'Minori', value: 'minori' },
					{ name: 'Haruka', value: 'haruka' },
					{ name: 'Airi', value: 'airi' },
					{ name: 'Shizuku', value: 'shizuku' },
					{ name: 'Kohane', value: 'kohane' },
					{ name: 'An', value: 'an' },
					{ name: 'Ak*to', value: 'akito' },
					{ name: 'Toya', value: 'toya' },
					{ name: 'Tsukasa', value: 'tsukasa' },
					{ name: 'Emu', value: 'emu' },
					{ name: 'Nene', value: 'nene' },
					{ name: 'Rui', value: 'rui' },
					{ name: 'Kanade', value: 'kanade' },
					{ name: 'Mafuyu', value: 'mafuyu' },
					{ name: 'Ena', value: 'ena' },
					{ name: 'Mizuki', value: 'mizuki' },
				))
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

        // Character switcher
        let character = await characterSelectPJSK(interaction.options.getString("character"));

		// Add to analytics
		addCommandsUsed(interaction.user);

        // Level Gain (50/50)
        if(interaction.guild != null && Math.random() > 0.5){
            await expGain(interaction.user);
        }

        // Search for Gif
        const results = await searchGif(`${character} project sekai`)

        // Configure the gif response
        let description = `-# Via Klipy API. Outputs are not monitored.`;
        let title = `Found a(n) ${character} Gif!`;

        // Send gif
        const pjsk = await embed(title, description, results.url, results.shortURL)
        await interaction.editReply({
            embeds: [pjsk]
        });
        return;
    }
};