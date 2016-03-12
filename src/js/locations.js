var Settings = require('settings');
var KEY = require('key');
var Helper = require('helper');
// Handle location services, providing URL, geoRegions
var Locations = {};

// new geoRegion function based on coords
Locations.geoRegion = function(coords) {
  var latitude = coords.lat;
  var longitude = coords.lon;
  if (latitude > 46.5 && latitude < 48.5 && longitude > -124 && longitude < -120) {
    return "pugetsound";
  } else if (latitude > 40 && latitude < 41 && longitude > -74.5 && longitude < -73) {
    return "newyork";
  } else if (latitude > 27.63 && latitude < 28.26 && longitude > -82.7 && longitude < -82.0) {
    return "tampa";
  } else if (latitude > 42.19 && latitude < 42.48 && longitude > -71.27 && longitude < -70.85) {
    return "boston";
  } else if (latitude > 45.28 && latitude < 45.65 && longitude > -123.13 && longitude < -122.32) {
    return "portland";
  } else if (latitude > 48.99 && latitude < 49.48 && longitude > -123.43 && longitude < -122.42) {
    return "vancouver";
  } else {
    return null;
  }
}

Locations.urlStops = function(coords) {
  var region = Locations.geoRegion(coords);
  // console.log('reached Locations.urlStops! ' + region)
  var radius = Settings.data()["searchRadius"] || 260;
  var latlon = "&lat=" + coords.lat + "&lon=" + coords.lon;
  if (Helper.arrayContains(["pugetsound","newyork","tampa"], region)) {
    return Locations.urlBus("stopsForLocations", region) + KEY[region] + latlon + "&radius=" + radius;
  } else if (region === "boston") {
    return Locations.urlBus("stopsForLocations", region) + KEY[region] + latlon + "&format=json";
  } else if (region === "portland") {
    return Locations.urlBus("stopsForLocations", region) + KEY[region] + "&ll=" + coords.lat + "," + coords.lon + "&json=true&meters=" + radius;
  } else if (region === "vancouver") {
    return Locations.urlBus("stopsForLocations", region) + KEY[region] + "&lat=" + coords.lat + "&long=" + coords.lon + "&radius=" + radius;
  }
  return null;
}

Locations.urlBus = function(type, region) {
  urlSource = {
    "stopsForLocations": {
      "pugetsound": "api.pugetsound.onebusaway.org/api/where/stops-for-location.json?key=",
      "newyork":
      "bustime.mta.info/api/where/stops-for-location.json?key=",
      "tampa":
      "api.tampa.onebusaway.org/api/where/stops-for-location.json?key=",
      "boston":
      "realtime.mbta.com/developer/api/v2/stopsbylocation?api_key=",
      "portland":
      "developer.trimet.org/ws/V1/stops?appID=",
      "vancouver":
      "api.translink.ca/rttiapi/v1/stops?apikey="
    },
    "routesForStops": {
      "pugetsound":
      "api.pugetsound.onebusaway.org/api/where/arrivals-and-departures-for-stop/",
      "newyork":
      "bustime.mta.info/api/siri/stop-monitoring.json?key=",
      "tampa":
      "api.tampa.onebusaway.org/api/where/arrivals-and-departures-for-stop/",
      "boston":
      "realtime.mbta.com/developer/api/v2/predictionsbystop?api_key=",
      "portland":
      "developer.trimet.org/ws/v2/arrivals?appID="
    }
  }
  return "http://" + urlSource[type][region]
}

Locations.urlRoutesForStops = function(region, busStopId) {
  if (region === "pugetsound") {
    return Locations.urlBus("routesForStops", region) + busStopId + ".json?key="+ KEY[region];
  } else if (region === "newyork") {
    return Locations.urlBus("routesForStops", region) + KEY[region] + "&OperatorRef=MTA" + "&MonitoringRef=" + busStopId;
  } else if (region === "tampa") {
    return encodeURI(Locations.urlBus("routesForStops", region) + busStopId + ".json?key="+ KEY[region]);
  } else if (region === "boston") {
    return Locations.urlBus("routesForStops", region) + KEY[region] + "&stop=" + busStopId + "&format=json";
  } else if (region === "portland") {
    return Locations.urlBus("routesForStops", region) + KEY[region] + "&locIDs=" + busStopId + "&json=true";
  }
  return null;
}

module.exports = Locations;
