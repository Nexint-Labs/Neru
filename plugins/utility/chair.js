const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { embed } = require('../../functions/embed.js');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('chair')
        .setDescription('Place a chair lol')
        .setIntegrationTypes([0, 1])
        .setContexts([0, 1, 2]),
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

        // Teto advertising message
        let msg = await embed("Chair", "You have placed a chair.\n:chair:", null, null);
        await interaction.reply({
            embeds: [msg]
        });
        return;
    }
};