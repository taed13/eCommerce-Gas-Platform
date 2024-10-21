"use strict";

const { Sequelize } = require("sequelize");
const {
    db: {
        host,
        port,
        user,
        password,
        name
    },
} = require("../configs/config.mysql2");

class Database {
    constructor() {
        this.connect();
    }

    // Kết nối với Sequelize
    async connect() {
        try {
            this.sequelize = new Sequelize(name, user, password, {
                host: host,
                port: port,
                dialect: 'mysql',
                logging: console.log,
                pool: {
                    max: 5,
                    min: 0,
                    acquire: 30000,
                    idle: 10000,
                },
            });

            await this.sequelize.authenticate();
            console.log('Connected to MySQL successfully via Sequelize.');
        } catch (error) {
            console.error('Unable to connect to the MySQL database:', error);
        }
    }

    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }

    getSequelize() {
        return this.sequelize;
    }
}

const instanceMysql = Database.getInstance();

module.exports = instanceMysql;
