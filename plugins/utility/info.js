const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { queryCommand, queryAllUsers, queryCmds } = require('../../functions/usageData.js');
const { queryBalances, queryBanks } = require('../../functions/currency.js');
const { version, versionID, mikuVer, mikuChannel, botName } = require('../../config.js');
const { client, latestVersion } = require('../../bot.js');
const { embed } = require('../../functions/embed.js');
const { abbrevBalance } = require('../../functions/abbrevValues.js');

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('info')
		.setDescription('Info about the bot!')
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
		
		// bot version
		let outputMsg;
		if (latestVersion > versionID) {
			outputMsg = `${latestVersion - versionID} commits behind.`;
		} else if (latestVersion == 0) {
			outputMsg = `The bot can't check for updates!`;
		} else if (latestVersion < versionID) {
			outputMsg = `${versionID - latestVersion} commits ahead.`;
		} else {
			outputMsg = `Running the latest version.`;
		}

		// build variables
		let guilds = await client.cluster.broadcastEval(`this.guilds.cache.size`);
		let members = await client.cluster.broadcastEval((c) => c.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0));
		let commands = await queryCommand();
		let totalMembers = await queryAllUsers();
		let balances = await queryBalances();
		let banks = await queryBanks();
		let cmdsDay = await queryCmds("day");
		let shardGuilds = client.guilds.cache.size;

		// setup balances
		let totalBalance = 0;
		let totalBank = 0;
		let activeUsers = 0;
		let realCommands = 0;

		// find balances, etc
		await balances.forEach(async (balance) => {
			if (balance.value >= 0) {
				totalBalance += balance.value;
			}
		});
		await banks.forEach((bank) => {
			if (bank.value >= 0) {
				totalBank += bank.value;
			}
		});
		await totalMembers.forEach(async (user) => {
			if ((Date.now() - user.lastUsed) / (60*60*24 * 1000) < 14) {
				activeUsers += 1;
				realCommands += user.value;
			}
		});

		// begin message
		let msg = "";
		msg = msg + `${botName} runs under a heavily modified instance of OpenBot, an open-source all in one moderation bot!\n\n`;

		// bot version
		msg = msg + `**Bot Version:**\n`;
		msg = msg + `${botName} Version: ${mikuVer}-${mikuChannel} (More development to come!)\n`
		msg = msg + `OpenBot version: ${version} (Version ID: ${versionID}) / Latest version ID: ${latestVersion}.\n${outputMsg}\n\n`;

		// curency stats
		msg = msg + `**Currency Stats:**\n`;
		msg = msg + `Currency Members: ${balances.length} (${banks.length} bank accounts)\n`;
		msg = msg + `Total Balance: ${(await abbrevBalance(totalBalance)).displayValue}\n`;
		msg = msg + `Total Banks: ${(await abbrevBalance(totalBank)).displayValue}\n`;
		msg = msg + `Total Net (excl. items): ${(await abbrevBalance(totalBalance + totalBank)).displayValue}\n\n`;

		// stats
		msg = msg + `**Bot Stats:**\n`;
		msg = msg + `Members: ${members}\nGuilds: ${guilds.reduce((prev, val) => prev + val, 0)}\n`;
		msg = msg + `Current Shard Guilds: ${shardGuilds}\n`;
		msg = msg + `"Real" members: ${totalMembers.length}\n`;
		msg = msg + `Active members (14d): ${activeUsers}\n`;
		msg = msg + `Total commands used: ${commands.value}\n`;
		msg = msg + `Real commands used: ${realCommands}\n`;
		msg = msg + `Commands used (past day): ${cmdsDay}\n`;
		msg = await embed("Info", msg, null, null);
		await interaction.reply({
			embeds: [msg],
			flags: MessageFlags.Ephemeral
		});
		return;
	},
};