define([], function() {

/**
 * QueryString manipulator.
 */
var QueryString = function(update_callback, q) {
  var _q = q || "",
       _SPACE_REGEX = /\s+/g;
       _ESCAPED_SPACE_REGEX = /%20/g;

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
    return encodeURIComponent(_q.trim().replace(_SPACE_REGEX, " "))
        .replace(_ESCAPED_SPACE_REGEX, "+");
  };
};

return QueryString;

});
