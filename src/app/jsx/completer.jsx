/** @jsx React.DOM */
define([
  "react",
  "searchbar",
  "suggestion-list",
  "suggestion-cache"
], function(React, Searchbar, SuggestionList, SuggestionCache) {

/**
 * The controller object for ReactCompleteMe auto-completion.
 */
var Completer = React.createClass({
  _suggestion_cache: null,
  _keyups_since_cache: 0,

  getInitialState: function() {
    this._suggestion_cache = new SuggestionCache();
    return {};
  },

  cache: function(q, suggestions) {
    this._suggestion_cache.add(q, suggestions);
    this._keyups_since_cache = 0;
  },

  get_cache_state: function() {
    var count = this.refs.suggestion_list.get_filtered_suggestions();
    return {
      miliseconds_elapsed: new Date() - this._suggestion_cache.last_cache(),
      keyups_since_cache: this._keyups_since_cache,
      suggestions: count,
    };
  },

  update_suggestions: function(q) {
    this.refs.suggestion_list.set_filter(q);

    var cached_resp = this._suggestion_cache.lookup(q);
    if (cached_resp !== undefined) {
      this.refs.suggestion_list.set_suggestions(cached_resp);
      return;
    }

    if (this.props.Suggestion.keep_cache(q, this.get_cache_state())) return;
    this.request_suggestions(q);
  },

  request_suggestions: function(q) {
    var escaped_q = this.refs.searchbar.get_escaped_q();
    this.refs.suggestion_list.fetch(escaped_q, function(err, resp) {
      if (err) return console.error(err);
      this.cache(q, resp);
    }.bind(this));
  },

  go_up_sugestion: function() {
    var $suggestion_list = this.refs.suggestion_list;
    $suggestion_list.go_up_suggestion();
    return $suggestion_list.get_suggested_text();
  },

  go_down_suggestion: function() {
    var $suggestion_list = this.refs.suggestion_list;
    $suggestion_list.go_down_suggestion();
    return $suggestion_list.get_suggested_text();
  },

  set_suggestion: function(ev, payload) {
    ev.preventDefault();
    this.props.on_suggest(ev, payload);
  },

  /**
   * Determines whether or not to route the user directly to a suggestion.
   *
   * @param object ev
   *   A DOM event.
   *
   * @return bool
   *   Whether or not a suggestion was made.
   */
  do_autosuggest: function(ev) {
    var $suggestion_list = this.refs.suggestion_list,
        $searchbar = this.refs.searchbar;
    if (!$suggestion_list.should_suggest($searchbar.get_q())) return false;
    this.set_suggestion(ev, $suggestion_list.get_suggested_payload());
    this.clear();
    return true;
  },

  clear: function() {
    this.refs.searchbar.clear();
    this.refs.suggestion_list.clear();
  },

  render: function() {
    return (
      <div className="autosuggest">
        <Searchbar
            update_callback={this.update_suggestions}
            go_up_suggestion={this.go_up_sugestion}
            go_down_suggestion={this.go_down_suggestion}
            on_submit={this.props.on_submit}
            do_autosuggest={this.do_autosuggest}
            clear={this.clear}
            ref="searchbar" />
        <SuggestionList
            suggestion_component={this.props.Suggestion.Components.Suggestion}
            suggestion_filterer={this.props.Suggestion.suggestion_filterer}
            suggestions_fetch={this.props.Suggestion.GET}
            do_autosuggest={this.do_autosuggest}
            ref="suggestion_list" />
      </div>
    );
  }
});

/**
 * Creates an autocompleter and connects it to the DOM.
 *
 * @param Element $el
 *   A DOM element.
 * @param object Suggestion
 *   An object implementing the Suggestion interface.
 * @param function on_submit
 *   A submit callback.
 * @param function on_suggest
 *   Callback to trigger when suggestion is clicked or chosen.
 */
Completer.connect = function($el, Suggestion, on_submit, on_suggest) {
  React.renderComponent(
    <Completer
        Suggestion={Suggestion}
        on_submit={on_submit}
        on_suggest={on_suggest} />,
    $el
  );
};

return Completer;

});
