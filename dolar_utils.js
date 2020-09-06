const https = require('https');

const nowRegex = /imdi \$1 = ([0-9]+.[0-9]+)/;
const recordRegex = /zamanlar Rekor \$1 = ([0-9]+.[0-9]+)/;
const dailyRecordRegex = /i Rekor \$1 = ([0-9]+.[0-9]+)/;

const recordListeners = [];

module.exports.recordListeners = recordListeners;

let dolarData = null;

class DolarData {
  constructor(current, record, dailyRecord) {
    this.current = current;
    this.record = record;
    this.dailyRecord = dailyRecord;
  }
}

module.exports.DolarData = DolarData;

function onRecord(dolarData) {
  recordListeners.forEach(element => {
    element(dolarData);
  });
}

module.exports.refreshDolar = function refreshDolar(callback) {
  https.get('https://dolarrekorkirdimi.com', response => {
    let body = '';
    response.on('data', chunk => {
      body += chunk;
    });
    response.on('end', () => {
      try {
        let newDolarData = new DolarData(body.match(nowRegex)[1], body.match(recordRegex)[1], body.match(dailyRecordRegex)[1]);
        if (dolarData != null) {
          if (parseFloat(dolarData.record) + 0.0001 > parseFloat(newDolarData.record)) {
            onRecord(newDolarData);
          }
        }

        dolarData = newDolarData;
        if(callback != null) callback(newDolarData);
      } catch (err) {
        console.log(err);
      }
    });
  }).end();
}