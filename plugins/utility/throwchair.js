const Sequelize = require('sequelize');
const { dmNotify } = require('../../functions/notify.js');
const { SlashCommandBuilder, MessageFlags, InteractionContextType } = require('discord.js');
const { embed } = require('../../functions/embed.js');
const { optOutChk } = require('../../functions/optOut.js');
const { addCommandsUsed } = require('../../functions/usageData.js');
const { expGain } = require('../../functions/currency.js');

const sequelize = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    // SQLite only
    storage: 'database.sqlite',
});

const fundb = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    // SQLite only
    storage: 'fundb.sqlite',
});


module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
		.setName('throwchair')
	    .setDescription('throw a chair lol')
		.addUserOption(option =>
			option
				.setName('user')
				.setRequired(true)
				.setDescription('The person to hug.'))
		.addBooleanOption(option =>
			option
				.setName('notify')
				.setDescription('Whether or not to notify the person. Defaults to false.'))
	    .setIntegrationTypes([0,1])
	    .setContexts([0,1,2]),
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

		// Send Embed!
        let title = "Chair";
        let description = `${interaction.user.displayName} threw a chair (:chair:) towards ${interaction.options.getUser("user").displayName}`
		const throwEmbed = await embed(title, description, null, null)
		await interaction.editReply({
			embeds: [throwEmbed], withResponse: true
		});

		// DM Notify
		let notifdesc = `${interaction.user.displayName} threw a chair (:chair:) at you in ${embedMessage.resource.message.url}!`;
		let notify = interaction.options.getBoolean("notify");
		if (notify == null) {
			notify = false;
		}
		if (notify && interaction.contextType !== InteractionContextType.PrivateChannel) {
			await dmNotify(interaction.options.getUser("user"), notifdesc, null, null);
		}
        return;
    }
};