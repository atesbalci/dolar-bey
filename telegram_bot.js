const https = require('https');
const { refreshDolar, DolarData, recordListeners, localReferenceListeners } = require('./dolar_utils');

module.exports.handleDolarTelegram = function handleDolarTelegram(req, res) {
  try {
    let chatId = req.body.message.chat.id;
    let command = req.body.message.text;

    if (command.includes('/dolarkac')) {
      refreshDolar(dolarData => {
        logChatId(chatId);
        sendMessage(chatId, `Durumum:+${dolarData.current}`);
      });
    } else if (command.includes('/rekorkac')) {
      refreshDolar(dolarData => {
        logChatId(chatId);
        sendMessage(chatId, `Rekorum:+${dolarData.record}`);
      });

    } else if (command.includes('/gunlukrekor')) {
      refreshDolar(dolarData => {
        logChatId(chatId);
        sendMessage(chatId, `Gunluk+Rekorum:+${dolarData.dailyRecord}`);
      });
    } else if (command.includes('/testgroups')) {
      sendMessageToGroups(`Group+subscribed`);
    }
  } catch (error) {
    console.log(error);
  }
}

module.exports.initDolarTelegram = function initDolarTelegram() {
  recordListeners.push(onRecord);
  localReferenceListeners.push(onLocalReferenceChange);
}

function sendMessage(chatId, message) {
  https.get(`${process.env.DOLAR_TELEGRAM_GROUP_URL_PREFIX}${chatId}&text=${message}`);
}

function onRecord(dolarData) {
  sendMessage(process.env.DOLAR_TELEGRAM_GROUP_ID, `REKORLARDAYIM:+${dolarData.record}`);
}

function sendMessageToGroups(message) {
  process.env.DOLAR_TELEGRAM_GROUP_ID.split(',').forEach(group => {
    sendMessage(group, message);
  });
}

function logChatId(chatId) {
  console.log(`Dolar Bey Telegram: Message from ${chatId}`);
}

function onLocalReferenceChange(dolarData, diff) {
  let message;
  if (diff > 0) {
    message = `CIKI$LARDAYIM:+${dolarData.current}`;
  } else {
    message = `DU$U$LERDEYIM:+${dolarData.current}`;
  }
  
  sendMessageToGroups(message);
}
