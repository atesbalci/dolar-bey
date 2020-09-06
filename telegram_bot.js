const https = require('https');
const { refreshDolar, DolarData } = require('./dolar_utils');

module.exports.prepareDolarTelegramExpress = function prepareDolarTelegramExpress(expressApp) {  
  expressApp.post('/', (req, res) => {
    res.send('All done!');
    try {
      console.log(req.body);
      let chatId = req.body.message.chat.id;
      console.log(chatId);
      refreshDolar(dolarData => {
        console.log(dolarData);
        sendMessage(chatId, `Durumum:+${dolarData.current}`);
      }, null);
    } catch (error) {
      console.log(error);
    }
  });
}

function sendMessage(chatId, message) {
  https.get(`${process.env.DOLAR_TELEGRAM_GROUP_URL_PREFIX}${chatId}&text=${message}`);
}
