const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { client } = require('../../bot.js');
const { embed } = require('../../functions/embed.js');

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Check each shard\'s ping!')
		.setIntegrationTypes([0, 1])
		.setContexts([0, 1, 2]),
	async execute(interaction) {
		
		// Defer the reply to check for ping
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
		let ping = "";
		let results = await client.cluster.broadcastEval(client => {
			// This code runs on each individual shard
			return {
				shardId: client.cluster.id,
				ping: Math.round(client.ws.ping),
			};
		})

		// Output ping
		results.forEach(shardInfo => {
			ping = ping + `\n• Cluster #${shardInfo.shardId} | Ping: ${shardInfo.ping}ms`;
		})
		let msg = await embed("Ping", `Miku Ping:\n${ping}`, null, null);
        await interaction.editReply({
            embeds: [msg],
			flags: MessageFlags.Ephemeral
        });
        return;
	},
};