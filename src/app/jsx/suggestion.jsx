/** @jsx React.DOM */
define([
  "react",
  "superagent"
], function(React, request) {

var Suggestion = {
  Components: {}
};

var _ELASTICSEARCH_ENDPOINT = "/api/suggest";

Suggestion.cache_options = {
  // Hit ElasticSearch if < 4 suggestions remain.
  suggestions: 4,

  // Hit ElasticSearch if > 2 seconds (since last hit).
  miliseconds: 2000,

  // Hit ElasticSearch if keyups > 5 (since last hit).
  keyups: 5,

  // Hit ElasticSearch cache if new word.
  new_word: true
};

/**
 * Callback to filter ElasticSearch suggestions based on the querystring/filter.
 *
 * @param object suggestion
 *   An ElasticSearch autocomplete resp object.
 * @param string filter
 *   The current querystring/filter.
 *
 * @return bool
 *   Whether or not to display this suggestion.
 */
Suggestion.suggestion_filterer = function(suggestion, filter) {
  return suggestion.text.toLowerCase().indexOf(filter.toLowerCase()) !== -1;
};

Suggestion.is_new_word = function(q) {
  return (q.length > 2 &&
      q.indexOf(q.length - 2) === " " &&
      q.indexOf(q.length - 1) !== " ");
};

/**
 * Callback to determine whether to hit ElasticSearch or continue using
 * previous response.
 *
 * @param string q
 *   The current querystring/filter.
 * @param object cache_state
 *   @see cache_options.
 *
 * @return bool
 *   false -> Hit ElasticSearch.
 *   true -> Continue using previous response.
 */
Suggestion.keep_cache = function(q, cache_state) {
  if (cache_state.suggestions < Suggestion.cache_options.suggestions ||
      cache_state.miliseconds > Suggestion.cache_options.miliseconds ||
      cache_state.keyups > Suggestion.cache_options.keyups ||
      (Suggestion.cache_options.new_word && Suggestion.is_new_word(q))) {
    return false;
  }
  return true;
};

/**
 * Callback to hit ElasticSearch.
 *
 * @param string q
 *   The current querystring/filter.
 * @param function cb
 *   A node-style callback function (fed error, response).
 */
Suggestion.GET = function(q, cb) {
  request
    .get(_ELASTICSEARCH_ENDPOINT + "?q=" + q)
    .set("Accept", "application/json")
    .end(function(err, res) {
      if (err) return cb(err);
      return cb(null, JSON.parse(res.text));
    });
};


/**
 * The individual suggestions of the ReactCompleteMe auto-completer.
 *
 * props:
 *   name -> fieldname.
 *   text -> ElasticSearch autocomplete response text.
 *   score -> ElasticSearch autocomplete response score.
 *   payload -> ElasticSearch autocomplete response payload.
 */
Suggestion.Components.Suggestion = React.createClass({
  render: function() {
    return (
      <option name={this.props.name}>{this.props.text}</option>
    );
  }
});

return Suggestion;

});
