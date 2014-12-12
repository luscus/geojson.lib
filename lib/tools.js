var geotools       = require('geojson-utils'),
    precision      = require('geojson-precision'),
    util           = require('util'),
    wgs84MaxBounds = [
      -180.0, // 0. x/lon min/left,
      -90.0,  // 1. y/lat min/bottom,
      180.0,  // 2. x/lon max/right,
      90.0    // 3. y/lat max/top,
    ];

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
    getPoint(bbox[0], bbox[1]), // bottom right
    getPoint(bbox[2], bbox[3])  // top left
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
       [bbox[2], bbox[1]]]
    ]
  };

  return precision(polygon, 4);
}

function getBBoxCenter (bbox) {
  var lon = bbox[0] + (bbox[2] - bbox[0])/2,
      lat = bbox[1] + (bbox[3] - bbox[1])/2;

  return getPoint(lon, lat);
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

function getPoint (lon, lat) {
  var point = {
    type: 'Point',
    coordinates: [lon, lat]
  };

  return precision(point, 4);
}

function getLineString (Shape, BoundingBox) {
  var coordinates = [],
      index = Shape.length,
      linestring,
      point,
      bbox;

  // reverse latitude & longitude to conform GeoJSON: y,x to x,y
  while (index--) {
    point = Shape[index].split(',');

    coordinates.push([parseFloat(point[1]), parseFloat(point[0])]);
  }

  bbox = [
    BoundingBox.TopLeft.Longitude,
    BoundingBox.BottomRight.Latitude,
    BoundingBox.BottomRight.Longitude,
    BoundingBox.TopLeft.Latitude
  ];

  linestring = {
    type: 'LineString',
    bbox: bbox,
    coordinates: coordinates
  };

  return precision(linestring, 4);
}

function destinationPosition (point, bearing, distance) {
  return geotools.destinationPoint(point, bearing, distance).coordinates;
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

  getPoint: function (lon, lat) {
    return getPoint(lon, lat);
  },

  getLineString: function (Shape, BoundingBox) {
    return getLineString(Shape, BoundingBox);
  },

  destinationPosition: function (point, bearing, distance) {
    return destinationPosition(point, bearing, distance);
  },

  numberToBearing: function (number) {
    return numberToBearing(number);
  },

  bearingTo: function (statPosition, endPosition, precision) {
    return bearingTo(statPosition, endPosition, precision);
  },

  rhumbBearingTo: function (statPosition, endPosition, precision) {
    return rhumbBearingTo(statPosition, endPosition, precision);
  },
};
