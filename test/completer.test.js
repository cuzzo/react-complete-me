describe("Completer Integration Tests", function() {

  var React, TestUtils, Completer, Suggestion;
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
      React = _React;
      TestUtils = _React.addons.TestUtils;
      Completer = clone(_Completer);
      Suggestion = clone(_Suggestion);
      done();
    });
  });

  var connect = function(Sug, on_sub, on_suggest) {
    return TestUtils.renderIntoDocument(
        Completer({
          Suggestion: Sug,
          on_submit: on_sub,
          on_suggest: on_suggest
        })
      );
  };

  var unmount_component = function(component) {
    React.unmountComponentAtNode(component.getDOMNode().parent);
  };

  var THREE_RESP = [
        {text: "AB", score: 1, payload: {id: "x"}},
        {text: "AC", score: 2, payload: {id: "y"}},
        {text: "BC", score: 1, payload: {id: "z"}}
      ],
      ONE_RESP = [THREE_RESP[0]];

  var suggestion_get_ok = function(escaped_q, cb) {
    cb(null, THREE_RESP);
  };

  var suggestion_get_one_ok = function(escaped_q, cb) {
    cb(null, ONE_RESP);
  };

  var suggestion_get_fail = function(escaped_q, cb) {
    cb({error: 500});
  };

  describe("Control Key Integration Tests", function() {
    it("Should submit on keyDown enter with text", function() {
      Suggestion.GET = suggestion_get_ok;
      Suggestion.keep_cache = sinon.stub().returns(false);

      var on_submit = sinon.stub();
          completer = connect(Suggestion, on_submit),
          $textfield = completer.refs.searchbar.getDOMNode(),
          test_str = "ABC";

      // Set input value (so there's something to submit).
      $textfield.value = test_str;

      TestUtils.Simulate.keyDown($textfield, {keyCode: _KEY_ENTER});
      chai.assert.equal(on_submit.callCount, 1, "submit called once");
      chai.assert.isTrue(
          on_submit.calledWith(sinon.match.has("keyCode", _KEY_ENTER), test_str),
          "submit called with querystring"
        );

      unmount_component(completer);
    });

    it("Should not submit on keyDown enter without text", function() {
      var on_submit = sinon.stub();
          completer = connect(Suggestion, on_submit),
          $textfield = completer.refs.searchbar.getDOMNode();

      $textfield.value = "";

      TestUtils.Simulate.keyDown($textfield, {keyCode: _KEY_ENTER});
      chai.assert.equal(on_submit.callCount, 0, "submit not once");

      unmount_component(completer);
    });

    it("Should go down suggestion on keyDown down.", function() {
      Suggestion.GET = suggestion_get_ok;
      Suggestion.keep_cache = sinon.stub().returns(false);

      var on_submit = sinon.stub(),
          completer = connect(Suggestion, on_submit),
          textfield = completer.refs.searchbar,
          $textfield = textfield.getDOMNode(),
          test_str = "A",
          len = 1;

      completer.update_suggestions(test_str);

      TestUtils.Simulate.keyDown($textfield, {keyCode: _KEY_DOWN});
      chai.assert.equal(completer.refs.suggestion_list.get_suggested_text(), "AB");

      unmount_component(completer);
    });

    it("Should go up suggestion on keyDown up.", function() {
      Suggestion.GET = suggestion_get_ok;
      sinon.stub(Suggestion, "keep_cache").returns(false);

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

      TestUtils.Simulate.keyDown($textfield, {keyCode: _KEY_UP});
      chai.assert.equal(completer.refs.suggestion_list.get_suggested_text(), "AB");

      unmount_component(completer);
      Suggestion.keep_cache.restore();
    });

    it("Should set suggestion and submit upon click", function() {
      Suggestion.GET = suggestion_get_ok;
      sinon.stub(Suggestion, "keep_cache").returns(false);

      var on_submit = sinon.stub(),
          on_suggest = sinon.stub(),
          completer = connect(Suggestion, on_submit, on_suggest),
          textfield = completer.refs.searchbar,
          $textfield = textfield.getDOMNode(),
          suggestion_list = completer.refs.suggestion_list,
          selectbox = suggestion_list.refs.selectbox,
          $selectbox = selectbox.getDOMNode(),
          test_str = "A",
          len = 1;

      // Set the selection to the end of the string.
      completer.update_suggestions(test_str);

      var options = TestUtils.scryRenderedDOMComponentsWithTag(selectbox, "option");
      TestUtils.Simulate.click(options[0]);

      chai.assert.isTrue(
          on_suggest.calledWith(sinon.match.any, THREE_RESP[0].payload)
        );

      unmount_component(completer);
      Suggestion.keep_cache.restore();
    });
  });

  describe("update_suggestions Integration Tests.", function() {
    it("Should add to querystring on keyUp A.", function() {
      Suggestion.GET = suggestion_get_ok;
      sinon.stub(Suggestion, "keep_cache").returns(false);

      var on_submit = sinon.stub();
          completer = connect(Suggestion, on_submit),
          textfield = completer.refs.searchbar,
          $textfield = textfield.getDOMNode(),
          suggestion_list = completer.refs.suggestion_list,
          selectbox = suggestion_list.refs.selectbox,
          $selectbox = selectbox.getDOMNode(),
          test_str = "A",
          len = 0,
          _KEY_A = 65;

      // manually set textvalue. Simulated event won't do it.
      // Fortunately, testing the DOM isn't necessary [=
      $textfield.value = test_str;

      chai.assert.equal(textfield.get_escaped_q(), "");
      TestUtils.Simulate.keyUp($textfield, {which: _KEY_A});
      chai.assert.equal(textfield.get_escaped_q(), "A");

      unmount_component(completer);
      Suggestion.keep_cache.restore();
    });

    it("Should render no suggestions for no filtered suggestions.", function() {
      Suggestion.GET = suggestion_get_ok;
      sinon.stub(Suggestion, "keep_cache").returns(false);

      // Reject all suggestions.
      sinon.stub(Suggestion, "suggestion_filterer").returns(false);

      var on_submit = sinon.stub();
          completer = connect(Suggestion, on_submit),
          textfield = completer.refs.searchbar,
          $textfield = textfield.getDOMNode(),
          suggestion_list = completer.refs.suggestion_list,
          selectbox = suggestion_list.refs.selectbox,
          $selectbox = selectbox.getDOMNode(),
          _KEY_A = 65;

      $textfield.value = "A";
      TestUtils.Simulate.keyUp($textfield, {which: _KEY_A});

      var $options = TestUtils.scryRenderedDOMComponentsWithTag(selectbox, "option");
      chai.assert.equal($options.length, 0);

      var select = TestUtils.findRenderedDOMComponentWithTag(selectbox, "select"),
          $select = select.getDOMNode();

      chai.assert.isTrue($select.classList.contains("autosuggest-hidden"));
      chai.assert.isTrue($select.classList.contains("hidden"));
      chai.assert.isFalse($select.classList.contains("autosuggest-selected"));

      unmount_component(completer);
      Suggestion.keep_cache.restore();
      Suggestion.suggestion_filterer.restore();
    });

    it("Should render all suggestions if no filterer.", function() {
      Suggestion.GET = suggestion_get_ok;
      sinon.stub(Suggestion, "keep_cache").returns(false);

      // Reject no suggestions.
      sinon.stub(Suggestion, "suggestion_filterer").returns(true);

      var on_submit = sinon.stub();
          completer = connect(Suggestion, on_submit),
          textfield = completer.refs.searchbar,
          $textfield = textfield.getDOMNode(),
          suggestion_list = completer.refs.suggestion_list,
          selectbox = suggestion_list.refs.selectbox,
          $selectbox = selectbox.getDOMNode(),
          _KEY_A = 65;

      $textfield.value = "A";
      TestUtils.Simulate.keyUp($textfield, {which: _KEY_A});

      var $options = TestUtils.scryRenderedDOMComponentsWithTag(selectbox, "option");
      chai.assert.equal($options.length, 3);

      var select = TestUtils.findRenderedDOMComponentWithTag(selectbox, "select"),
          $select = select.getDOMNode();

      chai.assert.isFalse($select.classList.contains("autosuggest-hidden"));
      chai.assert.isFalse($select.classList.contains("hidden"));
      chai.assert.isFalse($select.classList.contains("autosuggest-selected"));
      chai.assert.equal($select.selectedIndex, -1);

      unmount_component(completer);
      Suggestion.keep_cache.restore();
      Suggestion.suggestion_filterer.restore();
    });

    it("Should render one suggestions for one filtered suggestion.", function() {
      Suggestion.GET = suggestion_get_one_ok;
      sinon.stub(Suggestion, "keep_cache").returns(false);

      // Reject no suggestions.
      sinon.stub(Suggestion, "suggestion_filterer").returns(true);

      var on_submit = sinon.stub();
          completer = connect(Suggestion, on_submit),
          textfield = completer.refs.searchbar,
          $textfield = textfield.getDOMNode(),
          suggestion_list = completer.refs.suggestion_list,
          selectbox = suggestion_list.refs.selectbox,
          $selectbox = selectbox.getDOMNode(),
          _KEY_A = 65;

      $textfield.value = "A";
      TestUtils.Simulate.keyUp($textfield, {which: _KEY_A});
      chai.assert.equal(Suggestion.keep_cache.callCount, 1);

      var $options = TestUtils.scryRenderedDOMComponentsWithTag(selectbox, "option");
      chai.assert.equal($options.length, 1);

      var select = TestUtils.findRenderedDOMComponentWithTag(selectbox, "select"),
          $select = select.getDOMNode();

      chai.assert.isFalse($select.classList.contains("autosuggest-hidden"));
      chai.assert.isFalse($select.classList.contains("hidden"));
      chai.assert.isTrue($select.classList.contains("autosuggest-selected"));
      chai.assert.equal($select.selectedIndex, 0);

      unmount_component(completer);
      Suggestion.keep_cache.restore();
      Suggestion.suggestion_filterer.restore();
    });

    it("Should render cache if exists, regardless of keep_cache.", function() {
      Suggestion.GET = suggestion_get_one_ok;
      sinon.stub(Suggestion, "keep_cache").returns(false);

      // Reject no suggestions.
      sinon.stub(Suggestion, "suggestion_filterer").returns(true);

      var on_submit = sinon.stub();
          completer = connect(Suggestion, on_submit),
          textfield = completer.refs.searchbar,
          $textfield = textfield.getDOMNode(),
          suggestion_list = completer.refs.suggestion_list,
          selectbox = suggestion_list.refs.selectbox,
          $selectbox = selectbox.getDOMNode(),
          _KEY_A = 65;

      // cache always responds with THREE_RESP.
      sinon.stub(completer._suggestion_cache, "lookup").returns(THREE_RESP);

      $textfield.value = "A";
      TestUtils.Simulate.keyUp($textfield, {which: _KEY_A});

      // Did not get to keep_cache.
      chai.assert.equal(Suggestion.keep_cache.callCount, 0, "keep_cache not called");

      var $options = TestUtils.scryRenderedDOMComponentsWithTag(selectbox, "option");
      chai.assert.equal($options.length, 3, "Has three options");

      unmount_component(completer);
      Suggestion.keep_cache.restore();
      Suggestion.suggestion_filterer.restore();
    });

    it("Should not request if no cache and keep_cache is true.", function() {
      Suggestion.GET = suggestion_get_ok;
      sinon.stub(Suggestion, "keep_cache").returns(true);

      // Reject no suggestions.
      sinon.stub(Suggestion, "suggestion_filterer").returns(true);

      var on_submit = sinon.stub();
          completer = connect(Suggestion, on_submit),
          textfield = completer.refs.searchbar,
          $textfield = textfield.getDOMNode(),
          suggestion_list = completer.refs.suggestion_list,
          selectbox = suggestion_list.refs.selectbox,
          $selectbox = selectbox.getDOMNode(),
          _KEY_A = 65;

      // cache always responds with nothing.
      sinon.stub(completer._suggestion_cache, "lookup").returns(undefined);

      $textfield.value = "A";
      TestUtils.Simulate.keyUp($textfield, {which: _KEY_A});

      // Did not get to keep_cache.
      chai.assert.equal(Suggestion.keep_cache.callCount, 1, "keep_cache called");

      var $options = TestUtils.scryRenderedDOMComponentsWithTag(selectbox, "option");
      chai.assert.equal($options.length, 0, "has no options");

      unmount_component(completer);
      Suggestion.keep_cache.restore();
      Suggestion.suggestion_filterer.restore();
    });
  });
});
