
module.exports = {
    async events(client, bot) { 
        client.on("connected", (addr, port) => {
            bot.logger.info(`<CONECTADO> - Bot conectado com sucesso no seguinte endereço: ${addr}:${port}`);
        });

        client.on("join", (channel, username, self) => {
            if (self)
                return bot.logger.info(`<CANAL> - Conectado ao canal ` + channel);
        });
    }
}