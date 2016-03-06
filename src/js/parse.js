var Helper = require('helper');
var Save = require('save');
// Handle data parse services
var Parse = {};

Parse.stopList = function(data, region) {
  // parse list of raw data from transit api request
  var list = [];
  if (region === "boston") {
    for (var i = 0; i < data.stop.length; i++) {
      if (data.stop[i].parent_station_name.length === 0) {
        list.push(data.stop[i]);
      }
    }
  } else if (Helper.arrayContains(["pugetsound","newyork","tampa"], region)) {
    if (data.data) {
      list = data.data.list || data.data.stops;
      console.log('data.data is available.')
    }
  } else if (region === "portland") {
    list = data.resultSet.location;
  }
  return list;
}

Parse.stopDetail = function(data, stop, region) {
  console.log("stop is " + JSON.stringify(stop));
  var name = "";
  var id = "";
  var direction = "";
  var routes = [];
  var title = "";  //title to display in menu
  var subtitle = ""; //subtitle to display in menu
  // customized parsing for name, id, direction and routes
  if (region === "pugetsound") {
    var routeIds = stop.routeIds;
    for (var k = 0; k < routeIds.length; k++ ) {
      var busDetail = Parse.busNameInfo(data, routeIds[k]);
      routes.push(busDetail.shortName);
    }
  } else if (region === "newyork") {
    var routeData = stop.routes;
    for (var k = 0; k < routeData.length; k++ ) {
      routes.push(routeData[k].shortName);
    }
  } else if (region === "tampa") {
    var routeData = stop.routeIds;
    for (var k = 0; k < routeData.length; k++ ) {
      str = routeData[k]
      routeName = str.slice(str.indexOf("Transit_") + 8, str.length);
      routes.push(routeName);
    }
  } else if (region === "boston") {
    name = stop.stop_name;
    id = stop.stop_id;
    title = stop.stop_name;
    subtitle = "";
    if (title.indexOf("@") > -1) {
      subtitle = title.substr(title.indexOf("@"));
      title = title.replace(subtitle, "");
    }
  } else if (region === "portland") {
    name = stop.desc;
    id = stop.locid;
    direction = stop.dir;
    title = stop.desc;
  }
  // common parsing for name, id and direction
  if (Helper.arrayContains(["pugetsound","newyork","tampa"], region)) {
    name = stop.name;
    id = stop.id;
    direction = stop.direction;
    title = stop.name;
    subtitle = direction + ', ' + routes.toString()
  }
  var stopDetailJSON = { 
    name: name, 
    id: id,
    direction: direction, 
    title: title,
    subtitle: subtitle,
    routes: routes.toString() 
  };
  return stopDetailJSON;
}

Parse.busNameInfo = function(data, busId) {
  // search through references to find bus name to match busId
  var routes = data.data.references.routes
  for (var i = 0; i < routes.length; i++) {
    if (routes[i].id === busId) {
      return routes[i];
    }
  }
  return null;
}

// parse bus stop list items from transit api request
Parse.stopListData = function(data, region) {
  var items = [];
  var list = Parse.stopList(data, region);
  console.log('list length is ' + list.length);
  for (var i = 0; i < list.length; i++) {
    // Always upper case the description string
    console.log(JSON.stringify(Parse.stopDetail(list[i], region)));
    stopDetailInfo = Parse.stopDetail(data, list[i], region)
    // Add to menu items array
    if (stopDetailInfo.title.length > 0) {
      items.push({
        title: stopDetailInfo.title,
        subtitle: stopDetailInfo.subtitle,
        busStopId: stopDetailInfo.id.toString(),
        stopName: stopDetailInfo.name,
        busStopdirection: stopDetailInfo.direction,
        routes: stopDetailInfo.routes
      });
    } else {
      console.log('title is blank');
    }
  }

  if (items.length === 0) {
    items = [{
      title: "No Bus Stop Around",
      subtitle: "No bus stop in 260 m radius."
    }];
  }

  items.push({
    title: "Settings",
    subtitle: "CatchOneBus settings"
  })

  // Finally return whole array
  return items;
};

