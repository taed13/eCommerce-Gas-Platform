"use strict";

const mongoose = require("mongoose");
const {
    countConnect
} = require("../helpers/check.connect");
const {
    db: {
        host,
        port,
        name
    },
} = require("../configs/config.mongodb");

const connectString = `mongodb://${host}:${port}/${name}`;

class Database {
    constructor() {
        this.connect();
    }
    // connect
    connect(type = "mongodb") {
        if (1 == 1) {
            mongoose.set("debug", true);
            mongoose.set("debug", {
                color: true
            });
        }

        mongoose
            .connect(connectString, {
                maxPoolSize: 50
            })
            .then((_) =>
                console.log(
                    "Connected to MongoDB successfully " + connectString,
                    countConnect()
                )
            )
            .catch((error) => console.error("Error connecting to MongoDB", error));
    }

    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }

        return Database.instance;
    }
}

const instanceMongodb = Database.getInstance();

module.exports = instanceMongodb;