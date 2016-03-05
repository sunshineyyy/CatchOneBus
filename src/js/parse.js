var Helper = require('helper');
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
      var busDetail = Parse.busInfo(data, routeIds[k]);
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

Parse.busInfo = function(data, busId) {
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
    // var title = stopDetailInfo.name;
    // console.log("");
    // var direction = stopDetailInfo.direction;
    // var routes = stopDetailInfo.routes;
    // var routesName = "";
    // if (region === "pugetsound") {
    //   var routeIds = list[i].routeIds;
    //   for (var k = 0; k < routeIds.length; k++ ) {
    //     var busDetail = Parse.busInfo(data, routeIds[k]);
    //     routes.push(busDetail.shortName);
    //   }
    // } else if (region === "newyork") {
    //   var routeData = list[i].routes;
    //   for (var k = 0; k < routeData.length; k++ ) {
    //     routes.push(routeData[k].shortName);
    //   }
    // } else if (region === "tampa") {
    //   var routeData = list[i].routeIds;
    //   for (var k = 0; k < routeData.length; k++ ) {
    //     str = routeData[k]
    //     routeName = str.slice(str.indexOf("Transit_") + 8, str.length);
    //     routes.push(routeName);
    //   }
    // } else if (region === "boston") {
    //   if (title.indexOf("@") > -1) {
    //     direction = title.substr(title.indexOf("@"));
    //     title = title.replace(direction, "");
    //   }
    // }
    // routesName = routes.toString();
    // if (routesName.length > 0) {
    //   routesName = ', ' + routesName;
    // }
    // Add to menu items array
    if (stopDetailInfo.title.length > 0) {
      items.push({
        title: stopDetailInfo.title,
        subtitle: stopDetailInfo.subtitle,
        busStopId: stopDetailInfo.id,
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


module.exports = Parse;
