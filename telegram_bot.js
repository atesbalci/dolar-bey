const { Telegraf } = require('telegraf');
const { subExists, Platform, SubscriptionType, addSub, removeSub, getSubsFor } = require('./config');
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
    } else if (command.includes('/toggleriseandfall') || command.includes('/togglerecord')) {
      let subType;
      if (command.includes('/toggleriseandfall')) {
        subType = SubscriptionType.RISE_AND_FALL;
      }
      else {
        subType = SubscriptionType.RECORD;
      }

      if (!subExists(Platform.TELEGRAM, subType, chatId)) {
        addSub(Platform.TELEGRAM, subType, chatId);
        sendMessage(chatId, 'Yazacam buraya...');
      }
      else {
        removeSub(Platform.TELEGRAM, subType, chatId);
        sendMessage(chatId, 'Tamam tamam... sustum...');
      }
    } else if (command.includes('/substatus')) {
      let msg = `Rekor Mesajlari: ${subExists(Platform.TELEGRAM, SubscriptionType.RECORD, chatId) ? 'ACIK' : 'KAPALI'}\n`;
      msg += `Cikis/Inis Mesajlari: ${subExists(Platform.TELEGRAM, SubscriptionType.RISE_AND_FALL, chatId) ? 'ACIK' : 'KAPALI'}`;
      sendMessage(chatId, msg);
    }
  } catch (error) {
    console.log(error);
  }
}

function sendMessage(chatId, message) {
  bot.telegram.sendMessage(chatId, message);
}

function sendMessageToGroups(message, subType) {
  getSubsFor(Platform.TELEGRAM, subType).forEach(sub => {
    sendMessage(sub.chatId, message);
  });
}

function onRecord(dolarData) {
  sendMessageToGroups(`REKORLARDAYIM: ${dolarData.record}`, SubscriptionType.RECORD);
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
  
  sendMessageToGroups(message, SubscriptionType.RISE_AND_FALL);
}

// setInterval(() => {
//   sendMessageToGroups("Test record", SubscriptionType.RECORD);
// }, 5000);
