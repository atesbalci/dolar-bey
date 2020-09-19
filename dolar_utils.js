const https = require('https');

const nowRegex = /imdi \$1 = ([0-9]+.[0-9]+)/;
const recordRegex = /zamanlar Rekor \$1 = ([0-9]+.[0-9]+)/;
const dailyRecordRegex = /i Rekor \$1 = ([0-9]+.[0-9]+)/;

const recordListeners = [];

module.exports.recordListeners = recordListeners;

let lastRecord = 0.0;

class DolarData {
  constructor(current, record, dailyRecord) {
    this.current = current;
    this.record = record;
    this.dailyRecord = dailyRecord;
  }
}

module.exports.DolarData = DolarData;

function onRecord(dolarData) {
  lastRecord = parseFloat(dolarData.record);
  const hour = new Date().getUTCHours();
  if (hour > 3) { // Basically equivalent to 6AM Turkey (disables record messages between 3AM-6AM)
    recordListeners.forEach(element => {
      element(dolarData);
    });
  }
}

module.exports.refreshDolar = function refreshDolar(callback) {
  https.get('https://dolarrekorkirdimi.com', response => {
    let body = '';
    response.on('data', chunk => {
      body += chunk;
    });
    response.on('end', () => {
      try {
        const tolerance = parseFloat(process.env.DOLAR_RECORD_TOLERANCE);
        let newDolarData = new DolarData(body.match(nowRegex)[1], body.match(recordRegex)[1], body.match(dailyRecordRegex)[1]);
        
        if (lastRecord > 0.001) {
          if (lastRecord + tolerance < parseFloat(newDolarData.record)) {
            onRecord(newDolarData);
          }
        }
        else {
          lastRecord = parseFloat(newDolarData.record);
        }

        if(callback != null) callback(newDolarData);
      } catch (err) {
        console.log(err);
      }
    });
  }).end();
}