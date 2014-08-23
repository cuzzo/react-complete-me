describe("Suggestion List Integration Tests", function() {
  var SuggestionList;

  beforeEach(function(done) {
    require([
      "react",
      "suggestion-list"
    ], function(_React, _SuggestionList) {
      React = _React;
      TestUtils = _React.addons.TestUtils;
      SuggestionList = clone(_SuggestionList);
      done();
    });
  });

  var connect = function(fetch) {
    console.log(SuggestionList);
    return TestUtils.renderIntoDocument(
        SuggestionList({
          suggestion_component: function(){},
          suggestion_filterer: function(){},
          suggestions_fetch: fetch,
          set_suggestion: function(){}
        })
      );
  };

  var unmount_component = function(component) {
    React.unmountComponentAtNode(component.getDOMNode().parent);
  };

  describe("Render Triggers", function() {
    it("should render upon set_filter", function() {
      var suggestion_list = connect(function(){});
      sinon.spy(suggestion_list, "render");
      suggestion_list.set_filter("X");
      chai.assert.equal(suggestion_list.render.callCount, 1);
    });

    it("should render upon set_suggestions", function() {
      var suggestion_list = connect(function(){});
      sinon.spy(suggestion_list, "render");
      suggestion_list.set_suggestions([]);
      chai.assert.equal(suggestion_list.render.callCount, 1);
    });

    it("should render twice upon set_filter + set_suggestions", function() {
      var suggestion_list = connect(function(){});
      sinon.spy(suggestion_list, "render");
      suggestion_list.set_filter("X");
      suggestion_list.set_suggestions([]);
      chai.assert.equal(suggestion_list.render.callCount, 2);
    });
  });
});
