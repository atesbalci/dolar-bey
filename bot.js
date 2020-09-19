const Discord = require('discord.js');
const { getTime, deleteMessage } = require('./utils');
const { refreshDolar, recordListeners } = require('./dolar_utils');
let channel;
let beratClient;

async function DM(msg) {
  try {

  } catch (err) {
    console.log(err);
  }
}

async function TEXT(msg) {
  try {
    refreshDolar(dolarData => {
      if (msg.content.includes('gun')) {
        msg.channel.send(`Gunluk Rekorum: ${dolarData.dailyRecord}`)
          .then(msg => sendMessageBerat(msg.channel.id, 'Ezanlari susturamayacaklar!'));
      } else if (msg.content.includes('rekor')) {
        msg.channel.send(`Rekorum: ${dolarData.record}`)
          .then(msg => sendMessageBerat(msg.channel.id, 'Ezanlari susturamayacaklar!'));
      } else {
        msg.channel.send(`Durumum: ${dolarData.current}`)
          .then(msg => sendMessageBerat(msg.channel.id, 'Dolarla mi maas aliyorsun?'));
      }
      // deleteMessage(msg);
    });
  } catch (err) {
    console.log(err);
  }
}

function onRecord(dolarData) {
  channel.send(`REKORLARDAYIM: ${dolarData.record}`)
    .then(msg => sendMessageBerat(msg.channel.id, 'Ezanlari susturamayacaklar!'));
}

function sendMessageBerat(channelId, message) {
  beratClient.channels.fetch(channelId).then(ch => ch.send(message));
}

module.exports.startDolarBot = function startDolarBot(token, beratToken) {
  const client = new Discord.Client();
  beratClient = new Discord.Client();

  client.on('ready', () => {
    console.log(`${getTime()}: Logged in as ${client.user.tag}\n===============================================`);
    client.channels.fetch(process.env.RECORD_CHANNEL_ID).then(c => channel = c);
  });

  client.on('message', (msg) => {
    if (msg.channel.type === 'dm') { DM(msg); }
    var firstMention = msg.mentions.members.first();
    if (msg.channel.type === 'text' && firstMention != null && firstMention.user == client.user) { TEXT(msg); }
  });

  process.on('unhandledRejection', (error) => {
    console.error(`${getTime()}: Unhandled promise rejection:`, error);
  });

  refreshDolar(null);
  recordListeners.push(onRecord);
  setInterval(() => refreshDolar(null), 300000);

  client.login(token);
  beratClient.login(beratToken);
}