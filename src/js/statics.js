var UI = require('ui');
var Vector2 = require('vector2');
var Detail = require('detail');
// Create a nice waiting card for user while waiting
var Statics = {};

Statics.welcomeWindow = Detail.add("CatchOneBus", "CatchOneBus is now on Facebook and Twitter. Like and follow us! Thanks! :)", "title_size_big")

Statics.aboutPage = Detail.add("CatchOneBus", "CatchOneBus aims to check your transit by a simple click on your wrist, app developed by Yaoyu Yang and logo by Dian Zhang. Support us by making a donation to yaoyu@uw.edu or just give us a like!")

Statics.showVersionPage = function() {
  var versionInfos = [{
    title: "2.1",
    subtitle: "Add Pebble Round support. Upgraded to SDK 3.10."
  },
  {
    title: "2.0",
    subtitle: "Add Portland support! Rewrite functions for processing transit api data into modules."
  },
  {
    title: "1.9",
    subtitle: "Rewrite codes into modules, add Settings page, add autoRefresh for busRoutesMenu, fix bugs in Boston, new way of add and remove favorite stops."
  }, {
    title: "1.8",
    subtitle: "New welcome page, fix bugs in version 1.7.1 and 1.7.2."
  }, {
    title: "1.7",
    subtitle: "Access to favorite stop real time bus info."
  }, {
    title: "1.6",
    subtitle: "Time prediction instead of distance for New York where data is available. Add version page. Fix bug in Boston when API provides no info."
  }, {
    title: "1.5",
    subtitle: "Add support for Boston. Display one digit precision time for predictions under 5 minutes. Add color for Basalt application."
  }, {
    title: "1.4",
    subtitle: "Now works in New York area. Add more radius options for 760-1060."
  }, {
    title: "1.3",
    subtitle: "Add bus detail page where you click each bus line."
  }, {
    title: "1.2",
    subtitle: "Minor updates to not show buses that have left more than 1 min ago."
  }, {
    title: "1.1",
    subtitle: "Added support for Tampa area, more Settings radius options, and also added settings entry in the bus real time info page."
  }, {
    title: "1.0",
    subtitle: "Check nearby bus stops, real bus timing info from each stop, able to favorite any stop, favorited stop bus real time info will be brought up at the first page if user is near that stop."
  }];
  var versionPage = new UI.Menu({
    sections: [{ title: "Version Info", items: versionInfos }],
  });
  versionPage.show();
  versionPage.on('select', function(e) {
    showMenuDetailPage(e);
  });
}

var showMenuDetailPage = function(e) {
  Detail.add(e.item.title, e.item.subtitle).show()
}

module.exports = Statics;
