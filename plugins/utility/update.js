const { SlashCommandBuilder, MessageFlags, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { embed } = require('../../functions/embed.js');

module.exports = {
	cooldown: 3,
	data: new SlashCommandBuilder()
		.setName('updatelog')
		.setDescription('Bot update log.')
		.setIntegrationTypes([0, 1])
		.setContexts([0, 1, 2]),
	async execute(interaction) {

		// Defer reply
		const response = await interaction.deferReply({
			withResponse: true,
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

		// Begin update log menu
		let updateInfo = [];

		// Version 0.2.1
		updateInfo.push("**Version 0.3.0:**");
		updateInfo.push("- V1 system removed, in favor of V2");
		updateInfo.push("- More in-depth analytics tracking");
		updateInfo.push("- Currency tweaks");
		updateInfo.push("- Fixed negative balances");
		updateInfo.push("- Bug fixes... Many....");

		// Version 0.2.1
		updateInfo.push("**Version 0.2.1:**");
		updateInfo.push("- Added shop and items (+ related commands)");
		updateInfo.push("- New v2 help info");
		updateInfo.push("- New PFP + Banner");
		updateInfo.push("- Quality of life fixes");
		updateInfo.push("- Bugfixes");

		// Version 0.2.0
		updateInfo.push("**Version 0.2.0:**");
		updateInfo.push("- Added currency system");
		updateInfo.push("- Swapped Gif API to Klipy");
		updateInfo.push("- Opt-out support added");
		updateInfo.push("- Analytics tracking added (/info)");
		updateInfo.push("- /tierlb integrates with Seka.ing API");
		updateInfo.push("- Bugfixes");

		// Version 0.1.0
		updateInfo.push("**Version 0.1.0:**");
		updateInfo.push("- Forked from OpenBot development");
		updateInfo.push("- Added Vocaloid Gifs");
		updateInfo.push("- Added action commands");
		let page = 1;
		let pageSize = 10;
		let maxPage = Math.ceil(updateInfo.length / pageSize);
		let helpMessage = "";

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
				.setStyle(ButtonStyle.Secondary)
		);
		row.addComponents(
			new ButtonBuilder()
				.setCustomId("next")
				.setLabel('>')
				.setStyle(ButtonStyle.Secondary)
		);
		row.addComponents(
			new ButtonBuilder()
				.setCustomId("max")
				.setLabel('-->')
				.setStyle(ButtonStyle.Secondary)
		);

		// Helper function
		const store = async function () {
			helpMessage = "";
			for (let i = (page - 1) * pageSize; i < Math.min(pageSize + ((page - 1) * pageSize), updateInfo.length); i++) {
				helpMessage += "\n" + updateInfo[i];
			}
			helpMessage += `\n--- Page (${page}/${maxPage}). ---`;
			helpMessage = await embed("Update Log", helpMessage, null, null);
		}

		await store();


		// Send the reply
		await interaction.editReply({
			embeds: [helpMessage],
			components: [row],
			withResponse: true,
			withReply: true
		});

		// Update Log function
		const updateLog = async function () {
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
					embeds: [helpMessage],
					components: [row],
					withResponse: true,
					withReply: true
				})
				await updateLog();
				return;
			} catch (error) {

				// Interaction Collector Errors
				if (error.name == "Error [InteractionCollectorError]") {
					if (response.resource.message.components[0] !== undefined) {
						const disabledComponents = response.resource.message.components[0].components.map(component => {
							return ButtonBuilder.from(component.data).setDisabled(true);
						});
						const updatedRow = new ActionRowBuilder().addComponents(disabledComponents);

                        try {
                            await interaction.editReply({
                                components: [updatedRow]
                            });
                        } catch {}
					}
				} else if (error.name != "Unknown interaction") {
					console.log(error.name);
					throw error;
				}
			}
		}

		await updateLog();

	},
};