var UI = require('ui');
var Version = {}
Version.showAboutPage = function() {
  var aboutPage = new UI.Card({
    title: "CatchOneBus",
    body: "CatchOneBus is aimed to check your transit by a simple click on your wrist, app developed by Yaoyu Yang, logo by Dian Zhang. If you enjoy the app, please give us a like! Any feedbacks are welcome!",
    scrollable: true
  });
  aboutPage.show();
};

Version.showVersionPage = function() {
  var versionInfos = [{
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
  detailPage = new UI.Card({
    title: e.item.title,
    body:  e.item.subtitle,
    scrollable: true,
    style: 'small'
  });
  detailPage.show();
}

module.exports = Version;
