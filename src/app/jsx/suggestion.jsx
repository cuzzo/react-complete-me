/** @jsx React.DOM */
define([
  "react",
  "superagent"
], function(React, request) {

var Suggestion = {
  Components: {}
};

Suggestion.suggestion_filterer = function(suggestion, filter) {
  var text = suggestion.text,
      parts = text.split(" - ");
  /**
   * TODO: use StoryTitle on second part.
   * TODO: use AuthorName on first part.
   */
  if (parts.length > 2) {
    parts = [parts[0], parts.slice(1).join(" ")];
  }
  for (var i in parts) {
    if (parts[i].substring(0, filter.length) === filter) return true;
  }
  return false;
};

Suggestion.suggestion_fetcher = function(q, cb) {
  request
    .get("/api/suggest?q=" + q)
    .set("Accept", "application/json")
    .end(function(err, res) {
      if (err) return cb(err);
      return cb(null, JSON.parse(res.text));
    });
};

Suggestion.Components.Suggestion = React.createClass({
  render: function() {
    return (
      <option name={this.props.name}>{this.props.text}</option>
    );
  }
});

return Suggestion;

});
