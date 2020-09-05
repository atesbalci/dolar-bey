const moment = require("moment");

module.exports.getTime = function getTime() {
  return moment().format('YY/MM/DD-HH:mm:ss');
}

module.exports.deleteMessage = function deleteMessage(msg) {
  if (msg.deletable) {
    msg.delete();
  }
};
