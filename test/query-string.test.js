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


  // Test that set triggers callback when changed, doesn't when the same.
  // Test that escape works.

  describe("Insert Tests", function() {
    var cb_stub;

    beforeEach(function() {
      cb_stub = sinon.stub();
    });

    it("Should insert into empty query string at 0.", function() {
      var q = new QueryString(cb_stub, "");
      q.insert_character(0, "a");
      chai.assert.equal(q.get(), "a");
    });

    it("Should insert into beginning of string.", function() {
      var q = new QueryString(cb_stub, "My Test String");
      q.insert_character(0, "a");
      chai.assert.equal(q.get(), "aMy Test String");
    });

    it("Should insert into middle of string.", function() {
      var q = new QueryString(cb_stub, "My Test String");
      q.insert_character(1, "a");
      chai.assert.equal(q.get(), "May Test String");
    });

    it("Should insert into end of string.", function() {
      var test_string = "My Test String";
          q = new QueryString(cb_stub, test_string);
      q.insert_character(test_string.length, "a");
      chai.assert.equal(q.get(), "My Test Stringa");
    });

    it("Should call set upon insertion.", function() {
      var q = new QueryString(cb_stub, "");
      sinon.stub(q, "set", function(){});
      q.insert_character(0, "");
      chai.assert.equal(q.set.callCount, 1);
    });
  });

  describe("Remove Tests", function() {
    var cb_stub;

    beforeEach(function() {
      cb_stub = sinon.stub();
    });

    it("Should remove from empty query string at 0.", function() {
      var q = new QueryString(cb_stub, "");
      q.remove_character(0);
      chai.assert.equal(q.get(), "");
    });

    it("Should remove from beginning of string.", function() {
      var q = new QueryString(cb_stub, "My Test String");
      q.remove_character(0);
      chai.assert.equal(q.get(), "y Test String");
    });

    it("Should remove from middle of string.", function() {
      var q = new QueryString(cb_stub, "My Test String");
      q.remove_character(1);
      chai.assert.equal(q.get(), "M Test String");
    });

    it("Should remove from end of string.", function() {
      var test_string = "My Test String";
          q = new QueryString(cb_stub, test_string);
      q.remove_character(test_string.length - 1);
      chai.assert.equal(q.get(), "My Test Strin");
    });

    it("Should call set upon removal.", function() {
      var q = new QueryString(cb_stub, "");
      sinon.stub(q, "set", function(){});
      q.remove_character(0, "");
      chai.assert.equal(q.set.callCount, 1);
    });
  });
});
