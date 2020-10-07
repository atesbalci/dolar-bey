const Discord = require('discord.js');
const { getTime, deleteMessage } = require('./utils');
const { refreshDolar, recordListeners } = require('./dolar_utils');

const beratRegular = [
  "Dolarla mı maaş alıyorsun?",
  "Dolar 10 lira olacak, 15 lira olacak ya, toplayalım dolarları...\nDolar düştü 5 liraya, şimdi bunlar kara kara düşünüyor...",
  "Mercedes, BMW'ye binmek isteyenler kurdan rahatsız, vatandaşın böyle derdi yok!",
  "Kur benim için hiç önemli değil, hiç oraya bakmıyorum.\nArtık kur bizim elimizde."
];

const beratDesperate = [
  "Ezanları susturamayacaklar!",
  "Türkiye, tarihinde ilk defa rekabetçi bir kur düzeyiyle ekonomisini dönüştürecek yapıya kavuştu."
];

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
          .then(msg => sendMessageBerat(msg.channel.id, getRandomDesperateBerat()));
      } else if (msg.content.includes('rekor')) {
        msg.channel.send(`Rekorum: ${dolarData.record}`)
          .then(msg => sendMessageBerat(msg.channel.id, getRandomDesperateBerat()));
      } else {
        msg.channel.send(`Durumum: ${dolarData.current}`)
          .then(msg => sendMessageBerat(msg.channel.id, getRandomRegularBerat()));
      }
      // deleteMessage(msg);
    });
  } catch (err) {
    console.log(err);
  }
}

function onRecord(dolarData) {
  channel.send(`REKORLARDAYIM: ${dolarData.record}`)
    .then(msg => sendMessageBerat(msg.channel.id, getRandomDesperateBerat()));
}

function sendMessageBerat(channelId, message) {
  beratClient.channels.fetch(channelId).then(ch => ch.send(message)
    .then(msg => setTimeout(() => {
      deleteMessage(msg);
    }, 30000)));
}

function getRandomDesperateBerat() {
  return beratDesperate[getRandomInt(beratDesperate.length)];
}

function getRandomRegularBerat() {
  return beratRegular[getRandomInt(beratRegular.length)];
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
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