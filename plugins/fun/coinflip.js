const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { addCommandsUsed } = require('../../functions/usageData.js');
const { embed } = require('../../functions/embed.js');

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('cf')
		.setDescription('Coinflip, without the stakes.')
		.addStringOption(option =>
			option
				.setName('side')
				.setDescription('Heads or tails?')
				.setRequired(true)
				.addChoices(
					{ name: 'Heads', value: 'heads' },
					{ name: 'Tails', value: 'tails' },
				))
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

		// rng
		let rng = Math.random();

		// coinflip logic
		let coinToss = "heads";
		if (rng < 0.5) {
			coinToss = "tails"
		}

		let answer = `You flipped a coin, and the coin shows ${coinToss}.`;

		// Add to analytics
		addCommandsUsed(interaction.user);

		// Send reply
        const embeds = await embed("Fun Coinflip", answer, null, null)
        await interaction.reply({
            embeds: [embeds]
        });
	},
};