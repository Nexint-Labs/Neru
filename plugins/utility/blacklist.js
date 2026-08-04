const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { embed } = require('../../functions/embed.js');
const { server, serverToken, header, botName } = require('../../config.js');
const { devID } = require('../../config.js');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('nex-blacklist')
        .setDescription('Blacklist a user from the ENTIRETY of Nexint.')
        .addUserOption(option =>
            option
                .setName('user')
                .setRequired(true)
                .setDescription('The person to blacklist.'))
        .setIntegrationTypes([0, 1])
        .setContexts([0, 1, 2]),
    async execute(interaction) {
        // defer Reply
        const embedMessage = await interaction.deferReply({
            withResponse: true,
        });

        // Blacklist / whitelist only works if you are connected to Nexint API.
        if (server != "https://api.nexint.org") {
            let msg = await embed("Warning", `This instance of ${botName} is not connected to the Nexint API. Please remove this command by deleting the file /plugins/utility/blacklist.js`, null, null);
            await interaction.editReply({
                embeds: [msg]
            });
            return;
        }

        if (!(interaction.user.id == devID)) {
            let msg = await embed("Blacklist API", "You are not authorized to use this tool.", null, null);
            await interaction.editReply({
                embeds: [msg], withResponse: true
            });
            return;
        }

        // define
        let user = interaction.options.getUser("user");
        let userId = user.id;
        let userName = user.username;

        // fetch
        const update = await fetch(server + '/api/v1/blacklist', {
            method: 'POST',
            body: JSON.stringify({
                userId: userId,
                name: userName,
                completed: false,
                token: serverToken,
            }),
            headers: {
                'Authorization': header,
                'Content-Type': `application/json`
            }
        });
        const event = await update.json();

        // reply
        let msg = "";
        if (update.status == "409") {
            msg += "User is already blacklisted."
        } else {
            msg += `Blacklisted <@${event.id}> (${event.name}) from Nexint services.`
        }
        msg = await embed("Blacklist API", msg, null, null);
        await interaction.editReply({
            embeds: [msg], withResponse: true
        });
        return;
    }
};