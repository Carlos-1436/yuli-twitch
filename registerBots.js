const dbControler = require("./utils/database.js");
const db = new dbControler.database("database.db");

db.registerBotList("BOT/IP Grabber", "./utils/others/botnames.txt");