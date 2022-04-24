const { Client, Intents } = require('discord.js');
const { getTime } = require('./utils');
const { refreshDolar, recordListeners, localReferenceListeners } = require('./dolar_utils');
const { getSubsFor, Platform, SubscriptionType, subExists, addSub, removeSub } = require('./config');

const dolarKacCommandName = 'dolarkac';
const rekorKacCommandName = 'rekorkac';
const gunlukRekorKacCommandName = 'gunlukrekorkac';
const subStatusCommandName = 'substatus';
const subscribeCommandName = 'subscribe';

let client;

async function handleInteraction(interaction) {
  if (interaction.isCommand()) {
    const chatId = interaction.channelId;
    const commandName = interaction.commandName;
    await interaction.deferReply();
    const dolarData = await refreshDolar();
    if (commandName === gunlukRekorKacCommandName) {
      interaction.followUp(`Gunluk Rekorum: ${dolarData.dailyRecord}`);
    } else if (commandName === rekorKacCommandName) {
      interaction.followUp(`Rekorum: ${dolarData.record}`);
    } else if (commandName === dolarKacCommandName) {
      interaction.followUp(`Durumum: ${dolarData.current}`);
    } else if (commandName === subStatusCommandName) {
      let msg = `Rekor Mesajlari: ${subExists(Platform.DISCORD, SubscriptionType.RECORD, chatId) ? 'ACIK' : 'KAPALI'}\n`;
      msg += `Cikis/Inis Mesajlari: ${subExists(Platform.DISCORD, SubscriptionType.RISE_AND_FALL, chatId) ? 'ACIK' : 'KAPALI'}`;
      interaction.followUp(msg);
    } else if (commandName === subscribeCommandName) {
      const subType = interaction.options.getInteger('category');
      if (!subExists(Platform.DISCORD, subType, chatId)) {
        addSub(Platform.DISCORD, subType, chatId);
        interaction.followUp('Yazacam buraya...');
      }
      else {
        removeSub(Platform.DISCORD, subType, chatId);
        interaction.followUp('Tamam tamam... sustum...');
      }
    }
  }
}

module.exports.startDolarBot = function startDolarBot(token) {
  client = new Client({ 
    intents: [
      Intents.FLAGS.GUILDS,
      Intents.FLAGS.GUILD_MESSAGES,
      Intents.FLAGS.DIRECT_MESSAGES
    ]
  });

  client.on('ready', () => {
    console.log(`${getTime()}: Logged in as ${client.user.tag}\n===============================================`);
    client.application.commands.set([
      {
        name: dolarKacCommandName,
        description: 'Dolar kac?',
        options: []
      },
      {
        name: rekorKacCommandName,
        description: 'Dolarda rekor kac?',
        options: []
      },
      {
        name: gunlukRekorKacCommandName,
        description: 'Dolarda gunluk rekor kac?',
        options: []
      },
      {
        name: subscribeCommandName,
        description: 'Mesaj abonelikleri',
        options: [
          {
            type: 'INTEGER',
            name: 'category',
            description: 'Abonelik kategorisi',
            required: true,
            choices: [
              {
                name: 'Rekor',
                value: SubscriptionType.RECORD
              },
              {
                name: 'Inis ve cikis',
                value: SubscriptionType.RISE_AND_FALL
              }
            ]
          }
        ]
      },
      {
        name: subStatusCommandName,
        description: 'Bu kanalin mesaj aboneliklerini listele',
        options: []
      }
    ]);
  });

  client.on('interactionCreate', handleInteraction);

  process.on('unhandledRejection', (error) => {
    console.error(`${getTime()}: Unhandled promise rejection:`, error);
  });

  refreshDolar();
  recordListeners.push(onRecord);
  localReferenceListeners.push(onLocalReferenceChange);
  setInterval(() => refreshDolar(), 300000);

  client.login(token);
}

function onRecord(dolarData) {
  sendMessageToGroups(`REKORLARDAYIM: ${dolarData.record}`, SubscriptionType.RECORD);
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

function sendMessageToGroups(message, subType) {
  getSubsFor(Platform.DISCORD, subType).forEach(sub => {
    client.channels.fetch(sub.chatId).then(channel => channel.send(message));
  });
}

// setInterval(() => {
//   sendMessageToGroups("Test record", SubscriptionType.RECORD);
// }, 5000);
