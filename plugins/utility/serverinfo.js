const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { queryUser } = require('../../functions/usageData.js');
const { convNameToID } = require('../../functions/currency.js');
const { getUser } = require('../../functions/shardInfo.js');
const { embed } = require('../../functions/embed.js');

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('serverinfo')
		.setDescription('Info about this specific server!'),
	async execute(interaction) {

		// Defer the reply to check for stuff
		await interaction.deferReply({
			flags: MessageFlags.Ephemeral
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

		// Output stats
        // Fetch the specific guild
        const guild = interaction.guild;

        // Get the member count
        const memberCount = guild.memberCount;

		// owner
		const owner = await guild.fetchOwner();

		// define msg
		let msg = "";
		msg = msg + `Total Members: ${memberCount}\n`;
		msg = msg + `Owner: ${owner.displayName} (${owner.user.username} / ${owner.id})\n`;
		msg = msg + `Locale: ${guild.preferredLocale}\n`;
		msg = msg + `Max members: ${guild.maximumMembers}\n`;
		msg = msg + `ID: ${guild.id}\n`;
		msg = msg + `Your join date: <t:${Math.round(guild.joinedTimestamp / 1000)}:R>\n`;
		msg = msg + `Guild creation date: <t:${Math.round(guild.createdTimestamp / 1000)}:R>\n`;
		msg = msg + `Large?: ${guild.large}\n`;

		// embed and return
		msg = await embed("Server Info", msg, null, null);
		await interaction.editReply({
			embeds: [msg],
			flags: MessageFlags.Ephemeral
		});
		return;
	},
};