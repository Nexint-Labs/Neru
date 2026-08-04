
const { queryItem, convItem, bankCheck, updateMulti, queryItemName, queryMulti } = require('./currency.js');
const { abbrevBalance } = require('./abbrevValues.js');
const { addCommandsUsed } = require('./usageData.js');
const { embed, embedPlusDesc } = require('./embed.js');
const { dmNotify } = require('./notify.js');
const { devMode, devMsg, devID } = require('../config.js');
const useItem = async function (itemList, interaction, qty, confirmation, guildMember, response) {
    let item = await convItem(itemList.name);
    itemList.value -= qty;
    await itemList.save();
    let msg = `Ate ${(await abbrevBalance(qty)).displayValue} ${item.name}(s), and nothing happened.\nYour new ${item.name} balance: ${(await abbrevBalance(itemList.value)).displayValue} (s).`;
    switch (itemList.name) {
        case "4":
            itemList.value += qty;
            await itemList.save();
            let multiUser = await queryMulti(guildMember, "sushi", 1.2, "sushi", undefined)
            if (multiUser.value < 1) {
                multiUser.value += 1;
                itemList.value -= 1;
                await itemList.save();
                await multiUser.save();
                await updateMulti(guildMember);
                msg = `Ate ${(await abbrevBalance(qty)).displayValue} ${item.name}(s), and your multiplier increased by 1.2x.\nYour new ${item.name} balance: ${(await abbrevBalance(itemList.value)).displayValue} (s).`;
            } else {
                msg = "Nothing happened. Your multiplier is greater than 1."
                await confirmation.update({ content: msg, components: [] });
                return;
            }
            break;
        case "3":

            // Increase banknote size
            let bankUser = await bankCheck(guildMember);
            let bankValue = 500000 * ((Math.random() / 5) + 0.9);
            bankUser.maxValue += bankValue * qty;
            await bankUser.save();
            await itemList.save();
            msg = `Bank balance increased by ${((await abbrevBalance(bankValue * qty))).displayValue} coins.\nNew Bank balance: ${((await abbrevBalance(bankUser.value))).displayValue} / ${((await abbrevBalance(bankUser.maxValue))).displayValue}\nNew banknote amount: ${itemList.value}`
            break;
        case "200":
            
    }
    if (devMode) {
        msg += "\n-# " + devMsg;
    }

    // Analytics
    addCommandsUsed(interaction.user);

    // form embed
    let userEmbed = await embed("Item used!", msg, null, null);
    // send messages
    await confirmation.update({ content: "", embeds: [userEmbed], components: [] });
    let result = await dmNotify(guildMember, `You have used ${(await abbrevBalance(qty)).displayValue} ${item.name}(s) in the channel ${response.resource.message.url}!\nYour new balance: ${(await abbrevBalance(itemList.value)).displayValue} ${item.name}(s).`, null, null)
    if (result !== 0 && result.rawError.message != "Cannot send messages to this user") {
        throw result;
    }
}



module.exports = {
    useItem
};