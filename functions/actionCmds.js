const Sequelize = require('sequelize');

const fundb = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    // SQLite only
    storage: 'fundb.sqlite',
});

const hugs = fundb.define('hugs', {
    userId: {
        type: Sequelize.STRING,
    },
    huggedId: {
        type: Sequelize.STRING,
    },
    value: {
        type: Sequelize.INTEGER,
    },
});

const kiss = fundb.define('kiss', {
    userId: {
        type: Sequelize.STRING,
    },
    kissedId: {
        type: Sequelize.STRING,
    },
    value: {
        type: Sequelize.INTEGER,
    },
});

const hello = fundb.define('hello', {
    userId: {
        type: Sequelize.STRING,
    },
    helloId: {
        type: Sequelize.STRING,
    },
    value: {
        type: Sequelize.INTEGER,
    },
});

const pat = fundb.define('pat', {
    userId: {
        type: Sequelize.STRING,
    },
    pattedId: {
        type: Sequelize.STRING,
    },
    value: {
        type: Sequelize.INTEGER,
    },
});

const boop = fundb.define('boop', {
    userId: {
        type: Sequelize.STRING,
    },
    boopId: {
        type: Sequelize.STRING,
    },
    value: {
        type: Sequelize.INTEGER,
    },
});

const poke = fundb.define('poke', {
    userId: {
        type: Sequelize.STRING,
    },
    pokeId: {
        type: Sequelize.STRING,
    },
    value: {
        type: Sequelize.INTEGER,
    },
});

const punch = fundb.define('punch', {
    userId: {
        type: Sequelize.STRING,
    },
    punchId: {
        type: Sequelize.STRING,
    },
    value: {
        type: Sequelize.INTEGER,
    },
});

const kill = fundb.define('kill', {
    userId: {
        type: Sequelize.STRING,
    },
    killId: {
        type: Sequelize.STRING,
    },
    value: {
        type: Sequelize.INTEGER,
    },
});

/*
optOutAction function
Input: interaction
Output: true/false depending if opt out worked
*/
const optOutAction = async function (interaction) {
    try {

        // sync fun commands
        await hugs.sync();
        await pat.sync();
        await kiss.sync();
        await hello.sync();
        await boop.sync();
        await poke.sync();
        await punch.sync();
        await kill.sync();

        // destroy fun commands
        await hugs.destroy({ where: { userId: interaction.user.id } })
        await hugs.destroy({ where: { huggedId: interaction.user.id } })
        await kiss.destroy({ where: { userId: interaction.user.id } })
        await kiss.destroy({ where: { kissedId: interaction.user.id } })
        await hello.destroy({ where: { userId: interaction.user.id } })
        await hello.destroy({ where: { helloId: interaction.user.id } })
        await pat.destroy({ where: { userId: interaction.user.id } })
        await pat.destroy({ where: { pattedId: interaction.user.id } })
        await boop.destroy({ where: { userId: interaction.user.id } })
        await boop.destroy({ where: { boopId: interaction.user.id } })
        await poke.destroy({ where: { userId: interaction.user.id } })
        await poke.destroy({ where: { pokeId: interaction.user.id } })
        await punch.destroy({ where: { userId: interaction.user.id } })
        await punch.destroy({ where: { punchId: interaction.user.id } })
        await kill.destroy({ where: { userId: interaction.user.id } })
        await kill.destroy({ where: { killId: interaction.user.id } })

        return true;
    } catch (error) {
        console.log("[" + DateFormatter.format(Date.now()) + `] [ERROR] An error has occured while trying to opt out ${interaction.user}.`);
        console.log("[" + DateFormatter.format(Date.now()) + `] [ERROR] Full stack trace:`);
        console.log(error);
        return false;
    }
}

module.exports = {
    optOutAction,
}