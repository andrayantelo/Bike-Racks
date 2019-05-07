// Qunit JS file
QUnit.begin(function( details ) {
  console.log( "Test amount:", details.totalTests );
  $('#qunit-fixture').append('<div id="mapid"></div>');
});

QUnit.module("helper functions tests");

QUnit.test("latitudinal value test", function(assert) {
    assert.expect(11);
    assert.ok(isLat(-90));
    assert.notOk(isLat(-180));
    assert.notOk(isLat(180));
    assert.ok(isLat(90));
    assert.ok(isLat(0));
    // test non numerical values
    assert.notOk(isLat('hello'));
    assert.ok(isLat('0'));
    assert.notOk(isLat(true));
    assert.notOk(isLat(NaN));
    assert.notOk(isLat(undefined));
    assert.notOk(isLat(null));
});

QUnit.test("longitudinal value test", function(assert) {
    assert.expect(11);
    assert.ok(isLong(180));
    assert.ok(isLong(-180));
    assert.ok(isLong(0));
    assert.notOk(isLong(190));
    assert.notOk(isLong(-190));
    // test non numerical values
    assert.notOk(isLong('hello'));
    assert.ok(isLong('0'));
    assert.notOk(isLong(true));
    assert.notOk(isLong(NaN));
    assert.notOk(isLong(undefined));
    assert.notOk(isLong(null));
});

QUnit.test("emtpyBikeRack test", function(assert) {
    assert.expect(0);
});
