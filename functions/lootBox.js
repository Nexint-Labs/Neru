
const { expChance, expMaxGain, items } = require('./../plugins/currency/config.js');

/*
convItem function
Input: ID of item
Output: item properties
*/
const lootBoxItems = async function (id) {
    let lootBoxes = [];
    let maxValues = [];
    let maxValue = 0;
    for (let i = 0; i < items.length; i++) {
        if (items[i].effects.lb1 !== undefined) {
            lootBoxes.push(items[i].effects.lb1)
            maxValue += items[i].effects.lb1[0];
        }
    }
    choices = [];
    for (let i = 0; i < choiceCount; i++) {
        let rng = Math.floor(Math.random() * chance);
        let choice = 0;
        let tmp = 0;
        while (tmp <= rng) {
            tmp += jobs[choice].chance;
            choice += 1;
        }
        choices.push([choice - 1, Math.floor(jobs[choice - 1].wage * ((Math.random() * 0.4) + 0.8))]);
    }
    if (exists) {
        return items[item];
    }
    return undefined;
}