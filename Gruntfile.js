var _ = require('underscore')._;
var RJSConfig = require('./src/config');

module.exports = function(grunt) {
  // Add require.js to the paths.
  RJSConfig.paths = _.extend(RJSConfig.paths, {
    'require-lib': '../node_modules/requirejs/require'
  });

  // Include EVERY path in the distributable.
  RJSConfig.include = [];
  _.each(RJSConfig.paths, function(path, key) {
    RJSConfig.include.push(key);
  });

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      options: {
        jshintrc: true,
      },
      all: {
        files: {
          src: [
            "Gruntfile.js",
            "app/**/*.js",
            "test/**/*.js"
          ]
        }
      }
    },

    requirejs: {
      compile: {
        options: _.extend(RJSConfig, {
          name: 'config',
          out: 'dist/react-complete-me.js',
          baseUrl: './src',
          generateSourceMaps: true,
          optimize: 'uglify2',
          optimizeAllPluginResources: true,
          preserveLicenseComments: false
        })
      }
    },

    mocha: {
      options: {
        reporter: 'Nyan', // Duh!
        run: true
      }
    },

    react: {
      dynamic_mappings: {
        files: [
          {
            expand: true,
            cwd: "src/app/jsx",
            src: ["**/*.jsx"],
            dest: "src/app/components",
            ext: ".js"
          }
        ]
      }
    },

    sass: {
      dist: {
        files: [{
          expand: true,
          cwd: "src/sass",
          src: "**/*.scss",
          dest: "src/css",
          ext: ".css"
        }]
      }
    },

    watch: {
      react: {
        files: ["src/app/jsx/**/*.jsx"],
        tasks: ["react"]
      },
      sass: {
        files: ["src/sass/**/*.scss"],
        tasks: ["sass"]
      }
    }
  });

  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-contrib-requirejs");
  grunt.loadNpmTasks("grunt-mocha");
  grunt.loadNpmTasks("grunt-react");
  grunt.loadNpmTasks("grunt-contrib-sass");
  grunt.loadNpmTasks("grunt-contrib-watch");

  grunt.registerTask("lint", ["jshint"]);
  grunt.registerTask("test", "Run Mocha tests.", function() {
    // If not --test option is specified, run all tests.
    var test_case = grunt.option("test") || "**/*";

    grunt.config.set("mocha.browser", ["test/" + test_case + ".html"]);
    grunt.task.run("mocha");
  });
  grunt.registerTask("dist", ["sass", "requirejs"]);
};
