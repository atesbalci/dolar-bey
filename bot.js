const Discord = require('discord.js');
const { getTime, deleteMessage } = require('./utils');
const { refreshDolar, recordListeners } = require('./dolar_utils');
let channel;

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
        msg.channel.send(`Gunluk Rekorum: ${dolarData.dailyRecord}`);
      } else if (msg.content.includes('rekor')) {
        msg.channel.send(`Rekorum: ${dolarData.record}`);
      } else {
        msg.channel.send(`Durumum: ${dolarData.current}`);
      }
      // deleteMessage(msg);
    });
  } catch (err) {
    console.log(err);
  }
}

function onRecord(dolarData) {
  channel.send(`REKORLARDAYIM: ${dolarData.record}`);
}

module.exports.startDolarBot = function startDolarBot(token) {
  const client = new Discord.Client();

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
}