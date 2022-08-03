const { startDolarBot } = require("./bot");
const { refreshDolar } = require("./dolar_utils");
const { startDolarTelegramBot } = require("./telegram_bot");

startDolarBot(process.env.BOT_TOKEN);
startDolarTelegramBot(process.env.TELEGRAM_BOT_TOKEN);
setInterval(() => refreshDolar(), process.env.CHECK_INTERVAL_MINUTES * 60000);
