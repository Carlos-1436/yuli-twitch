const fs = require("fs");
var anti_spam = fs.readFileSync("./utils/others/anti-spam.txt")
    .toString().replace(/\r\n/g, " ").trim().split(" ");

const botCore = require("./utils/core/bot.js");
const bot = new botCore.bot();
var client = bot.client;
var db = bot.database;
var logs = bot.logger;

// Usuários que não são bots
var nBot = [];
setInterval(async () => {
    nBot = [];
}, 1000 * 60 * 5);

// Events
client.on("connected", (addr, port) => {
    logs.info(`<CONECTADO> - Bot conectado com sucesso no seguinte endereço: ${addr}:${port}`);
});

client.on("join", (channel, username, self) => {
    if (self)
        logs.info(`<CANAL> - Conectado ao canal ` + channel);
});

client.on("chat", async (channel, user, msg, self) => {
    if (self)
        return;

    if (msg.toLowerCase().includes("galaxy")) {
        logs.mention(`${channel}/${user.username} | ${msg}`)
    }

    // Badges do usuário
    var badges = {
        broadcaster: (user.badges !== null) ? user.badges.hasOwnProperty("broadcaster") : 0,
        moderator: (user.badges !== null) ? user.badges.hasOwnProperty("moderator") : 0,
        vip: (user.badges !== null) ? user.badges.hasOwnProperty("vip") : 0,
        subscriber: (user.badges !== null) ? user.badges.hasOwnProperty("subscriber") : 0
    }

    // Verifica se o usuário no chat é registrado como bot
    if (nBot.indexOf(user.user) == -1) {
        db.isBot(user.username, (e, r) => {
            if (e)
                return logs.error(`Erro ao verificar ${user.username} - ${e}`);
            
            if (r) {
                client.say(channel, `/ban ${user.username} BOT/IP GRABBER`);
                return logs.ban(`${channel}/${user.username}`);
            }
            nBot.push(user.username);
        });
    }

    try {
        for (var item of anti_spam) {
            if (msg.includes(item) && !badges.moderator && !badges.broadcaster && !self) {
                client.timeout(channel, user["display-name"], 60 * 5, "ASCII ART");
                break;
            }
        }
    
        // Execução de comandos
        if (!msg.startsWith("$"))
            return;

        const args = msg.slice(1).split(" ");
        const cmdName = args.shift().toLowerCase();

        if (!cmdName)
            return;

        switch(cmdName) {
            // Comando sobre o yuli
            case "yuli":
                if (user.username != "ogalaxyy_")
                    return;

                client.say(channel, `✨ Atualmente: Estou funcionando normalmente Galaxy!`);
                break;
            
            // Ban em todos os canais conectados
            case "globalban":
                if (user.username != "ogalaxyy_")
                    return;

                var channelList = process.env.CHANNELS.split(",");
                var bots = (args.length == 0) ? fs.readFileSync("./utils/others/banlist.txt")
                                                .toString().replace(/\r\n/g, " ").trim().split(" ") : args;
                var message = "";
                var count = 1;

                channelList.shift(); // Retirada do primeiro canal da lista(meu canal)
                channelList.forEach(channel => {
                    message += `▶ ${channelList.indexOf(channel) + 1}° - ${channel}`;
                    (channelList.indexOf(channel) + 1 != channelList.length) ? message += " | " : "";
                });

                client.say(channel, `Bots: ${bots.length} | Ordem: ${message}`);
                
                // Encontra todos os canais e bane um por um
                for (let selectedChannel of channelList) {
                    // Delay
                    function delay(bot) {
                        setTimeout(() => {
                            client.say("#" + selectedChannel, `/ban ${bot} BOT/IP GRABBER`);
                            logs.ban(`Global BAN | ${selectedChannel}/${bot}`);
                        }, 1000 * 4 * count);
                        count += 1;
                    }
                    
                    setTimeout(() => {
                        bots.map(function(botName) {
                            delay(botName);
                        });
                    }, 10000);
                    count = 1;
                }
                break;
            
            // Banimento por uma lista já definida
            case "localban":
                if (user.username != "ogalaxyy_")
                    return;
                
                var banlist = (args.length == 0) ? fs.readFileSync("./utils/others/banlist.txt")
                    .toString().replace(/\r\n/g, " ").trim().split(" ") : args;
                
                client.say(channel, `Iniciando banimento de ${banlist.length} bots!`);

                // Delay
                var count = 1;
                function delay(bot) {
                    setTimeout(() => {
                        client.say(channel, `/ban ${bot} BOT/IP GRABBER`);
                        logs.ban(`Local BAN | ${channel}/${user.username}`);
                    }, 1000 * 4 * count);
                    count += 1;
                }

                for (var bot of banlist) {
                    delay(bot);
                }
                break;
            
            case "globalunban":
                if (user.username != "ogalaxyy_")
                    return;

                client.say(channel, `Fazendo a retirada de banimentos errados. Total de nicks: ${args.length}`);

                for (let selectedChannel of channelList) {
                    // Delay
                    function delay(twitchname) {
                        setTimeout(() => {
                            client.say("#" + selectedChannel, `/unban ${twitchname}`);
                            logs.unban(`Global UNBAN | ${selectedChannel}/${twitchname}`);
                        }, 1000 * 4 * count);
                        count += 1;
                    }
                    
                    setTimeout(() => {
                        args.map(function(username) {
                            delay(username);
                        });
                    }, 10000);
                    count = 1;
                }
                break;
        }
    } catch(e) { console.log(e); };
});

client.connect().catch((e) => { logs.error(`Erro ao executar comando: ` + e); });