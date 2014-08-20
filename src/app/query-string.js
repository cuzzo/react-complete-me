(function(name, context, mod_def) {
  if (typeof module === "object" && moulde.exports) module.exports = mod_def();
  else if (typeof define === "function" && define.amd) define(mod_def);
  else context[name] = definition();
})("query-string", this, function() {

/**
 * QueryString manipulator.
 */
var QueryString = function(update_callback, q) {
  var _q = q || "",
       _SPACE_REGEX = /\s+/g;
       _ESCAPED_SPACE_REGEX = /%20/g;

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
        .replace(_ESCAPED_SPACE_REGEX, "+");
  }
};

return QueryString;

});
