const fs = require("fs");
var anti_spam = fs.readFileSync("./utils/others/anti-spam.txt")
    .toString().replace(/\r\n/g, " ").trim().split(" ");

const botCore = require("./utils/core/bot.js");
const bot = new botCore.bot();
var client = bot.client;
var db = bot.database;

// Events
client.on("connected", (addr, port) => {
    bot.logger.info(`<CONECTADO> - Bot conectado com sucesso no seguinte endereço: ${addr}:${port}`);
});

client.on("join", (channel, username, self) => {
    if (self)
        return bot.logger.info(`<CANAL> - Conectado ao canal ` + channel);
});

client.on("chat", async (channel, user, msg, self) => {
    var badges = {
        broadcaster: (user.badges !== null) ? user.badges.hasOwnProperty("broadcaster") : 0,
        moderator: (user.badges !== null) ? user.badges.hasOwnProperty("moderator") : 0,
        vip: (user.badges !== null) ? user.badges.hasOwnProperty("vip") : 0,
        subscriber: (user.badges !== null) ? user.badges.hasOwnProperty("subscriber") : 0
    }

    // Comandos
    if (self)
        return;

    try {
        for (var item of anti_spam) {
            if (msg.includes(item) && !badges.moderator && !badges.broadcaster && !self) {
                client.timeout(channel, user["display-name"], 60, "ASCII ART");
                client.say(channel, `Ei @${user["display-name"]}, artes ASCII estão bloqueadas aqui, lhe foi aplicado um timeout de 60 segundos. Pare pois você pode ser banido!`);
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

        // Procura por comandos customizado
        db.getCommand(channel, cmdName, (e, r) => {
            if (!r) {
                return;
            } else {
                return client.say(channel, r.message);
            }
        });
        
        switch(cmdName) {
            //Comando default do bot para adicionar outros comandos
            case "command":
                if (!badges.moderator && !badges.broadcaster)
                    return client.say(channel, `@${user.username} você não tem permissão para usar isso!`);
            
                var modes = ["add", "update", "remove", "moderator", "help"];
                var mode = args.shift();

                if (modes.indexOf(mode) === -1)
                    return client.say(channel, `@${user.username} Modo não existente nesse comando, tente "add", "remove", "update", "moderator" ou "help"!`);

                
                // ADD
                if (mode == modes[0]) {
                    var commandName = args.shift();

                    if (commandName == "command")
                        return client.say(channel, `@${user.username} não vem dando uma de espertinho não ein, aiaiai, esse nome não pode ser utilizado em um comando pois é um nome de um comando default do bot!`);

                    var moderator = args.shift();
                    var message = args.join(" ");

                    if (moderator != "false" && moderator != "true" || message == "" || commandName == "")
                        return client.say(channel, `@${user.username} tente: <nome do comando> <é para moderador (false/true)> <mensagem> Obs.: Sem "< >".`);

                    db.command(mode, channel, commandName, message, moderator, (r) => {
                        return client.say(channel, `@${user.username} ` + r);
                    });
                // UPDATE
                } else if (mode == modes[1]) {
                    var commandName = args.shift();
                    var message = args.join();

                    if (commandName == "" || message == "")
                        return client.say(channel, `@${user.username} preciso do nome do comando e a nova mensagem atribuida a ele!`);

                    db.command(mode, channel, commandName, message, null, (r) => {
                        return client.say(channel, `@${user.username} ` + r);
                    });
                // REMOVE
                } else if (mode == modes[2]) {
                    var commandName = args.shift();

                    if (commandName == "")
                        return client.say(channel, `@${user.username} preciso do nome de um comando!`);

                    db.command(mode, channel, commandName, "", null, (r) => {
                        return client.say(channel, `@${user.username} ` + r);
                    });
                // MODERATOR
                } else if (mode == modes[3]) {
                    var commandName = args.shift();
                    var onlyMods = args.shift();

                    if (onlyMods == "" || commandName == "")
                        return client.say(channel, `@${user.username} preciso do nome do comando e false/true para moderadores!`);

                    if (onlyMods != "false" && onlyMods != "true")
                        return client.say(channel, `@${user.username} os argumentos precisam ser: <nome do comando> <false ou true> (sem < >).`);

                    db.command(mode, channel, commandName, null, onlyMods, (r) => {
                        return client.say(channel, `@${user.username} ` + r);
                    });
                }
                break;

            // Ban em todos os canais conectados
            case "globalban":
                if (user.username != "ogalaxyy_")
                    return;

                var channelList = process.env.CHANNELS.split(",");
                var count = 1;
                
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
                        args.map(function(botName) {
                            delay(botName);
                        });
                    }, 10000);
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

client.connect().catch((e) => { bot.logger.error(e); });