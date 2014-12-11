var util       = require('geojson-utils'),
    flatten    = require('geojson-flatten'),
    wkt        = require('terraformer-wkt-parser'),
    Equality   = require('geojson-equality'),
    equality   = new Equality({precision: 5, direction: true}),
    ngeohash   = require('ngeohash'),
    parser     = require('togeojson'),
    precision  = require('geojson-precision'),
    tools      = require('./tools'),
    geojsonlib = {};



// insert geojson-utils methods
geojsonlib.tools      = util;

// insert equality methods
geojsonlib.tools.compare    = equality.compare;

// insert flatten methods
geojsonlib.tools.flatten    = flatten;

// insert parsing methods
geojsonlib.parser     = {};
geojsonlib.parser.kml = parser.kml;
geojsonlib.parser.gpx = parser.gpx;
geojsonlib.parser.wkt = wkt.parse;

// insert geohash methods
geojsonlib.hash       = ngeohash;

// insert precision method
geojsonlib.tools.precision  = precision;

// insert missing tools methods
var methodNames = Object.getOwnPropertyNames(tools);

methodNames.forEach(function methodIterator (methodName) {
  geojsonlib.tools[methodName] = tools[methodName];
});


module.exports        = geojsonlib;
