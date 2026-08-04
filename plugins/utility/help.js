const { SlashCommandBuilder, MessageFlags, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { embed } = require('../../functions/embed.js');
const { devID } = require("../../config.js");

module.exports = {
	cooldown: 3,
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Need help tinkering?')
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

		// Begin help menu
		let helpArray = [];
		if (interaction.user.id == devID) {
			helpArray.push("**Bot Owner commands:**");
			helpArray.push("- No extra commands available at the moment.");
		}

		// Currency stuff
		if (interaction.guild != null) {
			helpArray.push("**Currency commands:**");
			helpArray.push("-# These commands only work in servers or in Bot DMs.");
			helpArray.push("- /apply: Applies for a job.");
			helpArray.push("- /bal: Check balance of a user.");
			helpArray.push("- /baltop: Check the global baltop.");
			helpArray.push("- /beg: Beg for coins.");
			helpArray.push("- /cf Coinflip a set amount of coins.");
			helpArray.push("- /deposit: Deposit money into the bank.");
			helpArray.push("- /give: Give an item to someone else.");
			helpArray.push("- /inv: View the items you have!");
			helpArray.push("- /pay: Pay someone else money.");
			helpArray.push("- /shop: Shop for items.");
			helpArray.push("- /rob: Rob people of their money.");
			helpArray.push("- /rob-toggle: Toggle if you want to steal money or not.");
			helpArray.push("- /snakeeye: Snake eyes.");
			helpArray.push("- /profile: Views a user's profile.");
			helpArray.push("- /use: Use items.");
			helpArray.push("- /withdraw: Withdraws money into the bank.");
			helpArray.push("- /work: Work for money.");
		}

		// Fun stuff
		helpArray.push("**Fun commands:**");
		helpArray.push("-Vocaloid Gifs-");
		helpArray.push("- /miku: Sends a Miku gif.");
		helpArray.push("- /teto: Sends a Teto gif.");
		helpArray.push("- /luka: Sends a Luka gif.");
		helpArray.push("- /rin: Sends a Rin gif.");
		helpArray.push("- /len: Sends a Len gif.");
		helpArray.push("- /meiko: Sends a Meiko gif.");
		helpArray.push("- /luka: Sends a Luka gif.");

		// Action Commands
		helpArray.push("-Action Gifs-");
		helpArray.push("- /boop: Boops someone!");
		helpArray.push("- /hug: Hugs someone!");
		helpArray.push("- /pat: Pats someone!");
		helpArray.push("- /wave: Waves towards someone!");
		helpArray.push("- /poke: Pokes someone!");
		helpArray.push("- /punch: Punches someone.");
		helpArray.push("- /kill: Self explanatory...");

		// other
		helpArray.push("-Other-");
		helpArray.push("- /8ball: 8ball.");
		helpArray.push("- /coinflip: Coinflip, without the stakes.");
		helpArray.push("- /bean: bean.");
		helpArray.push("- /minori: Small (minori) spelling mistake.");

		// Fun stuff
		helpArray.push("**Sekai commands:**");
		helpArray.push("- /gif-pjsk: Gif of a Project Sekai character.");
		helpArray.push("- /tierlb: Tierer leaderboard. Powered by seka.ing.");
		helpArray.push("- /kanade: Sends a Kanade gif.");

		// Utils
		helpArray.push("**Utility commands:**");
		helpArray.push("- /gospel: Provides the link to the Christian Gospel.");
		helpArray.push("- /help: Provides this help menu.");
		helpArray.push("- /info: Provides an info manual about the bot.");
		helpArray.push("- /notify: Opt in / out of notifications.");
		helpArray.push("- /data-opt-in: Opt in towards data collection.");
		helpArray.push("- /data-opt-out: Opt out towards data collection.");
		helpArray.push("- /ping: Checks ping of all related clusters.");
		helpArray.push("- /support: Link to our support server.");
		helpArray.push("- /updatelog: Update log for MikuBot.");

		// Silly stuff
		helpArray.push("**Silly commands:**");
		helpArray.push("- /kana: Kana kana kanade!.");
		helpArray.push("- /mizuover: It's so Mizuover.");

		let page = 1;
		let pageSize = 10;
		let maxPage = Math.ceil(helpArray.length / pageSize);
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
			helpMessage = "";
			for (let i = (page - 1) * pageSize; i < Math.min(pageSize + ((page - 1) * pageSize), helpArray.length); i++) {
				helpMessage += "\n" + helpArray[i];
			}
			helpMessage += `\n--- Page (${page}/${maxPage}) ---`;
			helpMessage = await embed("Help", helpMessage, null, null);
		}

		await store();

		// Send the reply
		await interaction.editReply({
			embeds: [helpMessage],
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
					embeds: [helpMessage],
					components: [row],
					withResponse: true,
					withReply: true
				})
				await shop();
				return;
			} catch (error) {

				// Interaction Collector Errors
				if (error.name == "Error [InteractionCollectorError]") {
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
                        } catch {}
					}
				} else if (error.name != "Unknown interaction") {
					console.log(error.name);
					throw error;
				}
			}
		}

		await shop();

	},
};