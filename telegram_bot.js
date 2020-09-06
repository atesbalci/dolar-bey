const https = require('https');
const { refreshDolar, DolarData, recordListeners } = require('./dolar_utils');

module.exports.prepareDolarTelegramExpress = function prepareDolarTelegramExpress(expressApp) {  
  recordListeners.push(onRecord);
  expressApp.post('/', (req, res) => {
    res.send('All done!');
    try {
      let chatId = req.body.message.chat.id;
      let command = req.body.message.text;

      if (command.includes('/getdolar')) {
        refreshDolar(dolarData => {
          sendMessage(chatId, `Durumum:+${dolarData.current}`);
        });
      } else if (command.includes('/rekorkac')) {
        refreshDolar(dolarData => {
          sendMessage(chatId, `Rekorum:+${dolarData.record}`);
        });

      } else if (command.includes('/gunlukrekor')) {
        refreshDolar(dolarData => {
          sendMessage(chatId, `Gunluk+Rekorum:+${dolarData.dailyRecord}`);
        });
      }
    } catch (error) {
      console.log(error);
    }
  });
}

function sendMessage(chatId, message) {
  https.get(`${process.env.DOLAR_TELEGRAM_GROUP_URL_PREFIX}${chatId}&text=${message}`);
}

function onRecord(dolarData) {
  sendMessage(process.env.DOLAR_TELEGRAM_GROUP_ID, `REKORLARDAYIM:+${dolarData.record}`);
}
