# geojson.lib
[![NPM version](https://badge.fury.io/js/geojson.lib.svg)](http://badge.fury.io/js/geojson.lib)
[![dependencies](https://david-dm.org/luscus/geojson.lib.svg)](https://david-dm.org/luscus/geojson.lib)
[![devDependency Status](https://david-dm.org/luscus/geojson.lib/dev-status.svg?theme=shields.io)](https://david-dm.org/luscus/geojson.lib#info=devDependencies)


Wraps a set of GeoJSON tools into one single library and adds also a few tool methods:

- [geojson-js-utils](https://github.com/maxogden/geojson-js-utils) (*tools*): JavaScript helper functions for manipulating GeoJSON
- [geojson-precision](https://github.com/jczaplew/geojson-precision) (*tools*): Remove meaningless precision from your GeoJSON ([one post on the topic](http://gis.stackexchange.com/questions/8650/how-to-measure-the-accuracy-of-latitude-and-longitude/8674#8674)).
- [geojson-equality](https://github.com/geosquare/geojson-equality) (*tools*): Check two valid geojson geometries for equality.
- [geojson-flatten](https://github.com/mapbox/geojson-flatten) (*tools*): Flatten MultiPoint, MultiPolygon, MultiLineString, and GeometryCollection geometries in GeoJSON files into simple non-complex geometries.
- [togeojson](https://github.com/mapbox/togeojson) (*parser*): convert KML and GPX to GeoJSON, without the fuss
- [terraformer-wkt-parser](https://github.com/Esri/terraformer-wkt-parser) (*parser*): A bare-bones WKT parser.
- [ngeohash](https://github.com/sunng87/node-geohash) (*hash*): geohash library for nodejs.

## Usage

### Install

    npm install geojson.lib --save

### Example

    var geoLib = require('geojson.lib');

    geoLib.tools;  // all methods from the tool libs
    geoLib.parser; // all methods from the parser libs
    geoLib.hash;   // all methods from the hash lib

-------------------
Copyright (c) 2014 Luscus (luscus.redbeard@gmail.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
