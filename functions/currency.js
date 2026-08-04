const Sequelize = require('sequelize');
const { expChance, expMaxGain, items } = require('./../plugins/currency/config.js');
const { dmNotify } = require('./notify.js');
const { optOutChkSingle } = require('./optOut.js');

const currency = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    // SQLite only
    storage: 'currency.sqlite',
});

const balance = currency.define('balance', {
    userId: {
        type: Sequelize.STRING,
    },
    name: {
        type: Sequelize.STRING,
    },
    value: {
        type: Sequelize.DOUBLE,
    },
    multiplier: {
        type: Sequelize.DOUBLE,
    },
});

const bank = currency.define('bank', {
    userId: {
        type: Sequelize.STRING,
    },
    name: {
        type: Sequelize.STRING,
    },
    value: {
        type: Sequelize.DOUBLE,
    },
    maxValue: {
        type: Sequelize.DOUBLE,
    }
});

const work = currency.define('work', {
    userId: {
        type: Sequelize.STRING,
    },
    name: {
        type: Sequelize.STRING,
    },
    jobId: {
        type: Sequelize.INTEGER,
    },
    wage: {
        type: Sequelize.DOUBLE,
    },
    lastWorked: {
        type: Sequelize.DOUBLE,
    },
    workCount: {
        type: Sequelize.INTEGER,
    }
});

const miscinfo = currency.define('miscinfo', {
    userId: {
        type: Sequelize.STRING,
    },
    name: {
        type: Sequelize.STRING,
    },
    exp: {
        type: Sequelize.DOUBLE,
    },
    level: {
        type: Sequelize.DOUBLE,
    },
    nextLevel: {
        type: Sequelize.DOUBLE,
    },
    lastRobbed: {
        type: Sequelize.STRING,
    },
    robbable: {
        type: Sequelize.BOOLEAN,
    },
});

const itemsdb = currency.define('items', {
    userId: {
        type: Sequelize.STRING,
    },
    name: {
        type: Sequelize.STRING,
    },
    value: {
        type: Sequelize.DOUBLE,
    },
});

const multi = currency.define('multi', {
    userId: {
        type: Sequelize.STRING,
    },
    name: {
        type: Sequelize.STRING,
    },
    value: {
        type: Sequelize.DOUBLE,
    },
    multi: {
        type: Sequelize.DOUBLE,
    },
    expire: {
        type: Sequelize.DOUBLE,
    },
});

const queryBalances = async function () {
    await balance.sync();
    let balanceUsers = await balance.findAll();
    return balanceUsers;
}

const queryBanks = async function () {
    await bank.sync();
    let bankUsers = await bank.findAll();
    return bankUsers;
}

const queryMulti = async function (guildMember, name, multiplier, findName, expire) {

    await multi.sync();
    let multiUser;
    if (findName === undefined) {
        multiUser = await multi.findAll({
            where: {
                userId: guildMember.id,
            }
        })
    } else {
        multiUser = await multi.findOne({
            where: {
                userId: guildMember.id,
                name: findName
            }
        })
    }
    if (multiUser === null) {
        await multi.create({
            userId: guildMember.id,
            value: 0,
            name: name,
            multi: multiplier, // use the default multiplier when at null for compatibility, can be modified per person
            expire: expire
        })
        multiUser = await multi.findOne({
            where: {
                userId: guildMember.id
            }
        })
    }
    if (findName !== undefined) {
        multiUser.multi = multiplier;
        await multiUser.save();
    }
    return multiUser
}

const updateMulti = async function (guildMember) {

    let multiUser = await multi.findAll({
        where: {
            userId: guildMember.id,
        }
    })
    let multiplier = 1;
    for (let i = 0; i < multiUser.length; i++) {
        if (multiUser[i].expire !== undefined && multiUser[i].expire < Date.now()) {
            multiplier *= multiUser[i].multi;
        }
    }
    let balanceUser = await balanceCheck(guildMember);
    if (Number.isNaN(multiplier)) {
        multiplier = 1;
    }
    balanceUser.multiplier = multiplier;
    await balanceUser.save();
    return multiplier;
}

/*
convItem function
Input: ID of item
Output: item properties
*/
const convItem = async function (id) {
    let exists = false;
    let item = 0;
    for (let i = 0; i < items.length; i++) {
        if (items[i].id == id) {
            exists = true;
            item = i;
            break;
        }
    }
    if (exists) {
        return items[item];
    }
    return undefined;
}

