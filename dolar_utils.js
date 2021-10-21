const { default: axios } = require('axios');

const nowRegex = /imdi \$1 = ([0-9]+.[0-9]+)/;
const recordRegex = /zamanlar Rekor \$1 = ([0-9]+.[0-9]+)/;
const dailyRecordRegex = /i Rekor \$1 = ([0-9]+.[0-9]+)/;

const recordListeners = [];
const localReferenceListeners = [];

module.exports.recordListeners = recordListeners;
module.exports.localReferenceListeners = localReferenceListeners;

let lastRecord = 0.0;
let localReferencePoint = 0.0;

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
  localReferencePoint = parseFloat(dolarData.current);
  if (hour > 3) { // Basically equivalent to 6AM Turkey (disables record messages between 3AM-6AM)
    recordListeners.forEach(element => {
      element(dolarData);
    });
  }
}

function onLocalReferenceChange(dolarData, diff) {
  localReferencePoint += diff;
  const hour = new Date().getUTCHours();
  if (hour > 3) { // Basically equivalent to 6AM Turkey (disables record messages between 3AM-6AM)
    localReferenceListeners.forEach(element => element(dolarData, diff));
  }
}

module.exports.refreshDolar = async function refreshDolar() {
  const result = await axios.get('https://dolarrekorkirdimi.com').catch(console.error);
  if (result.status >= 300) return false;
  try {
    const body = result.data;
    const tolerance = parseFloat(process.env.DOLAR_RECORD_TOLERANCE);
    const newDolarData = new DolarData(body.match(nowRegex)[1], body.match(recordRegex)[1], body.match(dailyRecordRegex)[1]);
    if (localReferencePoint < 0.01) {
      localReferencePoint = newDolarData.current;
    }

    const diff = parseFloat(newDolarData.current) - localReferencePoint;
    const localReferenceTolerance = parseFloat(process.env.DOLAR_LOCAL_TOLERANCE);
    if (diff > localReferenceTolerance || diff < -localReferenceTolerance) {
      onLocalReferenceChange(newDolarData, diff);
    }
    
    if (lastRecord > 0.001) {
      if (lastRecord + tolerance < parseFloat(newDolarData.record)) {
        onRecord(newDolarData);
      }
    }
    else {
      lastRecord = parseFloat(newDolarData.record);
    }

    return newDolarData;
  } catch (err) {
    console.log(err);
  }

  return null;
}