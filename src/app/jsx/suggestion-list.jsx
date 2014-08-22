/** @jsx React.DOM */
define([
  "react"
], function(React) {

var SuggestionList = {
  Components: {}
};

/**
 * The dropdown list of suggestions of the ReactCompleteMe auto-completer.
 */
SuggestionList.Components.SuggestionList = React.createClass({
  getInitialState: function() {
    return {
      suggestions: [],
      filter: "" // synonymous with query string.
    };
  },

  go_up_suggestion: function() {
    this._set_selection_rel(-1);
  },

  go_down_suggestion: function() {
    this._set_selection_rel(1);
  },

  set_filter: function(filter) {
    this.setState({filter: filter});
  },

  set_suggestions: function(suggestions) {
    this.setState({suggestions: suggestions});
  },

  _set_selection_rel: function(rel_index) {
    var $selectbox = this.refs.selectbox.getDOMNode(),
        options = $selectbox.getElementsByTagName("option").length,
        new_index = $selectbox.selectedIndex + rel_index;

    if (new_index > options - 1) {
      new_index = options - 1;
    }
    else if (new_index < 0) {
      new_index = 0;
    }

    // Use state?
    $selectbox.selectedIndex = new_index;
  },

  _get_class_name: function(suggestions) {
    var class_name = "autosuggest-suggestions";
    if (suggestions.length === 0) {
      class_name += " autosuggest-hidden hidden";
    }
    if (suggestions.length === 1) {
      class_name += " autosuggest-selected";
    }
    return class_name;
  },

  get_selected_option: function() {
    var $selectbox = this.refs.selectbox.getDOMNode();
    return $selectbox.getElementsByTagName("option")[$selectbox.selectedIndex];
  },

  get_suggested_text: function() {
    var $option = this.get_selected_option();
    return typeof $option === "undefined" ? "" : $option.value;
  },

  /**
   * TODO: cache this so that suggestions are not filtered twice per render.
   * Once to check for cache, and once in render...
   * Suggestions should only change when set_filter() is called.
   * Set something there, check here.
   */
  get_filtered_suggestions: function() {
    return this.state.suggestions.filter(function(suggestion) {
      return this.props.suggestion_filterer(suggestion, this.state.filter);
    }.bind(this));
  },

  fetch: function(escaped_q, cb) {
    this.props.suggestions_fetch(escaped_q, function(err, resp) {
      if (err) return cb(err);
      this.set_suggestions(resp);
      cb(null, resp);
    }.bind(this));
  },

  render: function() {
    var filtered_suggestions = this.get_filtered_suggestions(),
        selected = filtered_suggestions.length === 1,
        SuggestionComponent = this.props.suggestion_component;

    var $suggestions = filtered_suggestions.map(function(suggestion) {
      return (
        <SuggestionComponent
            name="suggest"
            text={suggestion.text}
            score={suggestion.score}
            payload={suggestion.payload}
            selected={selected} />
      );
    });

    return (
      <select
          className={this._get_class_name($suggestions)}
          size={$suggestions.length > 10 ? 10 : $suggestions.length}
          tabIndex="-1"
          ref="selectbox">
          {$suggestions}
      </select>
    );
  }
});

return SuggestionList;

});
