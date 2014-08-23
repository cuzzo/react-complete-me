describe("Suggestion Cache Unit Tests", function() {

  var SuggestionCache;

  beforeEach(function(done) {
    require([
      "suggestion-cache"
    ], function(_SuggestionCache) {
      SuggestionCache = clone(_SuggestionCache);
      done();
    });
  });

  describe("lookup/add Tests", function() {
    var cache;

    beforeEach(function() {
      cache = new SuggestionCache();
    });

    it("should not be able to lookup on empty cache", function() {
      chai.assert.isUndefined(cache.lookup("A"));
    });

    it("should be able to lookup exact added key", function() {
      var cached_object = {a: 1, b: 2, c: 3},
          key = "TEST";
      cache.add(key, cached_object);
      chai.assert.equal(cache.lookup(key), cached_object);
    });

    it("should be able to lookup case-insensitive key", function() {
      var cached_object = {a: 1, b: 2, c: 3},
          key = "TEST";
      cache.add(key.toUpperCase(), cached_object);
      chai.assert.equal(cache.lookup(key.toLowerCase()), cached_object);
    });

    it("should not be able to lookup non-matching key", function() {
      var cached_object = {a: 1, b: 2, c: 3},
          key = "TEST";
      cache.add(key, cached_object);
      chai.assert.isUndefined(cache.lookup(key + "A"));
    });
  });

  describe("last_cache Tests", function() {
    var cache, clock;
    beforeEach(function() {
      clock = sinon.useFakeTimers(0,
          "setTimeout",
          "clearTimeout",
          "setInterval",
          "clearInterval",
          "Date"
        );

      cache = new SuggestionCache();
    });

    afterEach(function() {
      clock.restore();
    });

    it("shoud be instantiation time for empty cache", function() {
      chai.assert.equal(cache.last_cache().getTime(), new Date().getTime());
    });

    it("should be insertion time for non-empty cache", function() {
      clock.tick(10);
      cache.add("K", {});
      chai.assert.equal(cache.last_cache().getTime(), new Date().getTime());
    });
  });
});
