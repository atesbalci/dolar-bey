const https = require('https');
const { refreshDolar, DolarData } = require('./dolar_utils');

function handler(request, response) {
  let requestParsed = JSON.parse(request.body);
  let chatId = requestParsed.message.chat.id;
  console.log(chatId);
  if (request.url === '/dolarkac') {
    refreshDolar(dolarData => {
      console.log(dolarData);
      sendMessage(chatId, `Durumum:+${dolarData.current}`);
    }, null);
  }

  response.writeHead(200);
  response.end();
}

function sendMessage(chatId, message) {
  https.get(`${process.env.DOLAR_TELEGRAM_GROUP_URL_PREFIX}${chatId}&text=${message}`);
}

module.exports.startServer = function startServer() {
  https.createServer(handler).listen(process.env.PORT || 80);
}
