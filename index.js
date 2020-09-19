const { startDolarBot } = require("./bot");
const { handleDolarTelegram } = require("./telegram_bot");
const express = require('express');
const app = express();

function startTelegramServer() {
  app.use(express.json());
  app.post('/', handleDolarTelegram);
  app.listen(process.env.PORT || 80, () => console.log('Listening...'));
}

startDolarBot(process.env.BOT_TOKEN);
startTelegramServer();
