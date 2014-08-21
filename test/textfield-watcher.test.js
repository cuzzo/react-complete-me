describe("Textfield Watcher Unit Tests", function() {

  var $textfield, watcher;
  var $body = document.getElementsByTagName("body")[0];

  beforeEach(function(done) {
    $textfield = document.createElement("input");
    $body.appendChild($textfield);

    require([
      "textfield-watcher"
    ], function(_TextfieldWatcher) {
      watcher = new _TextfieldWatcher();
      done();
    });
  });

  afterEach(function() {
    $body.removeChild($textfield);
  });

  describe("get_cursor_position Tests", function() {
    it("Should be zero for empty string.", function() {
      $textfield.value = "";
      $textfield.focus();
      chai.assert.equal(watcher.get_cursor_position($textfield), 0);
    });

    it("Should be zero for string with cursor at beginning.", function() {
      $textfield.value = "ABCDEF";
      $textfield.focus();
      $textfield.setSelectionRange(0, 0);
      chai.assert.equal(watcher.get_cursor_position($textfield), 0);
    });

    it("Should be one for string with cursor at beginning.", function() {
      $textfield.value = "ABCDEF";
      $textfield.focus();
      $textfield.setSelectionRange(1, 1);
      chai.assert.equal(watcher.get_cursor_position($textfield), 1);
    });

    it("Should be one for string with cursor at beginning.", function() {
      $textfield.value = "ABCDEF";
      $textfield.focus();
      var len = $textfield.value.length;
      $textfield.setSelectionRange(len, len);
      chai.assert.equal(watcher.get_cursor_position($textfield), len);
    });
  });

  // Depends on working TextfieldWatcher::get_cursor_position.
  describe("set_cursor_position_end Tests", function() {
    it("Should be zero for cursor position of empty string.", function() {
      $textfield.value = "";
      watcher.set_cursor_position_end($textfield);
      chai.assert.equal(watcher.get_cursor_position($textfield), 0);
    });

    it("Should be len for cursor position of string.", function() {
      $textfield.value = "ABCDEF";
      $textfield.focus();
      var len = $textfield.value.length;
      watcher.set_cursor_position_end($textfield);
      chai.assert.equal(watcher.get_cursor_position($textfield), len);
    });
  });
});
