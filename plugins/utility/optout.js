const { SlashCommandBuilder, MessageFlags, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { optOutIntChk } = require('../../functions/optOutIntChk.js');
const { optOutCurrency } = require('../../functions/currency.js');
const { optOutAction } = require('../../functions/actionCmds.js');
const { optOutUsageData } = require('../../functions/usageData.js');
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
        .setName('data-opt-out')
        .setDescription('Opt out from data collection. Disables certain features and anonymizes all future data.'),
    async execute(interaction) {

        // defer replies
        const response = await interaction.deferReply({
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
        let guildMember = interaction.user;
        let value = await optOutIntChk(guildMember);
        if (value == -1) {
            await interaction.editReply({
                content: "You are already opted out. This command does not work.",
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        // confirm / cancel row
        const confirm = new ButtonBuilder()
            .setCustomId('confirm')
            .setLabel('Confirm')
            .setStyle(ButtonStyle.Success);
        const cancel = new ButtonBuilder()
            .setCustomId('cancel')
            .setLabel('Cancel')
            .setStyle(ButtonStyle.Secondary);

        // actual action row
        const row = new ActionRowBuilder()
            .addComponents(cancel, confirm);
        let msg = await embed("Opt out", "Are you sure you want to opt out?\n\n-# This command resets your entire currency profile on all servers.", null, null);
        await interaction.editReply({
            embeds: [msg],
            components: [row],
            withResponse: true,
        });

        const collectorFilter = i => i.user.id === interaction.user.id;
        try {
            const confirmation = await response.resource.message.awaitMessageComponent({ filter: collectorFilter, time: 30_000 });

            if (confirmation.customId === 'confirm') {
                try {

                    // opt out action commands
                    let optOutValue = await optOutAction(interaction);
                    if (optOutValue == false) {
                        msg = await embed("Opt out", "Something went wrong while trying to opt you out. Contact @Nexint on Discord, and send a screenshot of this message with the timestamp and date.\n-#Where this happened: Opting-out action cmds.", null, null);
                        await confirmation.update({
                            embeds: [msg],
                            components: [],
                            flags: MessageFlags.Ephemeral,
                            withResponse: true,
                        });
                        return;
                    }

                    // opt out currency
                    optOutValue = await optOutCurrency(interaction);
                    if (optOutValue == false) {
                        msg = await embed("Opt out", "Something went wrong while trying to opt you out. Contact @Nexint on Discord, and send a screenshot of this message with the timestamp and date.\n-#Where this happened: Opting-out action cmds.", null, null);
                        await confirmation.update({
                            embeds: [msg],
                            components: [],
                            flags: MessageFlags.Ephemeral,
                            withResponse: true,
                        });
                        return;
                    }
                    // opt out usage data
                    optOutValue = await optOutUsageData(interaction);
                    if (optOutValue == false) {
                        msg = await embed("Opt out", "Something went wrong while trying to opt you out. Contact @Nexint on Discord, and send a screenshot of this message with the timestamp and date.\n-#Where this happened: Opting-out user data.", null, null);
                        await confirmation.update({
                            embeds: [msg],
                            components: [],
                            flags: MessageFlags.Ephemeral,
                            withResponse: true,
                        });
                        return;
                    }

                    await optOut.create({
                        author: interaction.user.id,
                    });
                    msg = await embed("Opt out", "Opted out from data collection! - Note that your ID is still stored to opt you out.\n\n-# Certain services will not work for you. Moderation functions and notification settings in this bot still require your username and / or ID.", null, null);
                    await confirmation.update({
                        embeds: [msg],
                        components: [],
                        flags: MessageFlags.Ephemeral,
                        withResponse: true,
                    });
                    console.log("[" + DateFormatter.format(Date.now()) + `] [INFO] ${interaction.user.id} has opted out.`);
                }
                catch (error) {
                    throw error;
                }
            } else if (confirmation.customId === 'cancel') {

                msg = await embed("Opt out", "Opt-out cancelled.", null, null);
                await confirmation.update({
                    embeds: [msg],
                    components: [],
                    flags: MessageFlags.Ephemeral,
                    withResponse: true,
                });
            }
        } catch (error) {
            if (error.name.toLowerCase().includes("[InteractionCollectorError]".toLowerCase())) {
                await interaction.editReply({ content: 'Confirmation not received within 30 seconds, cancelling', components: [] });
            } else if (error.name != "Unknown interaction") {
                console.log(error.name);
                throw error;
            }
        }



    },
};