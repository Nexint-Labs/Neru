module.exports = {
    async execute() {

        // Able to use sequelize databases in plugins and have them loaded.
        const Sequelize = require('sequelize');

        const analytics = new Sequelize('database', 'user', 'password', {
            host: 'localhost',
            dialect: 'sqlite',
            logging: false,
            // SQLite only
            storage: 'analytics.sqlite',
        });

        // Databases used.
        const usage = analytics.define('commands', {
            type: {
                type: Sequelize.STRING,
            },
            value: {
                type: Sequelize.DOUBLE,
            },
        });
        const userinfo = analytics.define('userinfo', {
            userId: {
                type: Sequelize.STRING,
            },
            name: {
                type: Sequelize.STRING,
            },
            value: {
                type: Sequelize.DOUBLE,
            },
            registerDate: {
                type: Sequelize.STRING,
            },
            lastUsed: {
                type: Sequelize.STRING,
            },
        });
        
        const cmdDate = analytics.define('cmddate', {
            type: {
                type: Sequelize.STRING,
            },
            date: {
                type: Sequelize.STRING,
            },
        });

        await cmdDate.sync();
        await userinfo.sync();
        await usage.sync();
    }
}

