const fs = require('fs');
const { platform } = require('os');

const configFile = 'dolar_config.json';

class Config {
  constructor() {
    this.subscriptions = [];
  }
}

const Platform = {
  TELEGRAM: 1,
  DISCORD: 2
}

const SubscriptionType = {
  RISE_AND_FALL: 1,
  RECORD: 2
}

let config;
if (fs.existsSync(configFile)) {
  config = JSON.parse(fs.readFileSync(configFile));
} else {
  config = new Config();
  saveConfig();
}

function saveConfig() {
  fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
}

function subEquals(a, b) {
  return a.platform === b.platform && a.type === b.type && a.chatId === b.chatId;
}

module.exports.addSub = function (platform, type, chatId) {
  const newSub = { platform: platform, type: type, chatId: chatId };
  if (config.subscriptions.some(element => subEquals(newSub, element))) {
    return false;
  }

  config.subscriptions.push(newSub);
  saveConfig();
  return true;
}

module.exports.removeSub = function (platform, type, chatId) {
  const oldSub = { platform: platform, type: type, chatId: chatId };
  config.subscriptions = config.subscriptions.filter(element => !subEquals(element, oldSub));
  saveConfig();
}

module.exports.getSubsFor = function (platform, type) {
  return config.subscriptions.filter(element => element.platform === platform && element.type === type);
}

module.exports.subExists = function (platform, type, chatId) {
  const oldSub = { platform: platform, type: type, chatId: chatId };
  return config.subscriptions.some(element => subEquals(element, oldSub));
}

module.exports.Platform = Platform;
module.exports.SubscriptionType = SubscriptionType;