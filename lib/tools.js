/* jshint node:true */
'use strict';

var geotools       = require('geojson-utils'),
    setPrecison    = require('geojson-precision'),
    util           = require('util'),
    wgs84MaxBounds = [
      -180.0, // 0. x/lon min/left,
      -90.0,  // 1. y/lat min/bottom,
      180.0,  // 2. x/lon max/right,
      90.0    // 3. y/lat max/top,
    ],
    geojson       = {};

function validatePosition (Position) {

  if (Position[0] < wgs84MaxBounds[0] && wgs84MaxBounds[2] < Position[0] ) {
    throw new Error('WGS84 Longitude (' + Position[0] + ') should be in the range: ' +
    wgs84MaxBounds[0] + ' to ' + wgs84MaxBounds[2]);
  }

  if (Position[1] < wgs84MaxBounds[1] && wgs84MaxBounds[3] < Position[1] ) {
    throw new Error('WGS84 Longitude (' + Position[1] + ') should be in the range: ' +
    wgs84MaxBounds[1] + ' to ' + wgs84MaxBounds[3]);
  }

  return true;
}

function positionPrecision (position, precision) {
  return position.map(function(e) {

    if (util.isArray(e)) {
      return positionPrecision(e, precision);
    }

    return 1 * e.toFixed(precision);
  });
}

function bboxToResolution (bbox, pixels) {
  pixels = pixels || 900;

  var meters = geotools.pointDistance(
    geojson.getPoint([bbox[0], bbox[1]]), // bottom right
    geojson.getPoint([bbox[2], bbox[3]])  // top left
  );

  meters = Math.ceil(meters);

  return Math.round(meters / pixels);
}

function bboxToPolygon (bbox) {

  var polygon = {
    type: 'Polygon',
    bbox: bbox,
    coordinates: [
      [[bbox[0], bbox[1]],
        [bbox[0], bbox[3]],
        [bbox[2], bbox[3]],
        [bbox[2], bbox[1]],
        [bbox[0], bbox[1]]]
    ]
  };

  return setPrecison(polygon, 4);
}

function getBBoxCenter (bbox) {
  var lon = bbox[0] + (bbox[2] - bbox[0])/2,
      lat = bbox[1] + (bbox[3] - bbox[1])/2;

  return geojson.getPoint([lon, lat]);
}

function extendBBoxWithPosition (bbox, Position) {
  Position = positionPrecision(Position, 4);

  if (Position[0] < bbox[0]) {
    bbox[0] = Position[0];
  }
  if (Position[0] > bbox[2]) {
    bbox[2] = Position[0];
  }

  if (Position[1] < bbox[1]) {
    bbox[1] = Position[1];
  }
  if (Position[1] > bbox[3]) {
    bbox[3] = Position[1];
  }

  return bbox;
}


function getBBoxFromVertices (vertices) {
  vertices = positionPrecision(vertices, 4);

  var index = vertices.length,
      bbox = [180, 90, -180, -90],
      vertice;

  while (index--) {
    vertice = vertices[index];

    if (vertice[0] < bbox[0]) {
      // set min longitude/x
      bbox[0] = vertice[0];
    }
    if (vertice[0] > bbox[2]) {
      // set max longitude/x
      bbox[2] = vertice[0];
    }

    if (vertice[1] < bbox[1]) {
      // set min latitude/y
      bbox[1] = vertice[1];
    }
    if (vertice[1] > bbox[3]) {
      // set max latitude/y
      bbox[3] = vertice[1];
    }
  }

  return bbox;
}

var geojsonTypes = [
  'Point',
  'LineString',
  'Polygon'
];

function getGeoJson (type, coordinates, bbox, precision) {
  precision = precision || 4;

  if (geojsonTypes.indexOf(type) > -1) {
    var geojson = {
      type: type,
      coordinates: coordinates
    };

    if (bbox) {
      if (util.isArray(bbox) && bbox.length === 4) {
        geojson.bbox = bbox;
      }
      else {
        geojson.bbox = getBBoxFromVertices(coordinates);
      }
    }

    return setPrecison(geojson, precision);
  }
  else {
    throw new Error('Valid GeoJSON types are: ' + geojsonTypes);
  }
}

function getPosition (longitude, latitude, elevation, precision) {
  precision = precision || 4;

  return positionPrecision([longitude, latitude, elevation], precision);
}

function destinationPosition (point, bearing, distance) {
  return geotools.destinationPoint(point, bearing, distance).coordinates;
}

