const { EmbedBuilder } = require('discord.js');
const { embedURL, embedIconURL, footerText, infoColor } = require('../config.js');

// Embed function
// Input: title, description, url, shortURL (url can be null)
// Output: returns embed
const embed = async function (title, description, url, shortURL) {
    const embed = new EmbedBuilder()
        .setColor(infoColor)
        .setTitle(title)
        .setURL(url)
        .setDescription(description)
        .setThumbnail(embedURL)
        .setImage(shortURL)
        .setTimestamp()
        .setFooter({ text: footerText, iconURL: embedIconURL });
    return embed;
}

// Embed function
// Input: title, description, url, shortURL (url can be null)
// Output: returns embed
const embedPlusDesc = async function (title, description, url, shortURL, titleTwo, descTwo, titleThree, descThree, titleFour, descFour) {
    let embed;
    if (titleThree === undefined) {
        embed = new EmbedBuilder()
            .setColor(infoColor)
            .setTitle(title)
            .setURL(url)
            .setDescription(description)
            .setThumbnail(embedURL)
            .addFields(
                { name: titleTwo, value: descTwo, inline: true },
            )
            .setImage(shortURL)
            .setTimestamp()
            .setFooter({ text: footerText, iconURL: embedIconURL });
    } else if (titleFour === undefined) {
        embed = new EmbedBuilder()
            .setColor(infoColor)
            .setTitle(title)
            .setURL(url)
            .setDescription(description)
            .setThumbnail(embedURL)
            .addFields(
                { name: titleTwo, value: descTwo, inline: true },
                { name: titleThree, value: descThree, inline: true },
            )
            .setImage(shortURL)
            .setTimestamp()
            .setFooter({ text: footerText, iconURL: embedIconURL });
    } else {
        embed = new EmbedBuilder()
            .setColor(infoColor)
            .setTitle(title)
            .setURL(url)
            .setDescription(description)
            .setThumbnail(embedURL)
            .addFields(
                { name: titleTwo, value: descTwo, inline: true },
                { name: titleThree, value: descThree, inline: true },
                { name: titleFour, value: descFour, inline: true },
            )
            .setImage(shortURL)
            .setTimestamp()
            .setFooter({ text: footerText, iconURL: embedIconURL });
    }
    return embed;
}

module.exports = {
    embed,
    embedPlusDesc
};