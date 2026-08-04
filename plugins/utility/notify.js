const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { embed } = require('../../functions/embed.js');
const Sequelize = require('sequelize');

const fundb = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	// SQLite only
	storage: 'fundb.sqlite',
});

const notify = fundb.define('notify', {
	userId: {
		type: Sequelize.STRING,
	},
});

module.exports = {
	cooldown: 30,
	data: new SlashCommandBuilder()
		.setName('notify')
		.setDescription('Toggle notifications.')
		.addStringOption(option =>
			option
				.setName('disable')
				.setDescription('Opt out of notifications?')
				.setRequired(true)
				.addChoices(
					{ name: 'Yes', value: 'true' },
					{ name: 'No', value: 'false' },
				)),
	async execute(interaction) {

		// Notify Toggle
		await interaction.deferReply({
			flags: MessageFlags.Ephemeral,
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
		let msg = "";
		switch (interaction.options.getString("disable")) {
			case "true":
				try {
					await notify.create({
						userId: interaction.user.id,
					});
				} catch (error) {
					if (error.name === 'SequelizeUniqueConstraintError') {
						await interaction.editReply({ content: "Already opted out.", flags: MessageFlags.Ephemeral });
						return
					}
					throw error;
				}
				msg = 'You have opted out of notifications.'
				break;
			case "false":
				const rowCount = await notify.destroy({ where: { userId: interaction.user.id } })
				if (!rowCount) {
					await interaction.editReply({ content: "Already opted in.", flags: MessageFlags.Ephemeral });
					return
				}
				msg = 'You have opted into notifications.'
				break;
		}
		msg = await embed("Notify", msg, null, null);
        await interaction.editReply({
            embeds: [msg],
			flags: MessageFlags.Ephemeral
        });
        return;
	},
};