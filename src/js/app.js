var UI = require('ui');
var ajax = require('ajax');
var Vector2 = require('vector2');
var Accel = require('ui/accel');
var Vibe = require('ui/vibe');
var Settings = require('settings');
var KEY = require('key');
var Statics = require('statics');
var Tests = require('tests');
var Locations = require('locations');
var Helper = require('helper');
var Save = require('save');
var Detail = require('detail');
var Parse = require('parse');

// Set a configurable with the open callback
Settings.config(
  { url: 'http://www.yaoyuyang.com/catchonebus/config/' },
  function(e) {
    // console.log('opening configurable');
  },
  function(e) {
    // console.log('closed configurable');
  }
);

Statics.welcomeWindow.show();

// Request location
navigator.geolocation.getCurrentPosition(locationSuccess, locationError);

function locationError(err) {
  console.log('location error (' + err.code + '): ' + err.message);
  Detail.add('Location Error', "Sorry, we can not determine your location. Make sure turn on location services for Pebble Time app on your phone.").show();
}

// When location request succeeds
function locationSuccess(position) {
  var coords = {
    "lat": position.coords.latitude,
    "lon": position.coords.longitude
  }
  // coords = Tests.cases['Boston2'];
  coords = Tests.cases['Seattle'];
  // coords = Tests.cases['New York'];
  // coords = Tests.cases['Tampa'];
  // coords = Tests.cases['Portland'];
  // coords = Tests.cases['Vancouver'];
  // coords = Tests.cases['Vancouver2'];
  var currentGeoRegion = Locations.geoRegion(coords);
  console.log(currentGeoRegion);
  var currentStopIds = showStopListMenu(coords, false, false);
  // console.log("currentStopIds, " + currentStopIds);
  // Check if any favorite locations is nearby
  var favoriteData = Settings.data()["favorite_list"] || [];
  var favoritePageToShow = false;
  for (var i = 0; i < favoriteData.length; i++) {
    // console.log( i + "th favorite stop id is " + favoriteData[i].stopId);
    if (Helper.arrayContains(currentStopIds, favoriteData[i].stopId)) {
      // console.log("matched favorite stop id is " + favoriteData[i].stopId);
      showBusRoutesMenu(favoriteData[i].stopId, favoriteData[i].name, favoriteData[i].direction, currentGeoRegion);
      favoritePageToShow = true;
    }
  }
  if (!favoritePageToShow) {
    showStopListMenu(coords);
  }
}

// Prepare the accelerometer
Accel.init();

var showStopListMenu = function(coords,asyncMode,showMode) {
  var url = Locations.urlStops(coords);
  var region = Locations.geoRegion(coords);
  var stopIdList = [];
  if (typeof asyncMode === 'undefined') { asyncMode = true ; }
  if (typeof showMode === 'undefined') { showMode = true ; }
  // console.log('asyncMode is ' + asyncMode)
  console.log("urlStops is " + url);
  ajax(
    {
      url: url,
      type:'json',
      headers: { accept:'application/JSON' },
      async: asyncMode
    },
    function(data) {
      // Create an array of Menu items
      // console.log(JSON.stringify(data));
      var menuItems = Parse.stopListData(data,region);
      var favoriteData = Settings.data()["favorite_list"] || [];
      if (favoriteData.length > 0) {
        menuItems.unshift({
          title: "Favorite stops"
        })
      }
      stopIdList = Parse.stopIdsFromData(data,region);
      console.log("stopIdList " + stopIdList);
      if (showMode) {
        // Construct Menu to show to user
        var resultsMenu = new UI.Menu({
          backgroundColor: 'white',
          textColor: 'black',
          highlightBackgroundColor: 'bulgarianRose',
          highlightTextColor: 'white',
          sections: [{
            title: 'Nearby stops',
            items: menuItems
          }]
        });

        // Show the Menu, hide the splash
        resultsMenu.show();
        Statics.welcomeWindow.hide();

        // Add an action for SELECT
        resultsMenu.on('select', function(e) {
          if (e.item.title === "Settings") {
            appSettings();
          } else if (e.item.title === "Favorite stops") {
            showFavoriteStops(region);
          } else {
            // console.log(JSON.stringify(menuItems[e.itemIndex]));
            var busStopName = menuItems[e.itemIndex].stopName;
            var busStopId = menuItems[e.itemIndex].busStopId;
            var busStopDirection = menuItems[e.itemIndex].busStopdirection;
            showBusRoutesMenu(busStopId, busStopName, busStopDirection, region);
          }
        }); // end resultsMenu.on
        
        // Add an action for Long click
        resultsMenu.on('longSelect', function(e) {
          // console.log("long click received");
          // console.log(JSON.stringify(menuItems[e.itemIndex]));
          var busStopName = menuItems[e.itemIndex].stopName;
          var busStopId = menuItems[e.itemIndex].busStopId;
          var busStopDirection = menuItems[e.itemIndex].busStopdirection;
          if (busStopDirection) {
            busStopDirection = '\n(' + busStopDirection + ' bound)';
          }
          Detail.add('Stop Detail', busStopName + busStopDirection + '\n' + 'Stop ID: ' + busStopId.split("_").pop(-1)).show();
        }); // end resultsMenu.on

        // Register for 'tap' events
        resultsMenu.on('accelTap', function(e) {
          ajax(
            {
              url: url,
              type:'json'
            },
            function(data) {
              // Update the Menu's first section
              menuItems = Parse.stopListData(data,region);
              if (favoriteData.length > 0) {
                menuItems.unshift({
                  title: "Favorite stops"
                })
              }
              resultsMenu.items(0, menuItems);
              // console.log(JSON.stringify(Parse.stopListData(data,region)));
            },
            function(error) {
              console.log('Download failed: ' + error);
            }
          );
        });
      }
    }
  );
  return stopIdList;
};

