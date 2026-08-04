const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { abbrevBalance } = require('../../functions/abbrevValues.js');
const { embed } = require('../../functions/embed.js');
const Sequelize = require('sequelize');

const currency = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	// SQLite only
	storage: 'currency.sqlite',
});

// Databases used.
const balance = currency.define('balance', {
	userId: {
		type: Sequelize.STRING,
	},
	name: {
		type: Sequelize.STRING,
	},
	value: {
		type: Sequelize.DOUBLE,
	},
	multiplier: {
		type: Sequelize.DOUBLE,
	}
});

const bank = currency.define('bank', {
	userId: {
		type: Sequelize.STRING,
	},
	name: {
		type: Sequelize.STRING,
	},
	value: {
		type: Sequelize.DOUBLE,
	},
	maxValue: {
		type: Sequelize.DOUBLE,
	}
});

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('baltop')
		.setDescription('Views balance of the top people, globally.')
		.addStringOption(option =>
			option.setName('leaderboard')
				.setDescription('The leaderboard to view.')
				.setRequired(true)
				.addChoices(
					{ name: 'Wallet', value: 'Wallet' },
					{ name: 'Bank', value: 'Bank' },
				)),
	async execute(interaction) {

		// defer reply
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

		// shortened?
		let shortened = true;
		let page = 1;
		let pageLength = 10;
		let maxPage;

		// build message
		const embedBuild = async function () {

			// Prepare message
			let lbMsg = "";
			let lb;
			switch (interaction.options.getString("leaderboard")) {
				case "Wallet":
					lb = await balance.findAll({
						order: [
							['value', 'DESC'],
						],
						limit: 50
					})
					break;
				case "Bank":
					lb = await bank.findAll({
						order: [
							['value', 'DESC'],
						],
						limit: 50
					})
					break;
			}
			if (lb.length == 0) {
				lbMsg += "\nNo leaderboard at the moment for this category."
				lbMsg += "\n-# Coded by Nexint. © All Rights Reserved."
				return await embed(interaction.options.getString("leaderboard") + " leaderboard:", lbMsg, null, null);
			}
			maxPage = lb.length / pageLength
			for (let i = (page - 1) * 10; i < ((page - 1) * 10) + pageLength; i++) {
				let coins = await abbrevBalance(lb[i].value)
				if (shortened) {
					lbMsg += `\n#${i + 1}: \`${lb[i].name}\` (${coins.displayValue} coins)`
				} else {
					lbMsg += `\n#${i + 1}: \`${lb[i].name}\` (${coins.value} coins)`
				}
			}


			// return embed
			return await embed(interaction.options.getString("leaderboard") + " leaderboard:", lbMsg, null, null);
		}

		// embed
		let userEmbed = await embedBuild();

		// row builder
		const rowBuild = async function () {

			// Build rows
			let rows = new ActionRowBuilder();
			rows.addComponents(
				new ButtonBuilder()
					.setCustomId("prev")
					.setLabel('<')
					.setStyle(ButtonStyle.Primary)
			);
			rows.addComponents(
				new ButtonBuilder()
					.setCustomId("next")
					.setLabel('>')
					.setStyle(ButtonStyle.Primary)
			);
			rows.addComponents(
				new ButtonBuilder()
					.setCustomId("refresh")
					.setLabel('🔄')
					.setStyle(ButtonStyle.Secondary)
			);
			if (shortened) {
				rows.addComponents(
					new ButtonBuilder()
						.setCustomId("short")
						.setLabel('Short? ✔')
						.setStyle(ButtonStyle.Success)
				);
			} else {
				rows.addComponents(
					new ButtonBuilder()
						.setCustomId("short")
						.setLabel('Short? ❌')
						.setStyle(ButtonStyle.Danger)
				);
			}
			return rows;
		}
		let row = await rowBuild();

		// send reply
		await interaction.editReply({
			embeds: [userEmbed],
			components: [row],
		});

		// balance refresh function (for balanceLeaderboard)
		const balRefresh = async function () {
			const collectorFilter = i => i.user.id === interaction.user.id;
			try {
				const confirmation = await response.resource.message.awaitMessageComponent({ filter: collectorFilter, time: 120_000 });

				// prev / next
				if (confirmation.customId == "prev") {
					page -= 1;
					if (page < 1) {
						page = maxPage;
					}
					row = await rowBuild();
					userEmbed = await embedBuild();
					await confirmation.update({
						embeds: [userEmbed],
						components: [row],
						withResponse: true,
						withReply: true
					})
					await balRefresh();
					return;
				}
				if (confirmation.customId == "next") {
					page += 1;
					if (page > maxPage) {
						page = 1;
					}
					row = await rowBuild();
					userEmbed = await embedBuild();
					await confirmation.update({
						embeds: [userEmbed],
						components: [row],
						withResponse: true,
						withReply: true
					})
					await balRefresh();
					return;
				}

				// Toggle short
				if (confirmation.customId == "short") {
					shortened = !shortened;
					row = await rowBuild();
					userEmbed = await embedBuild();
					await confirmation.update({
						embeds: [userEmbed],
						components: [row],
						withResponse: true,
						withReply: true
					})
					await balRefresh();
					return;
				}

				// Refresh
				if (confirmation.customId == "refresh") {
					row = await rowBuild();
					userEmbed = await embedBuild();
					await confirmation.update({
						embeds: [userEmbed],
						components: [row],
						withResponse: true,
						withReply: true
					})
					await balRefresh();
					return;
				}
				return;
			} catch (error) {

				// Interaction Collector Errors
                if (error.name.toLowerCase().includes("[InteractionCollectorError]".toLowerCase())) {
                    if (response.resource.message.components[0] !== undefined) {
                        // Map over the components in the action row and disable each one
                        const disabledComponents = response.resource.message.components[0].components.map(component => {
                            // Use the ButtonBuilder.from() method to create a mutable button object from the existing data
                            return ButtonBuilder.from(component.data).setDisabled(true);
                        });

                        // Create a new ActionRowBuilder with the now-disabled buttons
                        const updatedRow = new ActionRowBuilder().addComponents(disabledComponents);

                        try {
                            await interaction.editReply({
                                components: [updatedRow]
                            });
                        } catch { }
                    }
                } else if (error.name != "Unknown interaction") {
                    console.log(error.name);
                    throw error;
                }
			}
		}

		await balRefresh();
		return;
	},
};