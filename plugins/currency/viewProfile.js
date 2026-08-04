const { SlashCommandBuilder, MessageFlags, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { optOutIntChk } = require('../../functions/optOutIntChk.js');
const { queryItem, convItem, convNameToID } = require('../../functions/currency.js');
const { queryUser } = require('../../functions/usageData.js');
const { getUser } = require('../../functions/shardInfo.js');
const { embed, embedPlusDesc } = require('../../functions/embed.js');
const { balanceCheck, bankCheck, miscCheck, workCheck } = require('../../functions/currency.js');
const { abbrevBalance } = require('../../functions/abbrevValues.js');
const { jobs } = require('./config.js')
const { devMode, devMsg } = require('../../config.js');

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('profile')
		.setDescription('Views the profile of anyone.')
		.addUserOption(option =>
			option
				.setName('user')
				.setDescription('The person\'s profile to check. Defaults to yourself.'))
		.addStringOption(option =>
			option
				.setName('name')
				.setDescription('The person\'s profile to check by name. Overridden by user.'))
		.addStringOption(option =>
			option
				.setName('id')
				.setDescription('The person\'s profile to check. Overridden by user.')),
	async execute(interaction) {

		// defer
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

		// Get current user
		let guildMember = interaction.options.getUser("user");
		if (guildMember === null) {
			let userID = interaction.options.getString("id");
			if (interaction.options.getString("name") !== null && userID === null) {
				userID = await convNameToID(interaction.options.getString("name"));
			}
			if (userID !== null) {
				guildMember = await getUser(userID);
			} else if(interaction.options.getString("name") === null) {
				guildMember = interaction.user;
			}
			if (guildMember === null) {
				let msg = await embed("Profile", "This user does not exist.", null, null);
				await interaction.editReply({
					embeds: [msg],
					flags: MessageFlags.Ephemeral
				});
				return
			}
		}

		// check if opted out
		let value = await optOutIntChk(guildMember);
		if (value == -1) {
			let userEmbed = await embed("Profile", "This person is opted out. Balance commands will not work.", null, null);
			await interaction.editReply({
				embeds: [userEmbed]
			});
			return;
		}

		// shortened values?
		let shortened = true;

		// check for balances
		const embedBuild = async function () {
			let balanceUser = await balanceCheck(guildMember);
			let bankBalanceUser = await abbrevBalance((await bankCheck(guildMember)).value);
			let miscUser = await miscCheck(guildMember);
			let balanceUser2 = await abbrevBalance(balanceUser.value);
			let workUser = await workCheck(guildMember);
			let currentUser = await queryUser(guildMember);

			// Start profile building
			let msg = `${guildMember.displayName}'s profile`;
			if (guildMember.displayName == undefined) {
				msg = `${guildMember.globalName}'s profile`;
			}
			if (guildMember.id == interaction.user.id) {
				msg = `Your profile`;
			}
			let msgProfile = "";
			let msgMisc = "";

			// level
			msgProfile += `\nLevel: ${miscUser.level} (${miscUser.exp} exp / ${miscUser.nextLevel})`
			msgMisc += `\nRegistry Date: <t:${Math.round(currentUser.registerDate / 1000)}:f>`

			if (devMode) {
				msgProfile += "\n-# " + devMsg;
			}
			return embedPlusDesc(msg, msgProfile, null, null, "Misc:", msgMisc)
		}
		let userEmbed = await embedBuild();

		// row builder
		const rowBuild = async function () {

			// Build storefront
			let rows = new ActionRowBuilder();
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
			rows.addComponents(
				new ButtonBuilder()
					.setCustomId("refresh")
					.setLabel('🔄')
					.setStyle(ButtonStyle.Secondary)
			);
			return rows;
		}
		let row = await rowBuild();

		// send reply
		await interaction.editReply({
			embeds: [userEmbed],
			components: [row],
		});

		// balance refresh function
		const balRefresh = async function () {
			const collectorFilter = i => i.user.id === interaction.user.id;
			try {
				const confirmation = await response.resource.message.awaitMessageComponent({ filter: collectorFilter, time: 120_000 });

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
	},
};