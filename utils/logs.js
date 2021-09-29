const chalk = require("chalk");

function error(msg) {
    console.log(chalk.bold(chalk.redBright("< ERROR > - ") + chalk.white(msg)));
}

function warn(msg) {
    console.log(chalk.bold(chalk.yellowBright("< WARN > - ") + chalk.white(msg)));
}

function info(msg) {
    console.log(chalk.bold(chalk.blueBright("< INFO > - ") + chalk.white(msg)));
}

function mention(msg) {
    console.log(chalk.bold(chalk.greenBright("< MENÇÃO > - ") + chalk.white(msg)));
}

function ban(msg) {
    console.log(chalk.bold(chalk.redBright("< BAN > - ") + chalk.white(msg)));
}

function unban(msg) {
    console.log(chalk.bold(chalk.cyan("< UNBAN > - ") + chalk.white(msg)));
}

module.exports = { error, warn, info, mention, ban, unban };