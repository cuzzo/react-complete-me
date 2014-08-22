describe("Completer Integration Tests", function() {

  var TestUtils, Completer, Suggestion;
  var _KEY_UP = 38,
      _KEY_DOWN = 40,
      _KEY_BACKSPACE = 8,
      _KEY_DELETE = 46,
      _KEY_ENTER = 13;


  beforeEach(function(done) {
    require([
      "react",
      "completer",
      "suggestion"
    ], function(_React, _Completer, _Suggestion) {
      TestUtils = _React.addons.TestUtils;
      Completer = clone(_Completer);
      Suggestion = clone(_Suggestion);
      done();
    });
  });

  var connect = function(Sug, on_sub) {
    return TestUtils.renderIntoDocument(
        Completer({Suggestion: Sug, on_submit: on_sub})
      );
  };

  var suggestion_get_ok = function(escaped_q, cb) {
    cb(null, [
        {text: "AB", score: 1, payload: {}},
        {text: "AC", score: 2, payload: {}}
      ]);
  };

  var suggestion_get_fail = function(escaped_q, cb) {
    cb({error: 500});
  };

  describe("update_suggestions Integration Tests", function() {
    it("Should submit on keyPress enter.", function() {
      var on_submit = sinon.stub();
          completer = connect(Suggestion, on_submit),
          $textfield = completer.refs.searchbar.getDOMNode();

      TestUtils.Simulate.keyPress($textfield, {keyCode: _KEY_ENTER});
      chai.assert.equal(on_submit.callCount, 1);
    });

    it("Should go down suggestion on keyPress down.", function() {
      Suggestion.GET = suggestion_get_ok;
      Suggestion.keep_cache = sinon.stub().returns(false);

      var on_submit = sinon.stub(),
          completer = connect(Suggestion, on_submit),
          textfield = completer.refs.searchbar,
          $textfield = textfield.getDOMNode(),
          test_str = "A",
          len = 1;

      completer.update_suggestions(test_str);

      TestUtils.Simulate.keyPress($textfield, {keyCode: _KEY_DOWN});
      chai.assert.equal(completer.refs.suggestion_list.get_suggested_text(), "AB");
    });

    it("Should go up suggestion on keyPres up.", function() {
      Suggestion.GET = suggestion_get_ok;
      Suggestion.keep_cache = sinon.stub().returns(false);

      var on_submit = sinon.stub(),
          completer = connect(Suggestion, on_submit),
          textfield = completer.refs.searchbar,
          $textfield = textfield.getDOMNode(),
          suggestion_list = completer.refs.suggestion_list,
          $selectbox = suggestion_list.refs.selectbox.getDOMNode(),
          test_str = "A",
          len = 1;

      // Set the selection to the end of the string.
      completer.update_suggestions(test_str);

      // Select the second item.
      $selectbox.selectedIndex = 1;

      TestUtils.Simulate.keyPress($textfield, {keyCode: _KEY_UP});
      chai.assert.equal(completer.refs.suggestion_list.get_suggested_text(), "AB");
    });

    it("Should add to querystring on keyUp A.", function() {
      var on_submit = sinon.stub();
          completer = connect(Suggestion, on_submit),
          textfield = completer.refs.searchbar,
          $textfield = textfield.getDOMNode(),
          suggestion_list = completer.refs.suggestion_list,
          $selectbox = suggestion_list.refs.selectbox.getDOMNode(),
          test_str = "A",
          len = 0,
          _KEY_A = 65;

      // manually set textvalue. Simulated event won't do it.
      // Fortunately, testing the DOM isn't necessary [=
      $textfield.value = test_str;

      chai.assert.equal(textfield.get_escaped_q(), "");
      TestUtils.Simulate.keyUp($textfield, {which: _KEY_A});
      chai.assert.equal(textfield.get_escaped_q(), "A");
    });
  });
});
