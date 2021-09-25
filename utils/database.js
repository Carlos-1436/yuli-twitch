const sqlite3 = require("sqlite3");
require("dotenv").config();
const logger = require("./logs.js");
const logs = new logger.Logs();
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

    async isBlacklisted(twitchname, callback) {
        await this.database.get(`SELECT * FROM blacklist WHERE twitchname=?`, [twitchname], (e,r) => {
            return (e, (!r) ? false : true);
        })
    }

    async isReported(twitchname, callback) {
        await this.database.get(`SELECT * FROM botReports WHERE twitchname=?`, [twitchname], (e,r) => {
            return (e, (!r) ? false : true);
        });
    }
    
    async addToBlacklist(twitchname, reason, callback) {
        await this.database.get(`SELECT * FROM bots WHERE twitchname=?`, [twitchname], async (e,r) => {
            if (e)
                return callback(`Erro ao adicionar na blacklist.`);
            if (!r) {
                var stmt = await this.database.prepare(`INSERT INTO blacklist(twitchname, reason) VALUES(?,?)`);
                stmt.run([twitchname, reason], (e) => {
                    if (e)
                        return callback(`Error ao fazer insert na blacklist`);
                    return callback(`${twitchname} adicionado(a) na blacklist com sucesso!`);
                });
            } else {
                return callback(`${twitchname} já existe na blacklist!`);
            }
        });
    }

    async removeFromBlacklist(twitchname, callback) {
        await this.database.run(`DELETE FROM blacklist WHERE twitchname=?`, [twitchname], async (e) => {
            if (e)
                return callback(`Erro ao remover da blacklist.`);
            return callback(`Adicionado na blacklist com sucesso!`); 
        });
    }

    async addToReports(twitcname, channel, callback) {
        var stmt = await this.database.prepare(`INSERT INTO botReports(twitchname, channel) VALUES(?,?)`);
        stmt.run([twitchname, channel], (e) => {
            if (e)
                return callback(`No momento esse comando está indisponível, tente novamente depois!`);
            return callback(`Bot reportado com sucesso, no momento para evitar problemas, ele será banido de seu canal caso não tenha sido!`);
        });
    }

    async removeFromReports(twitchname, callback) {
        await this.database.run(`DELETE FROM botReports WHERE twitchname=?`, (e) => {
            if (e)
                return callback(`Não foi possível retirar ${twitchname} dos reports`);
            return callback(`Report removido com sucess!`);
        });
    }

    async getCommand(channel, commandName, callback) {
        await this.database.get(`SELECT * FROM customcommands WHERE channel=? AND commandName=?`, [channel, commandName], (e, r) => {
            callback(e, r)
        });
    }
    
    async command(mode, channel, commandname, message="", onlymods=null, callback) {
        await this.database.get(`SELECT * FROM customcommands WHERE channel=? AND commandName=?`, [channel, commandname], async (e, r) => {
            if (e)
                return callback(`Ocorreu um erro interno, tente novamente depois.`);
                        
            switch(mode) {
                case "add":
                    if (!r) {
                        var stmt = await this.database.prepare(`INSERT INTO customcommands(channel, commandName, message, onlyMods) VALUES(?,?,?,?)`);
                        stmt.run([channel, commandname, message, (onlymods == "false") ? 0 : 1], (e2) => {
                            return callback(`Comando adicionado com sucesso`);
                        });
                    } else {
                        return callback(`Esse comando já existe, tente fazer um update nele.`);
                    }
                    break;

                case "update":
                    if (!r)
                        return callback(`Esse comando não existe!`);
                    
                    var stmt = await this.database.prepare(`UPDATE customcommands SET message=? WHERE channel=? AND commandName=?`);
                    stmt.run([message, channel, commandname], (e2) => {
                        if (e2)
                            return callback(`Ocorreu um erro ao tentar modificar este comando.`);
                        return callback(`Comando modificado com sucesso!`);
                    });
                    break;

                case "remove":
                    if (!r)
                        return callback(`Esse comando não existe!`);
                    
                    await this.database.run(`DELETE FROM customcommands WHERE channel=? AND commandName=?`, [channel, commandname], (e2) => {
                        if (e2)
                            return callback(`Ocorreu um erro ao tentar deleter este comando.`);
                        return callback(`Comando removido com sucesso!`);
                    });
                    break;

                case "moderator":
                    if (!r)
                        return callback(`Esse comando não existe!`);
                    
                    await this.database.run(`UPDATE customcommands SET onlyMods=? WHERE channel=? AND commandName=?`, [(onlymods == "false") ? 0 : 1, channel, commandname], (e2) => {
                        if (e2)
                            return callback(`Ocorreu um erro ao encontrar este comando, tente novamente depois!`);
                        return callback(`Comando modificado com sucesso!`)
                    });
                    break;
            }
        });
    }
}

module.exports = { database };