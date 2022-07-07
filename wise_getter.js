const { getRecord } = require("./config");
const { DolarData } = require("./dolar_data");

module.exports.getFromWise = function (data) {
  const values = data.map(ele => ele.value)
  const now = values[values.length - 1];
  const dailyMax = Math.max(...values);
  return new DolarData(now, getRecord(), dailyMax);
}