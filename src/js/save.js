// store all the helper methods
var Settings = require('settings');
var Helper = require('helper');
var Save = {}

Save.favoriteStopListContains = function(busStopId) {
  var data = Settings.data();
  //Settings.data("favorite_list",null);
  var stopList = data["favorite_list"] || [];
  var stopIdList = [];
  for(var i = 0; i < stopList.length; i++) {
    stopIdList.push(stopList[i].stopId);
  }
  console.log("Favorite Stop ID list " + stopIdList);
  return Helper.arrayContains(stopIdList,busStopId);
}

module.exports = Save;
