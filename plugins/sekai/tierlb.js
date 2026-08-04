const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { sekaiToken } = require('../../config.js');
const { embed } = require('../../functions/embed.js');
const { abbrevBalance } = require('../../functions/abbrevValues.js');
const { addCommandsUsed } = require('../../functions/usageData.js');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('tierlb')
        .setDescription('Project Sekai Tierer Leaderboard.')
        .setIntegrationTypes([0, 1])
        .setContexts([0, 1, 2]),
    async execute(interaction) {
		// Defer reply
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

        // Add to analytics
        addCommandsUsed(interaction.user);

        // fetch
        const update = await fetch('https://seka.ing/api/leaderboard', {
            method: 'GET',
            headers: {
                'Authorization': `${sekaiToken}`,
                'Content-Type': `application/json`
            }
        });
        const event = await update.json();

        let page = 1;
        let pageSize = 10;
        let maxPage = 10;

        // form reply
        let msg = "";

        // Action row for items
        const row = new ActionRowBuilder();
        row.addComponents(
            new ButtonBuilder()
                .setCustomId("back")
                .setLabel('<--')
                .setStyle(ButtonStyle.Secondary)
        );
        row.addComponents(
            new ButtonBuilder()
                .setCustomId("prev")
                .setLabel('<')
                .setStyle(ButtonStyle.Primary)
        );
        row.addComponents(
            new ButtonBuilder()
                .setCustomId("next")
                .setLabel('>')
                .setStyle(ButtonStyle.Primary)
        );
        row.addComponents(
            new ButtonBuilder()
                .setCustomId("max")
                .setLabel('-->')
                .setStyle(ButtonStyle.Secondary)
        );

        // Helper function

        const store = async function () {
            let lbName = `Event: ${event.event.name}`;
            msg = "";
            for (let i = (page - 1) * pageSize; i < Math.min(pageSize + ((page - 1) * pageSize), event.rankings.length); i++) {
                msg += `\`Rank ${event.rankings[i].rank}: ${event.rankings[i].name} (${(await abbrevBalance(event.rankings[i].score)).displayValue} points)\`\n`
            }
            msg += `-# Powered by https://seka.ing/`
            msg = await embed(lbName, msg, "https://seka.ing", `https://seka.ing/assets/${event.event.name_key}.png`)
        }

        await store();

        // Send the reply
        await interaction.editReply({
            embeds: [msg],
            components: [row],
            withResponse: true,
            withReply: true
        });

        // Shop function
        const shop = async function () {
            const collectorFilter = i => i.user.id === interaction.user.id;
            try {
                const confirmation = await response.resource.message.awaitMessageComponent({ filter: collectorFilter, time: 120_000 });

                if (confirmation.customId == "back") {
                    page = 1;
                }
                if (confirmation.customId == "prev") {
                    page -= 1;
                    if (page < 1) {
                        page = maxPage;
                    }
                }
                if (confirmation.customId == "next") {
                    page += 1;
                    if (page > maxPage) {
                        page = 1;
                    }
                }
                if (confirmation.customId == "max") {
                    page = maxPage
                }
                await store();
                await confirmation.update({
                    embeds: [msg],
                    components: [row],
                    withResponse: true,
                    withReply: true
                })
                await shop();
                return;
            } catch (error) {

                // Interaction Collector Errors
                if (error.name == "Error [InteractionCollectorError]") {
                    // Map over the components in the action row and disable each one
                    const disabledComponents = response.resource.message.components[0].components.map(component => {
                        // Use the ButtonBuilder.from() method to create a mutable button object from the existing data
                        return ButtonBuilder.from(component.data).setDisabled(true);
                    });

                    // Create a new ActionRowBuilder with the now-disabled buttons
                    const updatedRow = new ActionRowBuilder().addComponents(disabledComponents);

                    await interaction.editReply({
                        components: [updatedRow]
                    });
                } else if (error.name != "Unknown interaction") {
					console.log(error.name);
					throw error;
				}
            }
        }

        await shop();
        await interaction.editReply(msg);
        return;
    }
};