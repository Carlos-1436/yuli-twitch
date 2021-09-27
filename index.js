const fs = require("fs");
var anti_spam = fs.readFileSync("./utils/others/anti-spam.txt")
    .toString().replace(/\r\n/g, " ").trim().split(" ");

const botCore = require("./utils/core/bot.js");
const bot = new botCore.bot();
var client = bot.client;

var date = new Date();
var datetime = date.toLocaleString("pt-BR", { timezone: "UTC" });

// Events
client.on("connected", (addr, port) => {
    bot.logger.info(`<CONECTADO> - Bot conectado com sucesso no seguinte endereço: ${addr}:${port}`);
});

client.on("join", (channel, username, self) => {
    if (self)
        return bot.logger.info(`<CANAL> - Conectado ao canal ` + channel);
});

client.on("chat", async (channel, user, msg, self) => {
    // Comandos
    if (self)
        return;

    var badges = {
        broadcaster: (user.badges !== null) ? user.badges.hasOwnProperty("broadcaster") : 0,
        moderator: (user.badges !== null) ? user.badges.hasOwnProperty("moderator") : 0,
        vip: (user.badges !== null) ? user.badges.hasOwnProperty("vip") : 0,
        subscriber: (user.badges !== null) ? user.badges.hasOwnProperty("subscriber") : 0
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
                client.say(channel, `✨ Atualmente: Estou funcionando normalmente` + "\n" + `⏰ Online desde: ${datetime}`);
                break;
            
            // Ban em todos os canais conectados
            case "globalban":
                if (user.username != "ogalaxyy_")
                    return;

                var channelList = process.env.CHANNELS.split(",");
                var count = 1;
                var bots = (args.length == 0) ? fs.readFileSync("./utils/others/banlist.txt")
                                                .toString().replace(/\r\n/g, " ").trim().split(" ") : args;
                var message = "";

                channelList.shift(); // Retirada do primeiro canal da lista(meu canal)
                channelList.forEach(channel => {
                    message += `▶ ${channelList.indexOf(channel) + 1}° - ${channel}`;
                    (channelList.indexOf(channel) + 1 != channelList.length) ? message += " | " : "";
                });

                client.say(channel, `Processo iniciado, delay 30 segundos por canal:\n${message}`);
                
                // Encontra todos os canais e bane um por um
                for (let selectedChannel of channelList) {
                    // Delay
                    function delay(bot) {
                        setTimeout(function() {
                            client.say("#" + selectedChannel, `/ban ${bot} BOT/IP GRABBER`);
                            console.log(`Canal: ${selectedChannel} | Global ban em: ${bot}`);
                        }, 1000 * 4 * count);
                        count += 1;
                    }
                    
                    setTimeout(function() {
                        bots.map(function(botName) {
                            delay(botName);
                        });
                    }, 30000);
                    count = 1;
                }
                break;
            
            // Banimento por uma lista já definida
            case "banlist":
                if (user.username != "ogalaxyy_")
                    return;
                
                var banlist = fs.readFileSync("./utils/others/banlist.txt")
                    .toString().replace(/\r\n/g, " ").trim().split(" ");
                
                // Delay
                var count = 1;
                function delay(bot) {
                    setTimeout(function() {
                        client.say(channel, `/ban ${bot} BOT/IP GRABBER`);
                        console.log(`Canal: ${channel} | Local ban com a lista: ${bot}`);
                    }, 1000 * 4 * count);
                    count += 1;
                }

                for (var bot of banlist) {
                    delay(bot);
                }
                break;
        }
    } catch(e) { console.log(e)};
});

client.connect().catch((e) => { bot.logger.error(`Erro ao executar comando: ` + e); });