var should = require('chai').should(),
    geo = require('../lib/geojson.lib');


describe('Bearings:', function(){
	var origin    = [ 0.0,  0.0],
			north     = [ 0.0,  1.0],
			northEast = [ 0.1,  0.1],
			east      = [ 1.0,  0.0],
			southEast = [ 1.0, -1.0],
			south     = [ 0.0, -1.0],
			southWest = [-1.0, -1.0],
			west      = [-1.0,  0.0],
			northWest = [-1.0,  1.0];

  it('North = 0', function(){
    geo.tools.bearing(origin, north, 0).should.be.equal(0);
  });

  it('North-East = 45', function(){
    geo.tools.bearing(origin, northEast, 0).should.be.equal(45);
  });

  it('East = 90', function(){
    geo.tools.bearing(origin, east).should.be.equal(90);
  });

  it('South-East = 135', function(){
    geo.tools.bearing(origin, southEast, 0).should.be.equal(135);
  });

  it('South = 180', function(){
    geo.tools.bearing(origin, south, 0).should.be.equal(180);
  });

  it('South-West = 225', function(){
    geo.tools.bearing(origin, southWest, 0).should.be.equal(225);
  });

  it('West = 270', function(){
    geo.tools.bearing(origin, west, 0).should.be.equal(270);
  });

  it('North-West = 315', function(){
    geo.tools.bearing(origin, northWest, 0).should.be.equal(315);
  });
});