/*
buyItem function
Input: ID of item, guildMember
Output: balance function of user if user has enough money, false if user does not have enough money, and undefined if item doesnt exist.
*/
const buyItem = async function (id, guildMember, qty) {

    // check if item exists
    let exists = false;
    let item = 0;
    for (let i = 0; i < items.length; i++) {
        if (items[i].id == id) {
            exists = true;
            item = i;
            break;
        }
    }

    if (exists) {
        let user = await balanceCheck(guildMember);
        if (user.value >= items[item].value * qty) {
            user.value -= items[item].value * qty;
            let itemUser = await queryItem(id, guildMember);
            itemUser.value += qty;
            await itemUser.save();
            await user.save();
            return {
                user,
                itemUser,
            }
        }
        return false;
    }
    return undefined;
}

/*
queryItem function
Input: ID of item, guildMember
Output: depending if guildMember / ID was specified:
true / false depending on items existance guildMember is undefined
*/
const queryItem = async function (id, guildMember) {

    // make sure id is defined
    if (id === undefined) {
        await itemsdb.sync();
        let itemUser = await itemsdb.findAll({
            where: {
                userId: guildMember.id
            },
            order: [
                ['name', 'ASC'],
            ],
        })
        return itemUser
    }

    // check if item exists
    let exists = false;
    let item = 0;
    for (let i = 0; i < items.length; i++) {
        if (items[i].id == id) {
            exists = true;
            item = i;
            break;
        }
    }
    if (guildMember === undefined) {
        return {
            exists,
            item,
        };
    }
    if (exists) {
        await itemsdb.sync();
        let itemUser = await itemsdb.findOne({
            where: {
                userId: guildMember.id,
                name: id
            }
        })
        if (itemUser === null) {
            await itemsdb.create({
                userId: guildMember.id,
                name: id,
                value: 0,
            })
            itemUser = await itemsdb.findOne({
                where: {
                    userId: guildMember.id,
                    name: id
                }
            })
        }
        return itemUser
    }
    return undefined;

}

/*
queryItemName function
Input: Name of item, guildMember
Output: depending if guildMember / ID was specified:
true / false depending on items existance guildMember is undefined
*/
const queryItemName = async function (name, guildMember) {

    // check if item exists
    let exists = false;
    let item = 0;
    for (let i = 0; i < items.length; i++) {
        if (items[i].name.toLowerCase() == name.toLowerCase()) {
            exists = true;
            item = i;
            break;
        }
    }
    if (guildMember === undefined) {
        return {
            exists,
            item,
        };
    }
    if (exists) {
        await itemsdb.sync();
        let itemUser = await itemsdb.findOne({
            where: {
                userId: guildMember.id,
                name: items[item].id
            }
        })
        if (itemUser === null) {
            await itemsdb.create({
                userId: guildMember.id,
                name: items[item].id,
                value: 0,
            })
            itemUser = await itemsdb.findOne({
                where: {
                    userId: guildMember.id,
                    name: items[item].id
                }
            })
        }
        return itemUser
    }
    return undefined;

}

const balanceCheck = async function (guildMember) {
    await balance.sync();
    let [balanceUser, created] = await balance.findOrCreate({
        where: {
            userId: guildMember.id
        },
        defaults: {
            value: 0,
            name: guildMember.username,
            multiplier: 1,
        }
    })
    if (created) {
        return balanceUser;
    }
    let save = false;
    if (balanceUser.value < 0) {
        balanceUser.value = 0;
        save = true;
    }
    if (balanceUser.name != guildMember.username) {
        balanceUser.name = guildMember.username;
        save = true;
    }
    if (save) {
        await balanceUser.save();
    }
    return balanceUser;
}

const bankCheck = async function (guildMember) {
    await bank.sync();
    let [bankUser, created] = await bank.findOrCreate({
        where: {
            userId: guildMember.id
        },
        defaults: {
            value: 0,
            name: guildMember.username,
            maxValue: 1000000,
        }
    })
    if (created) {
        return bankUser;
    }
    let save = false;
    if (bankUser.value < 0) {
        bankUser.value = 0;
        save = true;
    }
    if (bankUser.name != guildMember.username) {
        bankUser.name = guildMember.username;
        save = true;
    }
    if (save) {
        await bankUser.save();
    }
    return bankUser
}