var showBusRoutesMenu = function(busStopId, busStopName, busStopDirection, region, asyncMode) {
  // show bus routes for a given stop id
  if (typeof asyncMode === 'undefined') { asyncMode = true; }
  var busStopURL = Locations.urlRoutesForStops(region, busStopId);
  console.log("busStopURL is " + busStopURL);
  // var region = Locations.geoRegion(coords);
  console.log(busStopURL);
  ajax(
    {
      url: busStopURL,
      type: 'json',
      headers: { accept:'application/JSON' },
      async: asyncMode
    },
    function(busData) {
      var detailRoutes = new UI.Menu({
        backgroundColor: 'white',
        textColor: 'black',
        highlightBackgroundColor: 'bulgarianRose',
        highlightTextColor: 'white',
        sections: [{
          title: busStopName + ' ' + busStopDirection,
          items: Parse.busRoutesData(busData, region, busStopId)
        }],
      });

      detailRoutes.show();
      Statics.welcomeWindow.hide();

      // Add an action for select save as favorite
      detailRoutes.on('select', function(e) {
        if (e.item.title === "Add to favorite") {
          var data = Settings.data();
          //Settings.data("favorite_list",null);
          var stopList = data["favorite_list"] || [];
          var stopIdList = [];
          for(var i = 0; i < stopList.length; i++) {
            stopIdList.push(stopList[i].stopId);
          }
          // console.log(stopIdList);
          if (Save.favoriteStopListContains(busStopId)) {
            showfavoriteConfirmPage(busStopId,busStopName,busStopDirection);
          } else {
            stopList.push({
              stopId: busStopId,
              name: busStopName,
              direction: busStopDirection,
              region: region
            });
            showfavoriteConfirmPage(busStopId,busStopName,busStopDirection);
          }
          Settings.data("favorite_list", stopList);
          console.log(JSON.stringify(Settings.data()));
        } else if (e.item.title === "Remove from favorite") {
          deleteFavoriteStop(busStopId, detailRoutes);
        } else if (e.item.title === "Nearby stop list") {
          navigator.geolocation.getCurrentPosition(locationSuccess, locationError);
          function locationError(err) {
            console.log('location error (' + err.code + '): ' + err.message);
          }
          // When location request succeeds
          function locationSuccess(position) {
            var coords = {
              "lat": position.coords.latitude,
              "lon": position.coords.longitude
            }
            showStopListMenu(coords);
          }
        } else if (e.item.title === "Settings") {
          appSettings();
        } else if (e.item.title === "No buses") {
        } else {
          showBusDetailPage(e,region);
          // Pause development for bus alert system
          // showBusTrackingPage(latitude, longitude,Parse.busRoutesData(busData).busDetails[e.itemIndex]);
        }
      });

      var refresh_times = 0
      setInterval(function() { ajax(
        {
          url: busStopURL,
          headers: { accept:'application/JSON' },
          type:'json'
        },
        function(updatedBusData) {
          // Update the bus time list
          detailRoutes.items(0, Parse.busRoutesData(updatedBusData, region, busStopId));
          console.log('autoRefresh ' + refresh_times + ' for ' + busStopId);
          refresh_times += 1;
        },
        function(busDataError) {
          console.log('Download failed: ' + busDataError);
        }) }, 30000)

      // Register for 'tap' events
      detailRoutes.on('accelTap', function(e) {
        ajax(
          {
            url: busStopURL,
            type:'json'
          },
          function(updatedBusData) {
            // Update the bus time list
            detailRoutes.items(0, Parse.busRoutesData(updatedBusData, region, busStopId));
            // console.log(JSON.stringify(Parse.busRoutesData(updatedBusData, region, busStopId)["busTimeItems"]));
            // console.log(JSON.stringify(Parse.busRoutesData(updatedBusData, region, busStopId)["busDetails"]));
          },
          function(busDataError) {
            console.log('Download failed: ' + busDataError);
          }
        );
      });
    },
    function(error) {
      showNoBusPage();
      console.log('Download failed: ' + JSON.stringify(error));
    }
  );
}