Parse.busRoutesData = function(busData, region, busStopId) {
  // return JSON contains { "busTimeItems": list of bus routes short name and real arrival time, "busDetails": list of bus details }
  var busTimeItems = [];
  var busDetails = [];
  console.log("reach parseBusRoutesData " + region);
  var nowTime = parseInt(Date.now());
  if (Helper.arrayContains(["pugetsound", "tampa"], region)) {
    var arrivalsAndDepartures = busData.data.entry.arrivalsAndDepartures;
    for (var i = 0; i < arrivalsAndDepartures.length; i++)  {
      // Add to busTimeItems array
      var routeShortName = arrivalsAndDepartures[i].routeShortName;
      var predictedArrivalTime = parseInt(arrivalsAndDepartures[i].predictedArrivalTime);
      var scheduledArrivalTime = parseInt(arrivalsAndDepartures[i].scheduledArrivalTime);
      if(predictedArrivalTime === 0 || !predictedArrivalTime ) {
        predictedArrivalTime = scheduledArrivalTime;
      }
      var predictedArrivalMinutes = Parse.timeDisplay((predictedArrivalTime - nowTime)/1000);
      var predictedArrivalInfo = '';
      if (predictedArrivalMinutes > - 2) {
        if (predictedArrivalMinutes > 0) {
          predictedArrivalInfo = 'in ' + predictedArrivalMinutes + ' min';
        } else if (predictedArrivalMinutes === 0) {
          predictedArrivalInfo = 'Now';
        } else {
          predictedArrivalMinutes  = -predictedArrivalMinutes;
          predictedArrivalInfo = predictedArrivalMinutes + ' min ago';
        }
        var delayOrEarly = Math.round((predictedArrivalTime - scheduledArrivalTime)/(1000*60));

        var delayOrEarlyInfo = '';
        if (delayOrEarly > 0) {
          delayOrEarlyInfo = delayOrEarly + ' min delay';
        } else if (delayOrEarly === 0) {
          delayOrEarlyInfo = 'on time';
        } else {
          delayOrEarly  = -delayOrEarly;
          delayOrEarlyInfo = delayOrEarly + ' min early';
        }
        console.log(routeShortName + ' ' + scheduledArrivalTime);

        var tripHeadsign = arrivalsAndDepartures[i].tripHeadsign;

        busTimeItems.push({
          title: routeShortName + ', ' + predictedArrivalInfo,
          subtitle: delayOrEarlyInfo + ', ' + tripHeadsign
        });

        busDetails.push(arrivalsAndDepartures[i]);
      }
    }
  } else if (region === "newyork") {
    // console.log(JSON.stringify(busData.Siri));
    var arrivalsAndDepartures = busData.Siri.ServiceDelivery.StopMonitoringDelivery[0].MonitoredStopVisit;
    // console.log(JSON.stringify(busData.Siri.ServiceDelivery.StopMonitoringDelivery[0]));
    // console.log(JSON.stringify(busData.Siri.ServiceDelivery.StopMonitoringDelivery[0].MonitoredStopVisit));
    // console.log(JSON.stringify(arrivalsAndDepartures));
    for (var i = 0; i < arrivalsAndDepartures.length; i++)  {
      var monitoredInfo = arrivalsAndDepartures[i].MonitoredVehicleJourney;
      var routeShortName = monitoredInfo.PublishedLineName;
      var predictedArrivalTime = new Date();
      var predictedArrivalInfo = "";
      var tripHeadsign = monitoredInfo.DestinationName;
      if (monitoredInfo.MonitoredCall.hasOwnProperty("ExpectedArrivalTime")) {
        predictedArrivalTime = new Date(monitoredInfo.MonitoredCall.ExpectedArrivalTime);
        predictedArrivalInfo = ', in ' + Parse.timeDisplay((predictedArrivalTime.getTime() - nowTime)/1000) + ' min';
      } else {
        predictedArrivalInfo = ', ' + monitoredInfo.MonitoredCall.Extensions.Distances.PresentableDistance;
      }
      busTimeItems.push({
        title: routeShortName + predictedArrivalInfo,
        subtitle: tripHeadsign
      });
    }
  } else if (region === "boston") {
    for (var i = 0; i < (busData.mode || []).length; i++) {
      var mode = busData.mode[i];
      for (var j = 0; j < mode.route.length; j++) {
        var route = mode.route[j];
        for (var k = 0; k < route.direction.length; k++) {
          var direction = route.direction[k];
          for (var l = 0; l < direction.trip.length; l++) {
            var trip = direction.trip[l];
            busTimeItems.push({
                title: route.route_id + ', in ' + Parse.timeDisplay(trip.pre_away) + ' min',
                subtitle: trip.trip_headsign
            });
          }
        }
      }
    }
    busTimeItems = Parse.sortByKeyTime(busTimeItems, "title");
  } else if (region === "portland") {
    var arrivalsAndDepartures = busData.resultSet.arrival;
    if (!arrivalsAndDepartures) {
      arrivalsAndDepartures = [];
    }
    for (var i = 0; i < arrivalsAndDepartures.length; i++)  {
      var shortSign = arrivalsAndDepartures[i].shortSign;
      var routeShortName = arrivalsAndDepartures[i].route;
      // display Red, Blue, etc instead of number for MAX lines.
      if (Helper.arrayContains(["Red", "Blue", "Green", "Orange", "Yellow"], shortSign.split(" ")[0])) {
        routeShortName = shortSign.split(" ")[0];
      } else if (Helper.arrayContains(shortSign.split(" "), "Streetcar")) {
        routeShortName = shortSign.split(" ")[2];
      }
      // display NS, A, B instead of number for Portland Streetcar

      var predictedArrivalTime = parseInt(arrivalsAndDepartures[i].estimated);
      var scheduledArrivalTime = parseInt(arrivalsAndDepartures[i].scheduled);
      if(predictedArrivalTime === 0 || !predictedArrivalTime ) {
        predictedArrivalTime = scheduledArrivalTime;
      }
      var predictedArrivalMinutes = Parse.timeDisplay((predictedArrivalTime - nowTime)/1000);
      var predictedArrivalInfo = '';
      if (predictedArrivalMinutes > - 2) {
        if (predictedArrivalMinutes > 0) {
          predictedArrivalInfo = 'in ' + predictedArrivalMinutes + ' min';
        } else if (predictedArrivalMinutes === 0) {
          predictedArrivalInfo = 'Now';
        } else {
          predictedArrivalMinutes  = -predictedArrivalMinutes;
          predictedArrivalInfo = predictedArrivalMinutes + ' min ago';
        }
        var delayOrEarly = Math.round((predictedArrivalTime - scheduledArrivalTime)/(1000*60));

        var delayOrEarlyInfo = '';
        if (delayOrEarly > 0) {
          delayOrEarlyInfo = delayOrEarly + ' min delay';
        } else if (delayOrEarly === 0) {
          delayOrEarlyInfo = 'on time';
        } else {
          delayOrEarly  = -delayOrEarly;
          delayOrEarlyInfo = delayOrEarly + ' min early';
        }
        console.log(routeShortName + ' ' + scheduledArrivalTime);

        var tripHeadsign = arrivalsAndDepartures[i].fullSign.split(" to ").slice(1).join();

        busTimeItems.push({
          title: routeShortName + ', ' + predictedArrivalInfo,
          subtitle: delayOrEarlyInfo + ', ' + tripHeadsign
        });

        busDetails.push(arrivalsAndDepartures[i]);
      }
    }
  }

  if(busTimeItems.length === 0) {
    busTimeItems = [{
      title: "No buses",
      subtitle: "For the next 30 min"
    }];
    console.log('empty busTimeItems');
  }

  if (Save.favoriteStopListContains(busStopId)) {
    busTimeItems.push({
      title: "Remove from favorite",
      subtitle: "Remove from favorite."
    })
  } else {
    busTimeItems.push({
      title: "Add to favorite",
      subtitle: "Show this bus stop info in the starting page when around."
    })
  }

  busTimeItems.push({
    title: "Nearby stop list",
    subtitle: "Go to the full stop list."
  })

  busTimeItems.push({
    title: "Settings",
    subtitle: "CatchOneBus settings"
  })

  var busRealTimeInfo = {
    "busTimeItems": busTimeItems,
    "busDetails": busDetails
  };

  // Finally return whole array
  return busRealTimeInfo;
}

Parse.timeDisplay = function(timeInSec) {
  var timeToDisplay = parseInt(timeInSec)/60.0;
  if (timeToDisplay > 5) {
    return timeToDisplay.toFixed(0);
  } else {
    timeToDisplay = timeToDisplay.toFixed(1);
    if (timeToDisplay.split('.')[1] === "0") {
      return timeToDisplay.split('.')[0];
    } else {
      return timeToDisplay;
    }
  }
}

Parse.sortByKeyTime = function(array, key) {
    return array.sort(function(a, b) {
        var x = a[key].split(" in ")[1].split(" ")[0]; var y = b[key].split(" in ")[1].split(" ")[0];
        x = parseInt(x);
        y = parseInt(y);
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}

module.exports = Parse;
