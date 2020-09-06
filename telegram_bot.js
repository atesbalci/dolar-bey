const https = require('https');
const express = require('express');
const { refreshDolar, DolarData } = require('./dolar_utils');
const app = express();

function handler(request, response) {
  response.send('All done!');
  
  // try {
  //   let requestParsed = JSON.parse(request.body);
  //   let chatId = requestParsed.message.chat.id;
  //   console.log(chatId);
  //   if (request.url === '/dolarkac') {
  //     refreshDolar(dolarData => {
  //       console.log(dolarData);
  //       sendMessage(chatId, `Durumum:+${dolarData.current}`);
  //     }, null);
  //   }
  // } catch (error) {
  //   console.log(error);
  // }
}

function sendMessage(chatId, message) {
  https.get(`${process.env.DOLAR_TELEGRAM_GROUP_URL_PREFIX}${chatId}&text=${message}`);
}

module.exports.startServer = function startServer() {
  app.get('/', handler);
  let port = process.env.PORT || 80;
  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
  });
}
