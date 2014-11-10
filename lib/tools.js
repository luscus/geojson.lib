var geotools     = require('geojson-utils'),
    util         = require('util'),
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

function bboxToResolution (bbox, pixels) {
  pixels = pixels || 900;

  var meters = geotools.pointDistance(
    getGeoJSONPoint(bbox[0], bbox[1]), // bottom right
    getGeoJSONPoint(bbox[2], bbox[3])  // top left
  );

  meters = Math.ceil(meters);

  return Math.round(meters / pixels);
}

function getBBoxCenter (bbox) {
  var lon = bbox[2] - bbox[0]/2,
      lat = bbox[3] - bbox[1]/2;

  return {
    type: 'Point',
    coordinates: [lon, lat]
  };
}

function extendBBoxWithPosition (bbox, Position) {

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

  var index = vertices.length,
      bbox = wgs84MaxBounds.slice().reverse(),
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
  return {
    type: 'Point',
    coordinates: [lon, lat]
  };
}

function getLineString (Shape, BoundingBox) {
  var coordinates = [],
      index = Shape.length,
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

  return {
    type: 'LineString',
    bbox: bbox,
    coordinates: coordinates
  };
}

function destinationPosition (point, bearing, distance) {
  return geotools.destinationPoint(point, bearing, distance).coordinates;
}

function numberToBearing (number) {
  return (geotools.numberToDegree(number) + 360) % 360;
}

module.exports = {
  wgs84MaxBounds: wgs84MaxBounds,

  validatePosition: function (Position) {
    return validatePosition(Position);
  },

  bboxToResolution: function (bbox, pixels) {
    return bboxToResolution(bbox, pixels);
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
    return getGeoJSONPoint(lon, lat);
  },

  getLineString: function (Shape, BoundingBox) {
    return getGeoJSONLineString(Shape, BoundingBox);
  },

  destinationPosition: function (point, bearing, distance) {
    return destinationPosition(point, bearing, distance);
  },

  numberToBearing: function (number) {
    return numberToBearing(number);
  }
};
