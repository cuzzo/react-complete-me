define([], function() {

/**
 * QueryString manipulator.
 */
var QueryString = function(update_callback, q) {
  var _q = q || "",
       _SPACE_REGEX = /\s+/g;
       _ESCAPED_SPACE_REGEX = /%20/g;

  /**
   * Remove a character from the querystring.
   *
   * @param int pos
   *   The 0-index position of the character to remove.
   */
  this.remove_character = function(pos) {
    if (pos > _q.length) return;
    var new_q = _q.substring(0, pos) + _q.substring(pos + 1);
    this.set(new_q);
  };

  /**
   * Inserts a character into the querystring.
   *
   * @param int pos
   *   The 0-index position at which to insert a character.
   * @param string char
   *   The character to insert.
   */
  this.insert_character = function(pos, char) {
    // Set pos to end if greater than length.
    pos = pos > _q.length ? _q.length : pos;
    var new_q = _q.substring(0, pos) + char + _q.substring(pos);
    this.set(new_q);
  };

  /**
   * Sets the querystring to a string.
   *
   * @param string q
   *   The string to set as the querystring.
   */
  this.set = function(q) {
    if (typeof q !== "string" || q === _q) return;
    _q = q;
    update_callback(q);
  };

  /**
   * Gets the querystring.
   *
   * @return string
   *   The querystring.
   */
  this.get = function() {
    return _q;
  };

  /**
   * Escapes the querystring (to send as a URL parameter).
   *
   * @return string
   *   The querystring, escaped--whitespace collapsed and replaced with "+".
   */
  this.escape = function() {
    return encodeURIComponent(_q.replace(_SPACE_REGEX, " "))
        .replace(_ESCAPED_SPACE_REGEX, "+");
  };
};

return QueryString;

});