const miscCheck = async function (guildMember) {
    await miscinfo.sync();
    let miscInfo = await miscinfo.findOne({
        where: {
            userId: guildMember.id
        }
    })
    if (miscInfo === null) {

        await miscinfo.create({
            userId: guildMember.id,
            name: guildMember.username,
            exp: 0,
            level: 1,
            nextLevel: 5,
            lastRobbed: 0,
            robbable: true,
        })
        miscInfo = await miscinfo.findOne({
            where: {
                userId: guildMember.id
            }
        })
    }
    let save = false;
    if (miscInfo.name != guildMember.username) {
        miscInfo.name = guildMember.username;
        save = true;
    }
    if (save) {
        await miscInfo.save();
    }
    return miscInfo
}

const workCheck = async function (guildMember) {
    await work.sync();
    let workInfo = await work.findOne({
        where: {
            userId: guildMember.id
        }
    })
    if (workInfo === null) {

        await work.create({
            userId: guildMember.id,
            name: guildMember.username,
            jobId: -1,
            wage: 0,
            lastWorked: 0,
            workCount: 0
        })
        workInfo = await work.findOne({
            where: {
                userId: guildMember.id
            }
        })
    }
    let save = false;
    if (workInfo.name != guildMember.username) {
        workInfo.name = guildMember.username;
        save = true;
    }
    if (save) {
        await workInfo.save();
    }
    return workInfo
}

const expGain = async function (guildMember) {
    let user = await miscCheck(guildMember);
    if (!(await optOutChkSingle(guildMember))) {
        if (Math.random() > expChance) {
            user.exp += (Math.floor(Math.random() * expMaxGain) + 1);
            if (user.exp >= user.nextLevel) {
                user.exp = 0;
                user.level += 1;
                user.nextLevel = Math.floor(user.nextLevel * 1.09051) + 1;
                let bankUser = await bankCheck(guildMember);
                bankUser.maxValue *= 1.1;
                await bankUser.save();
                await user.save();
                let result = await dmNotify(guildMember, `You gained an additional level!\nYou are now level ${user.level}.`, null, null);
                if (result !== 0 && result.rawError.message != "Cannot send messages to this user") {
                    console.log(result);
                }
                return user.level;
            }
            await user.save();
        }
    }
    return 0;
}

const reset = async function () {
    await currency.truncate();
}

const resetBalances = async function () {
    await balance.destroy({
        truncate: true, // Empties the entire 'User' table
    });
    await bank.destroy({
        truncate: true, // Empties the entire 'User' table
    });
}

/*
optOutCurrency function
Input: interaction
Output: true/false depending if opt out worked
*/
const optOutCurrency = async function (interaction) {
    try {

        // sync currency
        await currency.sync();
        await balance.sync();
        await bank.sync();
        await miscinfo.sync();
        await work.sync();
        await itemsdb.sync();
        await multi.sync();

        // destroy currency
        await balance.destroy({ where: { userId: interaction.user.id } })
        await bank.destroy({ where: { userId: interaction.user.id } })
        await miscinfo.destroy({ where: { userId: interaction.user.id } })
        await work.destroy({ where: { userId: interaction.user.id } })
        await itemsdb.destroy({ where: { userId: interaction.user.id } })
        await multi.destroy({ where: { userId: interaction.user.id } })

        return true;
    } catch {
        console.log("[" + DateFormatter.format(Date.now()) + `] [ERROR] An error has occured while trying to opt out ${interaction.user}.`);
        console.log("[" + DateFormatter.format(Date.now()) + `] [ERROR] Full stack trace:`);
        console.log(error);
        return false;
    }
}

const convNameToID = async function (name) {
    await balance.sync();
    let balanceUser = await balance.findOne({
        where: {
            name: name
        }
    })
    if (balanceUser === null) {
        return null;
    } else {
        return balanceUser.userId
    }

}

module.exports = {
    balanceCheck,
    bankCheck,
    miscCheck,
    workCheck,
    expGain,
    reset,
    buyItem,
    queryItem,
    convItem,
    queryItemName,
    queryMulti,
    updateMulti,
    optOutCurrency,
    queryBalances,
    queryBanks,
    convNameToID,
    resetBalances,
};