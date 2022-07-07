const { default: axios } = require('axios');
const { getRecord, setNewRecord } = require('./config');
const { getFromWise } = require('./wise_getter');

const recordListeners = [];
const localReferenceListeners = [];

module.exports.recordListeners = recordListeners;
module.exports.localReferenceListeners = localReferenceListeners;

let localReferencePoint = 0.0;

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
  const result = await axios.get('https://wise.com/rates/history+live?source=USD&target=TRY&length=2&resolution=hourly&unit=day').catch(console.error);
  if (result.status >= 300) return false;
  try {
    const tolerance = parseFloat(process.env.DOLAR_RECORD_TOLERANCE);
    const newDolarData = getFromWise(result.data);
    if (!newDolarData || newDolarData.current < 0.001) return null;
    if (localReferencePoint < 0.01) {
      localReferencePoint = newDolarData.current;
    }

    const diff = parseFloat(newDolarData.current) - localReferencePoint;
    const localReferenceTolerance = parseFloat(process.env.DOLAR_LOCAL_TOLERANCE);
    if (diff > localReferenceTolerance || diff < -localReferenceTolerance) {
      onLocalReferenceChange(newDolarData, diff);
    }
    
    if (newDolarData.record + tolerance < newDolarData.current) {
      newDolarData.record = newDolarData.current;
      setNewRecord(newDolarData.record);
      onRecord(newDolarData);
    }

    return newDolarData;
  } catch (err) {
    console.log(err);
  }

  return null;
}