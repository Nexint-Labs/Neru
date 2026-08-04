const { Collection, Events, MessageFlags } = require('discord.js');
const { embed } = require('../../functions/embed.js');
const { client } = require('../../bot.js');

module.exports = {
	async execute() {
		client.on(Events.InteractionCreate, async interaction => {
			if (!interaction.isChatInputCommand() && !interaction.isContextMenuCommand()) return;
			const command = client.commands.get(interaction.commandName);

			if (!command) {
				console.error(`No command matching ${interaction.commandName} was found.`);
				return;
			}

			const { cooldowns } = interaction.client;

			if (!cooldowns.has(command.data.name)) {
				cooldowns.set(command.data.name, new Collection());
			}

			const now = Date.now();
			const timestamps = cooldowns.get(command.data.name);
			const defaultCooldownDuration = 3;
			const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;

			if (timestamps.has(interaction.user.id)) {
				const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

				if (now < expirationTime) {
					const expiredTimestamp = Math.round(expirationTime / 1000);
					return interaction.reply({ content: `Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`, flags: MessageFlags.Ephemeral });
				}
			}

			timestamps.set(interaction.user.id, now);
			setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

			try {
				await command.execute(interaction);
			} catch (error) {
				try {
					let userEmbed = await embed("Error", "Something went wrong while trying to process a command! Please check the console logs.\nError: " + error, null, null);
					if (interaction.replied || interaction.deferred) {
						await interaction.followUp({ embeds: [userEmbed], flags: MessageFlags.Ephemeral });
					} else {
						await interaction.reply({ embeds: [userEmbed], flags: MessageFlags.Ephemeral });
					}
					console.log("[" + DateFormatter.format(Date.now()) + `] [ERROR] An error happened while processing a command!`);
					console.error(error);
				}
				catch (error) {
					throw (error);
				}
			}
		});
	}
}