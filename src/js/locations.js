var Settings = require('settings');
var KEY = require('key');
var Helper = require('helper')
// Handle location services, providing URL, geoRegions
var Locations = {}

// new geoRegion function based on coords
Locations.geoRegion = function(coords) {
  var latitude = coords.lat;
  var longitude = coords.lon;
  if (latitude > 45 && latitude < 49 && longitude > -124 && longitude < -120) {
    return "pugetsound";
  } else if (latitude > 40 && latitude < 41 && longitude > -74.5 && longitude < -73) {
    return "newyork";
  } else if (latitude > 27.63 && latitude < 28.26 && longitude > -82.7 && longitude < -82.0) {
    return "tampa";
  } else if (latitude > 42.19 && latitude < 42.48 && longitude > -71.27 && longitude < -70.85) {
    return "boston";
  }
  return null;
}

Locations.urlStops = function(coords) {
  var region = Locations.geoRegion(coords);
  console.log('reached Locations.urlStops! ' + region)
  var radius = Settings.data()["searchRadius"] || 260;
  var latlon = "&lat=" + coords.lat + "&lon=" + coords.lon;
  if (Helper.arrayContains(["pugetsound","newyork","tampa"], region)) {
    return Locations.urlBus("stopsForLocations", region) + KEY[region] + latlon + "&radius=" + radius;
  } else if (region === "boston") {
    return Locations.urlBus("stopsForLocations", region) + KEY[region] + latlon + "&format=json";
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
      "realtime.mbta.com/developer/api/v2/stopsbylocation?api_key="
    },
    "routesForStops": {
      "pugetsound":
      "api.pugetsound.onebusaway.org/api/where/arrivals-and-departures-for-stop/",
      "newyork":
      "bustime.mta.info/api/siri/stop-monitoring.json?key=",
      "tampa":
      "api.tampa.onebusaway.org/api/where/arrivals-and-departures-for-stop/",
      "boston":
      "realtime.mbta.com/developer/api/v2/predictionsbystop?api_key="
    }
  }
  return "http://" + urlSource[type][region]
}

Locations.urlRoutesForStops = function(coords, busStopId) {
  var region = Locations.geoRegion(coords);
  if (region === "pugetsound") {
    return Locations.urlBus("routesForStops", region) + busStopId + ".json?key="+ KEY[region];
  } else if (region === "newyork") {
    return Locations.urlBus("routesForStops", region) + KEY[region] + "&OperatorRef=MTA" + "&MonitoringRef=" + busStopId;
  } else if (region === "tampa") {
    return encodeURI(Locations.urlBus("routesForStops", region) + busStopId + ".json?key="+ KEY[region]);
  } else if (region === "boston") {
    return Locations.urlBus("routesForStops", region) + KEY[region] + "&stop=" + busStopId + "&format=json";
  }
  return null;
}

module.exports = Locations;
