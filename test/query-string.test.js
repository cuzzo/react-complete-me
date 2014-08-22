describe("QueryString Unit Tests", function() {
  var QueryString;

  beforeEach(function(done) {
    require([
      "query-string"
    ], function(_QueryString) {
      QueryString = clone(_QueryString);
      done();
    });
  });

  describe("Set Tests", function() {
    var cb_stub;

    beforeEach(function() {
      cb_stub = sinon.stub();
    });

    it("Should trigger for new string.", function() {
      var q = new QueryString(cb_stub, "");
      q.set("TEST");
      chai.assert.equal(cb_stub.callCount, 1);
    });

    it("Should not trigger for current string.", function() {
      var q = new QueryString(cb_stub, "TEST");
      q.set("TEST");
      chai.assert.equal(cb_stub.callCount, 0);
    });

    it("Should trigger for reset.", function() {
      var q = new QueryString(cb_stub, "TEST");
      q.set("");
      chai.assert.equal(cb_stub.callCount, 1);
    });
  });

  describe("Escape Tests", function() {
    var cb_stub;

    beforeEach(function() {
      cb_stub = sinon.stub();
    });

    it("Should be same for empty query string.", function() {
      var q = new QueryString(cb_stub, "");
      chai.assert.equal(q.escape(), "");
    });

    it("Should be same for query string without whitespace.", function() {
      var q = new QueryString(cb_stub, "TEST");
      chai.assert.equal(q.escape(), "TEST");
    });

    it("Should escape single whitespace with '+'.", function() {
      var q = new QueryString(cb_stub, "My Test");
      chai.assert.equal(q.escape(), "My+Test");
    });

    it("Should escape multiple single whitespaces with '+'.", function() {
      var q = new QueryString(cb_stub, "My Test String");
      chai.assert.equal(q.escape(), "My+Test+String");
    });

    it("Should escape repeating whitespace with single '+'.", function() {
      var q = new QueryString(cb_stub, "My    Test");
      chai.assert.equal(q.escape(), "My+Test");
    });

    it("Should trim beginning whitespace.", function() {
      var q = new QueryString(cb_stub, " X");
      chai.assert.equal(q.escape(), "X");
    });

    it("Should trim ending whitespace.", function() {
      var q = new QueryString(cb_stub, "X ");
      chai.assert.equal(q.escape(), "X");
    });

    it("Should trim beginning and ending whitespace.", function() {
      var q = new QueryString(cb_stub, " X ");
      chai.assert.equal(q.escape(), "X");
    });

    it("Should trim multiple whitespaces.", function() {
      var q = new QueryString(cb_stub, "  X");
      chai.assert.equal(q.escape(), "X");
    });
  });
});
