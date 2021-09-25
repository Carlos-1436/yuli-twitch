const chalk = require("chalk");

class Logs {
    constructor() {}
    error(msg) {
        console.log(chalk.bold(chalk.redBright("< ERROR > - ") + chalk.white(msg)));
    }

    warn(msg) {
        console.log(chalk.bold(chalk.yellowBright("< WARN > - ") + chalk.white(msg)));
    }

    info(msg) {
        console.log(chalk.bold(chalk.blueBright("< INFO > - ") + chalk.white(msg)))
    }
}

module.exports = { Logs };