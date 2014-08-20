(function() {

var LIB_BASE = "../bower_components/";

var Config = {
  "paths": {
    "main": "main",

    // lib
    "react": LIB_BASE + "react/react-with-addons",
    "superagent": LIB_BASE + "superagent/superagent",

    // src
    "query-string": "app/query-string",
    "textfield-watcher": "app/textfield-watcher",

    "suggestion": "app/components/suggestion",
    "searchbar": "app/components/searchbar",
    "suggestion-list": "app/components/suggestion-list",
    "completer": "app/components/completer"
  }
};

// If _TEST_MODE, configure to "../" since our tests are stored in "./test".
if (typeof _TEST_MODE !== "undefined" && _TEST_MODE === true) {
  Config.baseUrl = "../src";
  require.config(Config);
  return true;
}

// If "define" exists as a function, run main.
if (typeof define === "function") {
  require.config(Config);
  require(["main"], function(Main) {
    Main.main();
  });
  return true;
}

// If module exists as an object, Common.JS
if (typeof module === "object") {
  module.exports = Config;
}

// If exports exists an object, use Common.JS
if (typeof exports === "object") {
  exports.RJSConfig = Config;
}

return Config;

})();