function toVector (point) {
  var φ = geotools.numberToRadius(point[1]);
  var λ = geotools.numberToRadius(point[0]);

  // right-handed vector: x -> 0°E,0°N; y -> 90°E,0°N, z -> 90°N
  var x = Math.cos(φ) * Math.cos(λ);
  var y = Math.cos(φ) * Math.sin(λ);
  var z = Math.sin(φ);

  return [x, y, z];
}

function toPoint (vector) {
  var φ = Math.atan2(vector[2], Math.sqrt(vector[0]*vector[0] + vector[1]*vector[1]));
  var λ = Math.atan2(vector[1], vector[0]);

  return [geotools.numberToDegree(λ), geotools.numberToDegree(φ)];
}

function greatCircle (point, bearing) {
  var φ = geotools.numberToRadius(point[1]);
  var λ = geotools.numberToRadius(point[0]);
  var θ = geotools.numberToRadius(Number(bearing));

  var x =  Math.sin(λ) * Math.cos(θ) - Math.sin(φ) * Math.cos(λ) * Math.sin(θ);
  var y = -Math.cos(λ) * Math.cos(θ) - Math.sin(φ) * Math.sin(λ) * Math.sin(θ);
  var z =  Math.cos(φ) * Math.sin(θ);

  return [x, y, z];
}

function vectorPlus (v1, v2) {
  return [v1[0] + v2[0], v1[1] + v2[1], v1[2] + v2[2]];
}

function vectorDot (v1, v2) {
  return v1[0]*v2[0] + v1[1]*v2[1] + v1[2]*v2[2];
}

function vectorCross (v1, v2, vo1, vo2) {
  var x = v1[1]*v2[2] - v1[2]*v2[1];
  var y = v1[2]*v2[0] - v1[0]*v2[2];
  var z = v1[0]*v2[1] - v1[1]*v2[0];

  return [x, y, z];
}

function toArray (vector) {
  return [vector.x, vector.y, vector.y]
}

function intersectionPosition (path1start, path1brngEnd, path2start, path2brngEnd) {
  // if c1 & c2 are great circles through start and end points (or defined by start point + bearing),
  // then candidate intersections are simply c1 × c2 & c2 × c1; most of the work is deciding correct
  // intersection point to select! if bearing is given, that determines which intersection, if both
  // paths are defined by start/end points, take closer intersection

  var p1 = toVector(path1start);
  var p2 = toVector(path2start);

  var c1, c2, path1def, path2def;
  // c1 & c2 are vectors defining great circles through start & end points; p × c gives initial bearing vector

  if (Array.isArray(path1brngEnd)) { // path 1 defined by endpoint
    c1 = p1.cross(toVector(path1brngEnd));
    path1def = 'endpoint';
  } else {                              // path 1 defined by initial bearing
    c1 = greatCircle(path1start, Number(path1brngEnd));
    path1def = 'bearing';
  }
  if (Array.isArray(path2brngEnd)) { // path 2 defined by endpoint
    c2 = p2.cross(toVector(path2brngEnd));
    path2def = 'endpoint';
  } else {                              // path 2 defined by initial bearing
    c2 = greatCircle(path2start, Number(path2brngEnd));
    path2def = 'bearing';
  }

  // there are two (antipodal) candidate intersection points; we have to choose which to return
  var i1 = vectorCross(c1, c2);
  var i2 = vectorCross(c2, c1);

  // am I making heavy weather of this? is there a simpler way to do it?
  // selection of intersection point depends on how paths are defined (bearings or endpoints)
  var intersection=null, dir1=null, dir2=null;
  switch (path1def+'+'+path2def) {
    case 'bearing+bearing':
      // if c×p⋅i1 is +ve, the initial bearing is towards i1, otherwise towards antipodal i2
      dir1 = Math.sign(vectorDot(vectorCross(c1, p1), i1)); // c1×p1⋅i1 +ve means p1 bearing points to i1
      dir2 = Math.sign(vectorDot(vectorCross(c2, p2), i1)); // c2×p2⋅i1 +ve means p2 bearing points to i1

      switch (dir1+dir2) {
        case  2: // dir1, dir2 both +ve, 1 & 2 both pointing to i1
          intersection = i1;
          break;
        case -2: // dir1, dir2 both -ve, 1 & 2 both pointing to i2
          intersection = i2;
          break;
        case  0: // dir1, dir2 opposite; intersection is at further-away intersection point
          // take opposite intersection from mid-point of p1 & p2 [is this always true?]
          intersection = vectorDot(vectorPlus(p1, p2), i1) > 0 ? i2 : i1;
          break;
      }
      break;
    case 'bearing+endpoint': // use bearing c1 × p1
      dir1 = Math.sign(vectorDot(vectorCross(c1, p1), i1)); // c1×p1⋅i1 +ve means p1 bearing points to i1
      intersection = dir1>0 ? i1 : i2;
      break;
    case 'endpoint+bearing': // use bearing c2 × p2
      dir2 = Math.sign(vectorDot(vectorCross(c2, p2), i1)); // c2×p2⋅i1 +ve means p2 bearing points to i1
      intersection = dir2>0 ? i1 : i2;
      break;
    case 'endpoint+endpoint': // select nearest intersection to mid-point of all points
      var mid = vectorPlus(
          vectorPlus(
              vectorPlus(p1, p2),
              toVector(path1brngEnd)
          ),
          toVector(path2brngEnd)
      );
      intersection = vectorDot(mid, i1)>0 ? i1 : i2;
      break;
  }

  return toPoint(intersection);
}

