const sqlite3 = require("sqlite3");
require("dotenv").config();
const logs = require("./logs.js");
const fs = require("fs");

class dbControler {
    constructor(dbName) {
        this.database = new sqlite3.Database(dbName, (e => {
            if (e) {
                logs.error(`Erro ao carregar o banco de dados SQLITE3 - ` + e);
                return process.exit(-1);
            }
            logs.info(`Banco de dados carregado com sucesso!`);
        }));
    }

    async registerBotList(reason, txtPath) {
        const namesFromFile = fs.readFileSync(txtPath)
            .toString().trim().split("\r\n");

        var stmt = await this.database.prepare(`INSERT INTO bots(twitchname, reason) VALUES(?,?)`);
        
        for (let name of namesFromFile) {
            await this.database.get(`SELECT * FROM bots WHERE twitchname=?`, [name], (e, r) => {
                if (e)
                    return logs.error(`Erro ao selecionar registros - ${e}`);
                if (!r) {
                    stmt.run([name, reason], (e) => {
                        if (e)
                            return logs.error(`Não foi possível adicionar ${name} - ${e}`);
                            logs.info(`Adicionado ${name} no banco de dados`);
                    });
                } else {
                    logs.info(`Usuário ${name} já existe no banco de dados`);
                }
            });

        }
    }
}

class database extends dbControler {
    constructor(dbName) {
        super(dbName);
    }

    async isBot(twitchname, callback) {
        await this.database.get(`SELECT * FROM bots WHERE twitchname=?`, [twitchname], (e, r) => {
            return (e, (!r) ? false : true);
        });
    }

    async addBot(twitchname, reason, callback) {
        var stmt = await this.database.prepare(`INSERT INTO bots(twitchname, reason) VALUES(?,?)`);
        return stmt.run([twitchname, reason], callback(e));
    }
}

module.exports = { database };