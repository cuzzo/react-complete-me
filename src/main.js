define([], function() {

var Main = {};

// This is the main function that starts the application.
// After configuartion is run in config.js, this is called.
Main.main = function() {
  require([
    "suggestion",
    "react-complete-me"
  ], function(Sug, ReactCompleteMe) {
    ReactCompleteMe.connect(document.getElementById("main-content"),
        Sug.suggestion_fetcher,
        Sug.Components.Suggestion,
        {},
        Sug.suggestion_filterer);
  });
};

return Main;

});
