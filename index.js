const { startDolarBot } = require("./bot");
const { startDolarTelegramBot } = require("./telegram_bot");

startDolarBot(process.env.BOT_TOKEN);
startDolarTelegramBot(process.env.TELEGRAM_BOT_TOKEN);
