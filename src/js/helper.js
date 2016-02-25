// store all the helper methods
var Settings = require('settings');
var Helper = {}

Helper.arrayContains = function(array, item) {
  for (var i = 0; i < array.length; i++) {
    if (array[i] === item) {
      return true;
    }
  }
  return false;
}

module.exports = Helper;
