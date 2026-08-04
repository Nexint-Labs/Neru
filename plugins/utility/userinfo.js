const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { queryUser } = require('../../functions/usageData.js');
const { convNameToID } = require('../../functions/currency.js');
const { getUser } = require('../../functions/shardInfo.js');
const { embed } = require('../../functions/embed.js');

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('userinfo')
		.setDescription('Info about a specific user (defaults to you)!')
		.addUserOption(option =>
			option
				.setName('user')
				.setDescription('The person to gather info from.'))
		.addStringOption(option =>
			option
				.setName('name')
				.setDescription('The person to gather info from by name. Overridden by user.'))
		.addStringOption(option =>
			option
				.setName('id')
				.setDescription('The person to gather info from by ID. Overridden by user.'))
		.setIntegrationTypes([0, 1])
		.setContexts([0, 1, 2]),
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
				let msg = await embed("User Info", "This user does not exist.", null, null);
				await interaction.editReply({
					embeds: [msg],
					flags: MessageFlags.Ephemeral
				});
				return
			}
		}

		// Query the user data
		let currentUser = await queryUser(guildMember);
		let registerDate;
		if (currentUser != null) {
			registerDate = Math.round(currentUser.registerDate / 1000);
		}
		let msg = "";

		// Output stats
		if (currentUser != null) {
			msg = msg + `**Personal Stats:**\n`;
			msg = msg + `Username: ${currentUser.name}\n`;
			msg = msg + `User ID: ${currentUser.userId}\n`;
			msg = msg + `Registry Date: <t:${registerDate}:f>\n`;
			msg = msg + `Commands run: ${currentUser.value}\n\n`;
		} else {
			msg = msg + `There are no personal stats available.\n`;
			msg = msg + `This account is likely opted out.\n`;

		}
		msg = await embed("User Info", msg, null, null);
		await interaction.editReply({
			embeds: [msg],
			flags: MessageFlags.Ephemeral
		});
		return;
	},
};