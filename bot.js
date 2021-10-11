const { Client, Intents } = require('discord.js');
const { getTime } = require('./utils');
const { refreshDolar, recordListeners } = require('./dolar_utils');

const dolarKacCommandName = 'dolarkac';
const rekorKacCommandName = 'rekorkac';
const gunlukRekorKacCommandName = 'gunlukrekorkac';

let channel;

function onRecord(dolarData) {
  channel.send(`REKORLARDAYIM: ${dolarData.record}`);
}

async function handleInteraction(interaction) {
  if (interaction.isCommand()) {
    const commandName = interaction.commandName;
    await interaction.deferReply();
    refreshDolar(dolarData => {
      if (commandName === gunlukRekorKacCommandName) {
        interaction.followUp(`Gunluk Rekorum: ${dolarData.dailyRecord}`);
      } else if (commandName === rekorKacCommandName) {
        interaction.followUp(`Rekorum: ${dolarData.record}`);
      } else if (commandName === dolarKacCommandName) {
        interaction.followUp(`Durumum: ${dolarData.current}`);
      }
    });
  }
}

module.exports.startDolarBot = function startDolarBot(token) {
  const client = new Client({ 
    intents: [
      Intents.FLAGS.GUILDS,
      Intents.FLAGS.GUILD_MESSAGES,
      Intents.FLAGS.DIRECT_MESSAGES
    ]
  });

  client.on('ready', () => {
    console.log(`${getTime()}: Logged in as ${client.user.tag}\n===============================================`);
    client.channels.fetch(process.env.RECORD_CHANNEL_ID).then(c => channel = c);
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
    ]);
  });

  client.on('interactionCreate', handleInteraction);

  process.on('unhandledRejection', (error) => {
    console.error(`${getTime()}: Unhandled promise rejection:`, error);
  });

  refreshDolar(null);
  recordListeners.push(onRecord);
  setInterval(() => refreshDolar(null), 300000);

  client.login(token);
}