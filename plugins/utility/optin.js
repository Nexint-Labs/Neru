const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { embed } = require('../../functions/embed.js');
const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    // SQLite only
    storage: 'database.sqlite',
});

const optOut = sequelize.define('optout', {
    author: {
        type: Sequelize.STRING,
        unique: true,
    }
});

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('data-opt-in')
        .setDescription('Opt in to data collection.'),
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

        // Opt-in
        const rowCount = await optOut.destroy({ where: { author: interaction.user.id } })
        let msg;
        if (!rowCount) {
            msg = await embed("Opt in", "Already opted in.", null, null);
            await interaction.reply({
                embeds: [msg],
                flags: MessageFlags.Ephemeral
            });
            return
        }
        msg = await embed("Opt in", "Opted in to data collection.", null, null);
        await interaction.reply({
            embeds: [msg],
			flags: MessageFlags.Ephemeral
        });
        console.log("[" + DateFormatter.format(Date.now()) + `] [INFO] ${interaction.user.id} has opted in.`);
    },
};