var showBusDetailPage = function(e, region) {
  var detail = e.item.subtitle.split(",");
  // string for describing at which station in the detail card
  var stopNameDescription = 'At:' + Helper.addSpaceBefore(e.section.title)
  if (detail[1]) {
    Detail.add(e.item.title, detail[0] + '\nTo:' + Helper.addSpaceBefore(detail[1]) + '\n' + stopNameDescription).show();
    // console.log('reach detail[1]')
  } else {
    Detail.add(e.item.title, 'To:' + Helper.addSpaceBefore(detail[0]) + '\n' +stopNameDescription).show();
  }
}

var showBusTrackingPage = function(latitude, longitude, busDetail) {
  var timing = [];
  for (var i = 0; i < 8; i ++) {
    k = i + 1;
    timing.push({
      title: k + " min alert",
      subtitle: "before bus arrives"
    });
  }

  var busDetailPage = new UI.Menu({
    sections: [ {
      title: busDetail.routeShortName + ', ' + busDetail.tripHeadsign,
      items: timing
    } ],
  });

  busDetailPage.show();

  busDetailPage.on('select', function(e) {
    notifyBusApproaching(latitude, longitude, busDetail, e.item.title);
  });
}

var notifyBusApproaching = function(latitude, longitude, busDetail,timer) {
  timer = parseInt(timer) // mins
  console.log(urlRoutesForBus(latitude, longitude, busDetail));
  var interval = window.setInterval(function() {
    ajax(
    {
      url: urlRoutesForBus(latitude, longitude, busDetail),
      type: 'json'
    },
    function(busData) {
      var nowTime = parseInt(Date.now());
      console.log("nowTime " + nowTime);
      console.log("timer " + timer);
      var predictedArrivalTime = parseInt(busData.data.entry.predictedArrivalTime);
      var scheduledArrivalTime = parseInt(busData.data.entry.scheduledArrivalTime);
      if (predictedArrivalTime === 0 || !predictedArrivalTime ) {
        predictedArrivalTime = scheduledArrivalTime;
      }
      console.log("predictedArrivalTime " + predictedArrivalTime);
      if ( (predictedArrivalTime - nowTime) < timer * 60 * 1000 ) {
        console.log("Alert!");
        Vibe.vibrate('long');
        showBusAlertPage(busDetail, timer);
        clearInterval(interval);
      }
    }
    )
  }, 10000);
}

var showBusAlertPage = function(busDetail, timer) {
  var alertPage = new UI.Card({
    title: busDetail.routeShortName + " arriving!",
    body: busDetail.routeShortName + " towords " + busDetail.tripHeadsign + " is arriving in " + timer + ' min',
  });
  alertPage.show();
};

var showfavoriteConfirmPage = function(busStopId, busStopName, busStopDirection) {
  var favoriteItems = [];
  favoriteItems.push({
    title: busStopName,
    subtitle: busStopDirection + ", Stop_ID " + busStopId
  });
  favoriteItems.push({
    title: "Favorite stops",
    subtitle: "Already saved favorite stops."
  });
  var favoriteConfirm = new UI.Menu({
    sections: [{ title: "Saved", items: favoriteItems }],
  });
  favoriteConfirm.show();
  favoriteConfirm.on('select', function(e) {
    if (e.item.title === "Favorite stops") {
      showFavoriteStops();
      favoriteConfirm.hide();
    }
  });
};

var appSettings = function() {
  var settingItems = [];
  settingItems.push({
    title: "Favorite stops",
    subtitle: "A full list of saved favorite stops"
  });
  settingItems.push({
    title: "Search radius",
    subtitle: "Set search radius"
  });
  settingItems.push({
    title: "About"
  });
  settingItems.push({
    title: "Version"
  });
  var settingPage = new UI.Menu({
    sections: [{ title: "Settings", items: settingItems }],
  });
  settingPage.show();
  settingPage.on('select', function(e) {
    if (e.item.title === "Favorite stops") {
      showFavoriteStops();
    }
    if (e.item.title === "Search radius") {
      showRadiusSettings();
    }
    if (e.item.title === "About") {
      Statics.aboutPage.show();
    }
    if (e.item.title === "Version") {
      Statics.showVersionPage();
    }
  });
};

