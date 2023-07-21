const { Telegraf } = require('telegraf');
const { subExists, Platform, SubscriptionType, addSub, removeSub, getSubsFor } = require('./config');
const { refreshDolar, recordListeners, localReferenceListeners } = require('./dolar_utils');

let bot;

module.exports.startDolarTelegramBot = function(botToken) {
  recordListeners.push(onRecord);
  localReferenceListeners.push(onLocalReferenceChange);
  bot = new Telegraf(botToken);
  bot.command('dolarkac', dollarQueryCommand);
  bot.command('gunlukrekor', dailyRecordQueryCommand);
  bot.command('rekorkac', recordQueryCommand);
  bot.command('togglerecord', toggleRecordCommand);
  bot.command('toggleriseandfall', toggleRiseAndFallCommand);
  bot.command('substatus', subStatusQueryCommand);
  bot.launch();
}

async function dollarQueryCommand(ctx) {
  const dolarData = await refreshDolar();
  ctx.reply(`Durumum: ${dolarData.current}`);
}

async function recordQueryCommand(ctx) {
  const dolarData = await refreshDolar();
  ctx.reply(`Rekorum: ${dolarData.record}`);
}

async function dailyRecordQueryCommand(ctx) {
  const dolarData = await refreshDolar();
  ctx.reply(`Gunluk Rekorum: ${dolarData.dailyRecord}`);
}

function toggleSub(ctx, subType) {
  const chatId = ctx.message.chat.id;
  if (!subExists(Platform.TELEGRAM, subType, chatId)) {
    addSub(Platform.TELEGRAM, subType, chatId);
    ctx.reply('Yazacam buraya...');
  }
  else {
    removeSub(Platform.TELEGRAM, subType, chatId);
    ctx.reply('Tamam tamam... sustum...');
  }
}

function toggleRiseAndFallCommand(ctx) {
  toggleSub(ctx, SubscriptionType.RISE_AND_FALL);
}

function toggleRecordCommand(ctx) {
  toggleSub(ctx, SubscriptionType.RECORD);
}

function subStatusQueryCommand(ctx) {
  const chatId = ctx.message.chat.id;
  let msg = `Rekor Mesajlari: ${subExists(Platform.TELEGRAM, SubscriptionType.RECORD, chatId) ? 'ACIK' : 'KAPALI'}\n`;
  msg += `Cikis/Inis Mesajlari: ${subExists(Platform.TELEGRAM, SubscriptionType.RISE_AND_FALL, chatId) ? 'ACIK' : 'KAPALI'}`;
  ctx.reply(msg);
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
