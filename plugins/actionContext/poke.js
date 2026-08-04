const Sequelize = require('sequelize');
const { ContextMenuCommandBuilder, MessageFlags } = require('discord.js');
const { klipyKey } = require('../../config.js');
const { searchGif } = require('../../functions/gifs.js');
const { embed } = require('../../functions/embed.js');
const { optOutChk } = require('../../functions/optOut.js');
const { addCommandsUsed } = require('../../functions/usageData.js');

const fundb = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	// SQLite only
	storage: 'fundb.sqlite',
});

const poke = fundb.define('poke', {
	userId: {
		type: Sequelize.STRING,
	},
	pokeId: {
		type: Sequelize.STRING,
	},
	value: {
		type: Sequelize.INTEGER,
	},
});

module.exports = {
	cooldown: 5,
	data: new ContextMenuCommandBuilder()
        .setName('Poke!')
        .setType(3)
        .setIntegrationTypes([0, 1])
        .setContexts([0, 1, 2]),
	async execute(interaction) {
        // defer Reply
		const embedMessage = await interaction.deferReply({
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

		// Opt-out check
		let optedOut = await optOutChk(interaction.user, interaction.targetMessage.author);

		// Add to analytics
		addCommandsUsed(interaction.user);

		// Search for gif
		const results = await searchGif("anime poke");
		let findPokes;

		// What should the description be?
		let description = `One of you has opted out of data collection.\n-# Via Klipy API.`;
		if (!optedOut) {
			findPokes = await poke.findOne({
				where: {
					userId: interaction.user.id,
					pokeId: interaction.targetMessage.author.id
				}
			});
			if (findPokes === null) {
				await poke.create({
					userId: interaction.user.id,
					pokeId: interaction.targetMessage.author.id,
					value: 1
				});
				findPokes = await poke.findOne({
					where: {
						userId: interaction.user.id,
						pokeId: interaction.targetMessage.author.id
					}
				});
			} else {
				findPokes.value += 1;
				await findPokes.save();
			}
			description = `${interaction.user.displayName} has poked ${interaction.targetMessage.author.displayName} ${findPokes.value} time(s)! ༼ つ ◕_◕ ༽つ\n-# Via Klipy API.`;
		}

		// Title?
		let title = `${interaction.user.displayName} pokes ${interaction.targetMessage.author.displayName}! ༼ つ ◕_◕ ༽つ`;

		// Send Embed!
		const pokeEmbed = await embed(title, description, results.url, results.shortURL)
		await interaction.editReply({
			embeds: [pokeEmbed], withResponse: true
		});
		return;
	},
};