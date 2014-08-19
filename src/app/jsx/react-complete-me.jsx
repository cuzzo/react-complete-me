/** @jsx React.DOM */
define([
  "react",
  "suggestion-list"
], function(React, SuggestionList) {

var _SPACE_REGEX = /\s+/ig;

var ReactCompleteMe = {
  Components: {}
};

var Searchbar = React.createClass({
  getInitialState: function() {
    return {
      q: ""
    };
  },

  /** Abstract keyboard stuff into a plain JS class. */
  get_cursor_position: function($el) {
    if ($el.selectionStart) {
      return $el.selectionStart;
    }
    else if (document.selection) {
      $el.focus();

      var r = document.selection.createRange();
      if (r === null) {
        return 0;
      }

      var re = $el.createTextRange(),
          rc = re.duplicate();
      re.moveToBookmark(r.getBookmark());
      rc.setEndPoint("EndToStart", re);

      return rc.text.length;
    }
    return 0;
  },

  set_cursor_position_end: function($el) {
    $el.setSelectionRange($el.value.length, $el.value.length);
  },

  handle_keypress: function(ev) {
    var code = ev.keyCode;
    switch(code) {
      case 38: return this.go_up_suggestion(); // up pressed.
      case 40: return this.go_down_suggestion(); // down pressed.
      case 8: return this.backspace(); // backspace pressed.
      case 46: return this.delete(); // delete pressed.
      case 13: return this.submit(); // submit pressed.
    }
    if (ev.which === 0) return;
    var next_char = String.fromCharCode(ev.which),
        $searchbar = this.refs.searchbar.getDOMNode(),
        cursor_pos = this.get_cursor_position($searchbar);
    this.insert_character_into_q(cursor_pos, next_char);
  },

  go_up_suggestion: function() {
    var $searchbar = this.refs.searchbar.getDOMNode();
    this.refs.suggestion_list.go_up_suggestion();
    $searchbar.value = this.refs.suggestion_list.get_suggested_text();
    this.set_cursor_position_end($searchbar);
  },

  go_down_suggestion: function() {
    var $searchbar = this.refs.searchbar.getDOMNode();
    this.refs.suggestion_list.go_down_suggestion();
    $searchbar.value = this.refs.suggestion_list.get_suggested_text();
    this.set_cursor_position_end($searchbar)
  },

  backspace: function() {
    var $searchbar = this.refs.searchbar.getDOMNode(),
        cursor_pos = this.get_cursor_position($searchbar)
    this.remove_character_from_q(cursor_pos - 1);
  },

  submit: function() {
    console.log("SUBMIT");
  },

  delete: function() {
    var $searchbar = this.refs.searchbar.getDOMNode(),
        cursor_pos = this.get_cursor_position($searchbar);
    this.remove_character_from_q(cursor_pos);
  },

  remove_character_from_q: function(pos) {
    var q = this.state.q;
    if (pos > q.length) return;
    var new_q = q.substring(0, pos) + q.substring(pos + 1);
    this.set_q(new_q);
  },

  insert_character_into_q: function(pos, char) {
    var q = this.state.q;
    // Set pos to end if greater than length.
    pos = pos > q.length ? q.length : pos;
    var new_q = q.substring(0, pos) + char + q.substring(pos + 1);
    this.set_q(new_q);
  },

  set_q_to_current_input: function(ev) {
    // For special keys, do nothing.
    switch (ev.keyCode) {
      case 38: // up pressed.
      case 40: // down pressed.
      case 8: // backspace pressed.
      case 46: // delete pressed.
      case 13: // submit pressed.
        return;
    }
    var $searchbar = this.refs.searchbar.getDOMNode();
    this.set_q($searchbar.value);
  },

  set_q: function(q) {
    this.update_suggestions(q);
    this.setState({q: q});
  },
  /** END ABSTRACT */

  update_suggestions: function(q) {
    var escaped_q = q.replace(_SPACE_REGEX, "+");
    this.props.suggestion_fetcher(escaped_q, function(err, resp) {
      if (err) return console.error(err);
      this.refs.suggestion_list.set_suggestions(resp);
    }.bind(this));
    this.refs.suggestion_list.set_filter(q);
  },

  render: function() {
    return (
      <div className="autosuggest">
        <input
            type="textfield"
            name="q"
            className="autosuggest-searchbar"
            onKeyPress={this.handle_keypress}
            onKeyUp={this.set_q_to_current_input}
            autoComplete="off"
            ref="searchbar" />
        <SuggestionList.Components.SuggestionList
            suggestion_component={this.props.suggestion_component}
            suggestion_filterer={this.props.suggestion_filterer}
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
 * @param function fetcher
 *   A node-style function that queries ElasticSearch and returns the response.
 * @param ReactClass suggestion
 *   A suggestion component able to display ElasticSearch suggestion results.
 * @param Object cache
 *   The cache settings.
 *   TODO: List here.
 * @param function filterer
 *   A filter function to determine which suggestions to display (when cached).
 */
ReactCompleteMe.connect = function($el, fetcher, suggestion, cache, filterer) {
  React.renderComponent(
    <Searchbar
        suggestion_fetcher={fetcher}
        suggestion_component={suggestion}
        cache_options={cache}
        suggestion_filterer={filterer} />,
    $el
  );
};

return ReactCompleteMe;

});
