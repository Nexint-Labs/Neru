const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    // SQLite only
    storage: 'database.sqlite',
});

const blacklistServer = sequelize.define('blacklistServer', {
    serverId: {
        type: Sequelize.STRING,
        unique: true,
    }
});

const blacklistServerCheck = async function (id) {
    const blacklisted = await blacklistServer.findOne({
        where: {
            serverId: id
        }
    });
    if (blacklisted === null) {
        return false;
    }
    return true;
}

const blacklistServerAdd = async function (id) {
    let [blacklisted, created] = await blacklistServer.findOrCreate({
        where: {
            serverId: id
        }
    })
    return created
}

const blacklistServerRemove = async function (id) {
    const rowCount = await blacklistServer.destroy({ where: { serverId: id } })
    if (!rowCount) {
        return false;
    }
    return true;
}

module.exports = {
    blacklistServerCheck,
    blacklistServerAdd,
    blacklistServerRemove
};