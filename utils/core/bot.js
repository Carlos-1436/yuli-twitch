const { Client } = require("tmi.js");
require("dotenv").config();
const logs = require("../logs.js");
const db = require("../database.js");

class bot {
    constructor() {
        this.client = new Client({
            options: {
                joinInterval: 300
            },
            identity: {
                username: process.env.BOTNAME,
                password: process.env.BOTPASS
            },
            channels: process.env.CHANNELS.split(",").map(channel => channel.trim()),
            connection: {
                reconnect: true
            }
        });

        this.logger = new logs.Logs();
        this.database = new db.database("database.db");
    }

    login() {
        this.client.connect();
    }
}

module.exports = { bot };