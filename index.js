const botCore = require("./utils/core/bot.js");
const bot = new botCore.bot();
var client = bot.client;
const oauth = require("./oauth.js").events(client, bot);

const fs = require("fs");
var anti_spam = fs.readFileSync("./utils/others/anti-spam.txt")
    .toString().replace(/\r\n/g, " ").trim().split(" ");

// Cache e reset do cache a cada 10 minutos
var notBotCache = [];
setInterval(async() => {
    botCache = [];
}, (1000 * 60) * 10);

// Events
client.on("chat", async (channel, user, msg, self) => {
    var badges = {
        broadcaster: (user.badges !== null) ? user.badges.hasOwnProperty("broadcaster") : 0,
        moderator: (user.badges !== null) ? user.badges.hasOwnProperty("moderator") : 0,
        vip: (user.badges !== null) ? user.badges.hasOwnProperty("vip") : 0,
        subscriber: (user.badges !== null) ? user.badges.hasOwnProperty("subscriber") : 0
    }

    // Verifica que o usuário em chat é considerado um bot
    if (notBotCache.indexOf(user.username) == -1) {
        bot.database.isBot(user.username, (e, r) => {
            if (e)
                return bot.logger.error(`Erro ao procurar ${user.username} nos registros de bots - ${e}`);
            if (r)
                return client.say(channel, `/ban ${user.username} BOT/IP GRABBER`);
            notBotCache.push(user.username);
        });
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
    
        if (!msg.startsWith("$"))
            return;

        const args = msg.slice(1).split(" ");
        const cmdName = args.shift().toLowerCase();

        if (!cmdName)
            return;

        bot.database.getCommand(channel, cmdName, (e, r) => {
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

                    bot.database.command(mode, channel, commandName, message, moderator, (r) => {
                        return client.say(channel, `@${user.username} ` + r);
                    });
                // UPDATE
                } else if (mode == modes[1]) {
                    var commandName = args.shift();
                    var message = args.join();

                    if (commandName == "" || message == "")
                        return client.say(channel, `@${user.username} preciso do nome do comando e a nova mensagem atribuida a ele!`);

                    bot.database.command(mode, channel, commandName, message, null, (r) => {
                        return client.say(channel, `@${user.username} ` + r);
                    });
                // REMOVE
                } else if (mode == modes[2]) {
                    var commandName = args.shift();

                    if (commandName == "")
                        return client.say(channel, `@${user.username} preciso do nome de um comando!`);

                    bot.database.command(mode, channel, commandName, "", null, (r) => {
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

                    bot.database.command(mode, channel, commandName, null, onlyMods, (r) => {
                        return client.say(channel, `@${user.username} ` + r);
                    });
                }
                break;

            case "globalban":
                if (user.username != "ogalaxyy_")
                    return;

                var channelList = process.env.CHANNELS.split(",");
                var count = 1;
                
                // Encontra todos os canais e bane um por um
                for (let selectedChannel of channelList) {
                    function delay(bot) {
                        setTimeout(function() {
                            client.say("#"+selectedChannel.toLowerCase(), `/ban ${bot} BOT/IP GRABBER`);
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
        }
    } catch(e) { console.log(e)};
});

client.connect().catch((e) => { bot.logger.error(e); });