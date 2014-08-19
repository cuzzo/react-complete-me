/** @jsx React.DOM */
define([
  "react",
  "suggestion-list"
], function(React, SuggestionList) {

var _KEY_UP = 38,
    _KEY_DOWN = 40,
    _KEY_BACKSPACE = 8,
    _KEY_DELETE = 46,
    _KEY_ENTER = 13;

var ReactCompleteMe = {
  Components: {}
};

/**
 * Caches suggestions.
 * TODO: threshold LRU.
 */
var SuggestionCache = function() {
  var _cache = {};
  var _last_cache = new Date();

  var _normalize_q = function(q) {
    return q.toLowerCase();
  }

  this.lookup = function(q) {
    return _cache[_normalize_q(q)];
  };

  this.add = function(q, resp) {
    _cache[_normalize_q(q)] = resp;
    _last_cache = new Date();
  };

  this.last_cache = function() {
    return _last_cache;
  };
};

/**
 * "Watches" a textfield for keyboard input, pipes events userfriend-ily.
 *
 * @param object options
 *  handle_up -> up key press event.
 *  handle_down -> down key press event.
 *  handle_backspace -> backspace key press event.
 *  handle_delete -> delete key press event.
 *  handle_enter -> enter key press event.
 *  handle_text -> handle keys that can be interpreted as text.
 *  handle_keyup -> handle keyup event (only fired for text).
 */
var TextfieldWatcher = function(options) {
  options = typeof options === "object" ? options : {};

  this.handle_keypress = function(ev) {
    var code = ev.keyCode;
    switch(code) {
      case _KEY_UP: return options.handle_up();
      case _KEY_DOWN: return options.handle_down(ev);
      case _KEY_BACKSPACE: return options.handle_backspace(ev);
      case _KEY_DELETE: return options.handle_delete(ev);
      case _KEY_ENTER: return options.handle_enter(ev);
    }
    if (ev.which === 0) return;
    options.handle_text(ev);
  };

  this.handle_keyup = function(ev) {
    // For special keys, do nothing.
    switch (ev.keyCode) {
      case _KEY_UP:
      case _KEY_DOWN:
      case _KEY_BACKSPACE:
      case _KEY_DELETE:
      case _KEY_ENTER:
        return;
    }
    options.handle_keyup(ev);
  };

  this.get_cursor_position = function($el) {
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
  };

  this.set_cursor_position_end = function($el) {
    $el.setSelectionRange($el.value.length, $el.value.length);
  };
};

/**
 * QueryString manipulator.
 */
var QueryString = function(update_callback, q) {
  var _q = q || "",
       _SPACE_REGEX = /\s+/g;

  this.remove_character = function(pos) {
    if (pos > _q.length) return;
    var new_q = _q.substring(0, pos) + _q.substring(pos + 1);
    this.set(new_q);
  },

  this.insert_character = function(pos, char) {
    // Set pos to end if greater than length.
    pos = pos > _q.length ? _q.length : pos;
    var new_q = _q.substring(0, pos) + char + _q.substring(pos + 1);
    this.set(new_q);
  },

  this.set = function(q) {
    if (q === _q) return false;
    _q = q;
    update_callback(q);
  },

  this.escape = function() {
    return encodeURIComponent(_q.replace(_SPACE_REGEX, " "))
        .replace(/%20/g, "+");
  }
};

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

/**
 * The controller object for ReactCompleteMe auto-completion.
 */
var Completer = React.createClass({
  _suggestion_cache: new SuggestionCache(),
  _keyups_since_cache: 0,

  cache: function(q, suggestions) {
    this._suggestion_cache.add(q, suggestions);
    this._keyups_since_cache = 0;
  },

  get_cache_state: function() {
    var count = this.refs.suggestion_list.get_filtered_suggestions().length;
    return {
      miliseconds_elapsed: new Date() - this._suggestion_cache.last_cache(),
      keyups_since_cache: this._keyups_since_cache,
      suggestions: count,
    };
  },

  update_suggestions: function(q) {
    this.refs.suggestion_list.set_filter(q);
    if (this.props.Suggestion.keep_cache(q, this.get_cache_state())) return;
    this.request_suggestions(q);
  },

  request_suggestions: function(q) {
    var cached_resp = this._suggestion_cache.lookup(q);
    if (cached_resp !== undefined) {
      this.refs.suggestion_list.set_suggestions(cached_resp);
      return;
    }

    var escaped_q = this.refs.searchbar.get_escaped_q();
    this.props.Suggestion.GET(escaped_q, function(err, resp) {
      if (err) return console.error(err);
      this.refs.suggestion_list.set_suggestions(resp);
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

  render: function() {
    return (
      <div className="autosuggest">
        <Searchbar
            update_callback={this.update_suggestions}
            go_up_suggestion={this.go_up_sugestion}
            go_down_suggestion={this.go_down_suggestion}
            ref="searchbar" />
        <SuggestionList.Components.SuggestionList
            suggestion_component={this.props.Suggestion.Components.Suggestion}
            suggestion_filterer={this.props.Suggestion.suggestion_filterer}
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
 */
ReactCompleteMe.connect = function($el, Suggestion, on_submit) {
  React.renderComponent(
    <Completer Suggestion={Suggestion} on_submit={on_submit} />,
    $el
  );
};

return ReactCompleteMe;

});
