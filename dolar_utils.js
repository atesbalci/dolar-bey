const { default: axios } = require('axios');
const { getRecord, setNewRecord } = require('./config');

const nowRegex = /class="YMlKec fxKbKc">([0-9]+\.[0-9]+)</;
const dailyRecordRegex = /class="textRight__c48cb57cd6">"([0-9]+\.[0-9]+)"</; // TODO

const recordListeners = [];
const localReferenceListeners = [];

module.exports.recordListeners = recordListeners;
module.exports.localReferenceListeners = localReferenceListeners;

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
  const result = await axios.get('https://www.google.com/finance/quote/USD-TRY?hl=en').catch(console.error);
  if (result.status >= 300) return false;
  try {
    const body = result.data;
    const tolerance = parseFloat(process.env.DOLAR_RECORD_TOLERANCE);
    // console.log(body);
    const newDolarData = new DolarData(body.match(nowRegex)[1], getRecord(), body.match(nowRegex)[1]);
    if (localReferencePoint < 0.01) {
      localReferencePoint = newDolarData.current;
    }

    const diff = parseFloat(newDolarData.current) - localReferencePoint;
    const localReferenceTolerance = parseFloat(process.env.DOLAR_LOCAL_TOLERANCE);
    if (diff > localReferenceTolerance || diff < -localReferenceTolerance) {
      onLocalReferenceChange(newDolarData, diff);
    }
    
    if (newDolarData.record > 0.001) {
      if (newDolarData.record + tolerance < newDolarData.record) {
        setNewRecord(newDolarData.record);
        onRecord(newDolarData);
      }
    }

    return newDolarData;
  } catch (err) {
    console.log(err);
  }

  return null;
}