function numberToBearing (number) {
  return (geotools.numberToDegree(number) + 360) % 360;
}

function bearingTo (start, end, precision) {
  var phiStart = geotools.numberToRadius(start[1]),
      phiEnd = geotools.numberToRadius(end[1]);
  var deltaLambda = geotools.numberToRadius((end[0]-start[0]));

  // see http://mathforum.org/library/drmath/view/55417.html
  var y = Math.sin(deltaLambda) * Math.cos(phiEnd);
  var x = Math.cos(phiStart)*Math.sin(phiEnd) -
    Math.sin(phiStart)*Math.cos(phiEnd)*Math.cos(deltaLambda);
  var theta = Math.atan2(y, x);

  return floatPrecision(((geotools.numberToDegree(theta) + 360) % 360), precision);
}

function rhumbBearingTo (origin, target, precision) {
  var φ1 = geotools.numberToRadius(origin[1]),
      φ2 = geotools.numberToRadius(target[1]),
      Δλ = geotools.numberToRadius(target[0] - origin[0]);

  // if dLon over 180° take shorter rhumb line across the anti-meridian:
  if (Math.abs(Δλ) > Math.PI) Δλ = Δλ>0 ? -(2*Math.PI-Δλ) : (2*Math.PI+Δλ);

  var Δψ = Math.log(Math.tan(φ2/2+Math.PI/4)/Math.tan(φ1/2+Math.PI/4));

  var θ = Math.atan2(Δλ, Δψ);

  return floatPrecision(((geotools.numberToDegree(θ) + 360) % 360), precision);
}


function floatPrecision (float, precision) {
  if (float !== Math.floor(float)) {
    if (typeof precision === 'undefined') {
      var string = float.toString(),
          decimal = string.substring(string.indexOf('.') + 1);

      precision = decimal.length;
    }

    var factor = Math.pow(10, precision);


    var result = Math.round(float * factor) / factor;

    if (precision > 0) {
      result = result.toPrecision(precision);
      return parseFloat(result);
    }

    return result;
  }

  return float;
}


module.exports = {
  wgs84MaxBounds: wgs84MaxBounds,

  validatePosition: function (Position) {
    return validatePosition(Position);
  },

  bboxToResolution: function (bbox, pixels) {
    return bboxToResolution(bbox, pixels);
  },

  bboxToPolygon: function (bbox) {
    return bboxToPolygon(bbox);
  },

  extendBBoxWithPosition: function (bbox, Position) {
    return extendBBoxWithPosition(bbox, Position);
  },

  getBBoxFromVertices: function (vertices) {
    return getBBoxFromVertices(vertices);
  },

  getBBoxCenter: function (bbox) {
    return getBBoxCenter(bbox);
  },

  getPosition: function (longitude, latitude, elevation, precision) {
    return getPosition(longitude, latitude, elevation, precision);
  },

  destinationPosition: function (point, bearing, distance) {
    return destinationPosition(point, bearing, distance);
  },

  numberToBearing: function (number) {
    return numberToBearing(number);
  },

  intersectionPosition: function (path1Start, path1Bearing, path2Start, path2Bearing, v1, v2) {
    return intersectionPosition(path1Start, path1Bearing, path2Start, path2Bearing, v1, v2);
  },

  bearingTo: function (statPosition, endPosition, precision) {
    return bearingTo(statPosition, endPosition, precision);
  },

  rhumbBearingTo: function (statPosition, endPosition, precision) {
    return rhumbBearingTo(statPosition, endPosition, precision);
  }
};


geojsonTypes.forEach(function typeIterator (type) {
  var typeProvider = function (coordinates, bbox, precision) {
    return getGeoJson(type, coordinates, bbox, precision);
  };

  typeProvider.displayName = 'get'+type;

  geojson['get'+type]        = typeProvider;
  module.exports['get'+type] = typeProvider;
});
