define([], function() {

var Main = {};
var FAKE_DATA = [
  {text: "Peperoni", score: 1000, payload: {id: 1}},
  {text: "Cheese", score: 2000, payload: {id: 2}},
  {text: "Veggie", score: 3000, payload: {id: 3}},
  {text: "Popcorn", score: 500, payload: {id: 4}},
  {text: "Peppercorn", score: 200, payload: {id: 5}}
];

// This is the main function that starts the application.
// After configuartion is run in config.js, this is called.
Main.main = function() {
  require([
    "suggestion",
    "completer"
  ], function(Sug, Completer) {
    Sug.GET = function(q, cb) {
      cb(null, FAKE_DATA);
    };

    var $container = document.getElementById("react-complete-me");
    Completer.connect($container, Sug, function(ev, value) {
      console.log("SUBMIT FROM MAIN!", ev, value);
    });
  });
};

return Main;

});
