const { Telegraf } = require('telegraf');
const { refreshDolar, recordListeners, localReferenceListeners } = require('./dolar_utils');

let bot;

module.exports.startDolarTelegramBot = function(botToken) {
  recordListeners.push(onRecord);
  localReferenceListeners.push(onLocalReferenceChange);
  bot = new Telegraf(botToken);
  bot.on('text', onText);
  bot.launch();
}

async function onText(ctx) {
  try {
    let chatId = ctx.message.chat.id;
    let command = ctx.message.text;

    if (command.includes('/dolarkac')) {
      const dolarData = await refreshDolar();
      logChatId(chatId);
      sendMessage(chatId, `Durumum: ${dolarData.current}`);
    } else if (command.includes('/rekorkac')) {
      const dolarData = await refreshDolar();
      logChatId(chatId);
      sendMessage(chatId, `Rekorum: ${dolarData.record}`);
    } else if (command.includes('/gunlukrekor')) {
      const dolarData = await refreshDolar();
      logChatId(chatId);
      sendMessage(chatId, `Gunluk Rekorum: ${dolarData.dailyRecord}`);
    }
  } catch (error) {
    console.log(error);
  }
}

function sendMessage(chatId, message) {
  bot.telegram.sendMessage(chatId, message);
}

function sendMessageToGroups(message) {
  process.env.DOLAR_TELEGRAM_GROUP_ID.split(',').forEach(group => {
    sendMessage(group, message);
  });
}

function onRecord(dolarData) {
  sendMessageToGroups(`REKORLARDAYIM: ${dolarData.record}`);
}

function logChatId(chatId) {
  console.log(`Dolar Bey Telegram: Message from ${chatId}`);
}

function onLocalReferenceChange(dolarData, diff) {
  let message;
  if (diff > 0) {
    message = `CIKI$LARDAYIM: ${dolarData.current}`;
  } else {
    message = `DU$U$LERDEYIM: ${dolarData.current}`;
  }
  
  sendMessageToGroups(message);
}
