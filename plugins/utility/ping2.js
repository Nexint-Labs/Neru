const fs = require('node:fs');
const { SlashCommandBuilder } = require('discord.js');
const { embed } = require('../../functions/embed.js');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('chat-revive')
        .setDescription('Revive Chat. Nexint servers only.')
        .addStringOption(option =>
            option
                .setName('msg')
                .setDescription('What message to append?.')),
    async execute(interaction) {

        // Defer reply
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

        // Disable revive chat if not in two servers.
        let msg = await embed("Revive Chat", `This command is not available for use in this Discord channel.`, null, null);

        if (interaction.channel.id != "1191481645564444779" && interaction.channel.id != "1530375862640443413") {
            await interaction.editReply({
                embeds: [msg]
            });
            return;
        }

        // Make directory if does not exist.
        if (!fs.existsSync('./store')) {
            fs.mkdirSync('./store');
        }

        // Check for channel and set constant variable.
        let nexint = false; // Is this my server or not?
        if (interaction.channel.id == "1530375862640443413") {
            nexint = true;
        }

        // Read the date from the file.
        let date = 0;
        if (nexint) {
            if (fs.existsSync('./store/lastPing2.txt')) {
                date = fs.readFileSync('./store/lastPing2.txt', { encoding: 'utf8' });
            }
        } else {
            if (fs.existsSync('./store/lastPing.txt')) {
                date = fs.readFileSync('./store/lastPing.txt', { encoding: 'utf8' });
            }
        }

        // Find other variables
        let userMsg = interaction.options.getString("msg");
        let ping = false;

        // Check if 1 hour has passed.
        if (Math.floor(Date.now() / 1000) > Number(date) + (3600)) {
            if (nexint) {
                fs.writeFileSync('./store/lastPing2.txt', `${Math.floor(Date.now() / 1000)}`);
            } else {
                fs.writeFileSync('./store/lastPing.txt', `${Math.floor(Date.now() / 1000)}`);
            }

            // Logic to send chat revive messages.
            msg = await embed("Revive Chat", `The user <@${interaction.user.id}> revived the chat!\n\n-# The next ping is available <t:${Math.floor(Date.now() / 1000) + (3600)}:R>.`, null, null);
            if (userMsg != null) {
                msg = await embed("Revive Chat", `The user <@${interaction.user.id}> revived the chat!\n\nMessage from <@${interaction.user.id}>: ${userMsg}\n\n-# The next ping is available <t:${Math.floor(Date.now() / 1000) + (3600)}:R>.`, null, null);
            }
            ping = true;
        } else {

            // No pinging if 1 hour has not passed.
            msg = await embed("Revive Chat", `You cannot ping the "Revive Chat" role yet. You can ping this role <t:${Number(date) + (3600)}:R>.`, null, null);
        }
        await interaction.editReply({
            embeds: [msg]
        });

        // Send the ping message.
        if (ping) {

            // Advertisement message for my Discord server. Only relevant for Project Voca.
            // let advertisement = "\n\nAdvertisement: Join Nexint's actual Discord for sneek peeks and more! https://discord.nexint.ca/ - Same URL, Different Server";
            // let pingID = "<@&1496668730850148352>" + advertisement;

            // Advertising has been temporarily disabled.
            let pingID = "<@&1496668730850148352>";
            if (nexint) {
                pingID = "<@&1530792091712753684>";
            }
            await interaction.channel.send(pingID);
        }
        return;
    }
};