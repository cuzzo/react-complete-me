define([], function() {

var Main = {};

// This is the main function that starts the application.
// After configuartion is run in config.js, this is called.
Main.main = function() {
  require([
    "suggestion",
    "completer"
  ], function(Sug, Completer) {
    var $container = document.getElementById("main-content");
    Completer.connect($container, Sug, function(ev, value) {
      console.log("SUBMIT FROM MAIN!", ev, value);
    });
  });
};

return Main;

});
