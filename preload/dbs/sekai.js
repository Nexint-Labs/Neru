module.exports = {
    async execute() {

        // Able to use sequelize databases in plugins and have them loaded.
        const Sequelize = require('sequelize');

        const sekaidb = new Sequelize('database', 'user', 'password', {
            host: 'localhost',
            dialect: 'sqlite',
            logging: false,
            // SQLite only
            storage: 'sekai.sqlite',
        });

        // Databases used.
        const vote = sekaidb.define('vote', {
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

        await vote.sync();
    }
}

