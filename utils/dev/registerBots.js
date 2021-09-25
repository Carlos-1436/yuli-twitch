const dbControler = require("../database.js");
const db = new dbControler.database("../database.db");

db.registerBotList("BOT/IP Grabber", "../others/botnames.txt");