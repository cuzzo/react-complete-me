define([], function() {

var _KEY_UP = 38,
    _KEY_DOWN = 40,
    _KEY_BACKSPACE = 8,
    _KEY_DELETE = 46,
    _KEY_ENTER = 13;

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


return TextfieldWatcher;

});