var showFavoriteStops = function() {
  var favoriteStopList = [];
  var favoriteStopListData = Settings.data()["favorite_list"] || [];
  for (var i = 0; i < favoriteStopListData.length; i ++) {
    favoriteStopList.push({
      title: favoriteStopListData[i].name,
      subtitle: favoriteStopListData[i].direction + ", Stop_ID " + favoriteStopListData[i].stopId
    });
  }
  if (favoriteStopList.length === 0) {
    var favoriteStopsPage = new UI.Card({
      body: "No Favorite Stops. To add, go to Nearby stops, click on a stop and Add to favorite. Added stops will then show up first when appear nearby."
    });
  } else {
    var favoriteStopsPage = new UI.Menu({
      sections: [{ title: "Favorite stops", items: favoriteStopList }],
    });
  }

  favoriteStopsPage.show();
  favoriteStopsPage.on('select', function(e) {
    showBusRoutesMenu(favoriteStopListData[e.itemIndex].stopId, favoriteStopListData[e.itemIndex].name, favoriteStopListData[e.itemIndex].direction, favoriteStopListData[e.itemIndex].region);
  // favoriteStopsPage.hide();
  });
  favoriteStopsPage.on('longSelect', function(e) {
    // console.log("long click received");
    var busStopName = favoriteStopListData[e.itemIndex].name;
    var busStopId = favoriteStopListData[e.itemIndex].stopId;
    var busStopDirection = favoriteStopListData[e.itemIndex].direction;
    if (busStopDirection) {
      busStopDirection = '\n(' + busStopDirection + ' bound)';
    }
    Detail.add('Stop Detail', busStopName + busStopDirection + '\n' + 'Stop ID: ' + busStopId.split("_").pop(-1)).show();
  // favoriteStopsPage.hide();
  });
};

var showRadiusSettings = function() {
  var radiusList = [
    { title: "160" },
    { title: "260" },
    { title: "360" },
    { title: "460" },
    { title: "560" },
    { title: "760" },
    { title: "860" },
    { title: "960" },
    { title: "1060" },
  ];
  var radiusSettings = new UI.Menu({
    sections: [{ title: "Search radius in meters", items: radiusList }],
  });
  radiusSettings.show();
  radiusSettings.on('select', function(e) {
    Settings.data("searchRadius", e.item.title);
    console.log(JSON.stringify(Settings.data()));
    var searchRadiusConfirm = new UI.Card({
      title: "Confirmed",
      body: "Search radius is now " + Settings.data()["searchRadius"] + " meters"
    });
    searchRadiusConfirm.show();
    radiusSettings.hide();
  });
};

var showNoBusPage = function() {
  var noBusPage = new UI.Card({
    title: "No Bus",
    body: "No bus real time info is available for this stop."
  });
  noBusPage.show();
}

var deleteFavoriteStop = function(busStopId, detailRoutes) {
  var deletePage = new UI.Menu({
    sections: [{
      title: "Delete Stop",
      items: [
        {
          title: "Delete",
          subtitle: "Remove this stop from favorite stops"
        }
      ]
    }],
  });
  deletePage.show();
  deletePage.on('select', function(e) {
    if(e.item.title === "Delete") {
      var favoriteStopListData = Settings.data()["favorite_list"];
      for (var i = 0; i < favoriteStopListData.length; i ++) {
        if (favoriteStopListData[i].stopId === busStopId) {
          favoriteStopListData.splice(i,1);
          Settings.data("favorite_list", favoriteStopListData);
          deletePage.hide();
          detailRoutes.hide();
          navigator.geolocation.getCurrentPosition(locationSuccess, locationError);
          function locationError(err) {
            console.log('location error (' + err.code + '): ' + err.message);
          }
          // When location request succeeds
          function locationSuccess(position) {
            var coords = {
              "lat": position.coords.latitude,
              "lon": position.coords.longitude
            }
            showStopListMenu(coords);
          }
          break;
        }
      }
    }
  });
};

var urlBusPugetSound = "http://api.pugetsound.onebusaway.org/api/where/arrival-and-departure-for-stop/";
var urlBusTampa = "http://api.tampa.onebusaway.org/api/where/arrival-and-departure-for-stop/";

var urlRoutesForBus = function(latitude, longitude, busDetail) {
  var region = geoRegion(latitude,longitude);
  if (region === "pugetsound") {
    return urlBusPugetSound + busDetail.stopId + ".json?key="+ KEY_PUGET_SOUND + "&tripId=" + busDetail.tripId + "&serviceDate=" + busDetail.serviceDate + "&vehicleId=" + busDetail.vehicleId + "&stopSequence=" + busDetail.stopSequence;
  } else if (region === "tampa") {
    return encodeURI(urlBusTampa + busDetail.stopId + ".json?key="+ KEY_TAMPA + "&tripId=" + busDetail.tripId + "&serviceDate=" + busDetail.serviceDate + "&vehicleId=" + busDetail.vehicleId + "&stopSequence=" + busDetail.stopSequence);
  }
  return null;
}
