var should = require('chai').should(),
    geo = require('../lib/geojson.lib');

describe('GeoJSON:', function() {

  it('Point', function () {
    geo.tools.getPoint.should.be.a('function');
  });

  it('LineString', function () {
    geo.tools.getLineString.should.be.a('function');
  });

  it('Polygon', function () {
    geo.tools.getPolygon.should.be.a('function');
  });

});
