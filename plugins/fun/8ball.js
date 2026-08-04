const { SlashCommandBuilder } = require('discord.js');
const { addCommandsUsed } = require('../../functions/usageData.js');
const { embed } = require('../../functions/embed.js');

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('8ball')
		.setDescription('Just a standard 8ball.')
		.addStringOption(option =>
			option
				.setName('question')
				.setRequired(true)
				.setDescription('Prompt to ask the 8ball.'))
		.setIntegrationTypes([0,1])
		.setContexts([0,1,2]),
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

		let ballArray = [];
		ballArray.push("It is certain.");
		ballArray.push("It is decidedly so.");
		ballArray.push("Without a doubt.");
		ballArray.push("Yes definitely.");
		ballArray.push("As I see it, yes.");
		ballArray.push("Most likely.");
		ballArray.push("Outlook good.");
		ballArray.push("Yes.");
		ballArray.push("Signs point to yes.");
		
		// neut
		ballArray.push("Reply hazy, try again.");
		ballArray.push("Ask again later.");
		ballArray.push("Better not tell you now.");
		ballArray.push("Cannot predict now.");
		ballArray.push("Concentrate and ask again.");
		
		// neg
		ballArray.push("Don't count on it.");
		ballArray.push("My reply is no.");
		ballArray.push("My sources say no.");
		ballArray.push("Outlook not so good.");
		ballArray.push("Very doubtful.");

		let answer = ballArray[Math.floor(Math.random() * ballArray.length)];

		// Add to analytics
		addCommandsUsed(interaction.user);

		// Send reply
        const embeds = await embed("8ball", "Prompt: " + interaction.options.getString("question") + "\n:8ball: Answer: " + answer, null, null)
        await interaction.reply({
            embeds: [embeds]
        });
	},
};