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
  _filter: "", // synonymous with query string
  _suggestions: [],

  getInitialState: function() {
    return {
      filtered_suggestions: []
    };
  },

  go_up_suggestion: function() {
    this._set_selection_rel(-1);
  },

  go_down_suggestion: function() {
    this._set_selection_rel(1);
  },

  set_filter: function(filter) {
    this._filter = filter;
    this._filter_suggestions();
  },

  set_suggestions: function(suggestions) {
    this._suggestions = suggestions;
    this._filter_suggestions();
  },

  _set_selection_rel: function(rel_index) {
    var $selectbox = this.refs.selectbox.getDOMNode(),
        options = $selectbox.getElementsByTagName("option").length,
        new_index = $selectbox.selectedIndex + rel_index;

    if (new_index > options - 1) {
      new_index = options - 1;
    }
    else if (new_index < -1) {
      new_index = -1;
    }

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

  get_suggested_text: function() {
    var select_id = this.refs.selectbox.getDOMNode().selectedIndex;
    if (select_id === -1) return "";
    if (select_id >= this.state.filtered_suggestions.length) return "";
    return this.state.filtered_suggestions[select_id].text;
  },

  _filter_suggestions: function() {
    var filtered_suggestions = this._suggestions.filter(function(suggestion) {
      return this.props.suggestion_filterer(suggestion, this._filter);
    }.bind(this));
    this.setState({filtered_suggestions: filtered_suggestions});
  },

  get_filtered_suggestions: function() {
    return this.state.filtered_suggestions.length;
  },

  fetch: function(escaped_q, cb) {
    this.props.suggestions_fetch(escaped_q, function(err, resp) {
      if (err) return cb(err);
      this.set_suggestions(resp);
      cb(null, resp);
    }.bind(this));
  },

  shouldComponentUpdate: function(next_props, next_state) {
    return this.state.filtered_suggestions !== next_state.filtered_suggestions;
  },

  set_suggestion: function(ev, index) {
    var $selectbox = this.refs.selectbox.getDOMNode();
    $selectbox.selectedIndex = index;
    this.props.set_suggestion(ev, this.get_suggested_text());
  },

  render: function() {
    var filtered_suggestions = this.state.filtered_suggestions,
        selected = filtered_suggestions.length === 1,
        SuggestionComponent = this.props.suggestion_component;

    var $suggestions = filtered_suggestions.map(function(suggestion, i) {
      return (
        <SuggestionComponent
            name="suggest"
            set_suggestion={this.set_suggestion}
            text={suggestion.text}
            score={suggestion.score}
            payload={suggestion.payload}
            selected={selected} />
      );
    }.bind(this));

    return (
      <select
          className={this._get_class_name($suggestions)}
          size={$suggestions.length > 10 ? 10 : $suggestions.length}
          tabIndex="-1"
          on_suggestion_change={this.props.set_suggestion}
          ref="selectbox">
          {$suggestions}
      </select>
    );
  }
});

return SuggestionList;

});
