/** @jsx React.DOM */
define([
  "query-string",
  "textfield-watcher"
], function(QueryString, TextfieldWatcher) {

/**
 * The Searchbar of the ReactCompleteMe auto-completer.
 */
var Searchbar = React.createClass({
  _q: null,
  _textfield_watcher: null,

  getInitialState: function() {
    this._q = new QueryString(this.props.update_callback);

    this._textfield_watcher = new TextfieldWatcher({
      handle_up: this.go_up_suggestion,
      handle_down: this.go_down_suggestion,
      handle_backspace: this.backspace,
      handle_delete: this.delete,
      handle_enter: this.submit,
      handle_text: this.handle_keypress,
      handle_keyup: this.handle_keyup
    });

    return null;
  },

  handle_keypress: function(ev) {
    var next_char = String.fromCharCode(ev.which),
        $searchbar = this.refs.searchbar.getDOMNode(),
        cursor_pos = this._textfield_watcher.get_cursor_position($searchbar);
    this._q.insert_character(cursor_pos, next_char);
  },

  handle_keyup: function(ev) {
    this._keyups_since_cache += 1;
    this.set_q_to_current_input();
  },

  go_up_suggestion: function() {
    var $searchbar = this.refs.searchbar.getDOMNode();
    $searchbar.value = this.props.go_up_suggestion();
    this._textfield_watcher.set_cursor_position_end($searchbar);
  },

  go_down_suggestion: function() {
    var $searchbar = this.refs.searchbar.getDOMNode();
    $searchbar.value = this.props.go_down_suggestion();
    this._textfield_watcher.set_cursor_position_end($searchbar)
  },

  backspace: function() {
    var $searchbar = this.refs.searchbar.getDOMNode(),
        cursor_pos = this._textfield_watcher.get_cursor_position($searchbar)
    this._q.remove_character(cursor_pos - 1);
  },

  submit: function(ev) {
    var $searchbar = this.refs.searchbar.getDOMNode();
    this.props.on_submit(ev, $searchbar.value);
  },

  delete: function() {
    var $searchbar = this.refs.searchbar.getDOMNode(),
        cursor_pos = this.get_cursor_position($searchbar);
    this._q.remove_character(cursor_pos);
  },

  set_q_to_current_input: function() {
    var $searchbar = this.refs.searchbar.getDOMNode();
    this._q.set($searchbar.value);
  },

  get_escaped_q: function() {
    return this._q.escape();
  },

  render: function() {
    return (
      <input
            type="textfield"
            name="q"
            className="autosuggest-searchbar"
            onKeyPress={this._textfield_watcher.handle_keypress}
            onKeyUp={this._textfield_watcher.handle_keyup}
            autoComplete="off"
            ref="searchbar" />
    );
  }
});

return Searchbar;

});
