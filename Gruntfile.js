'use strict';

var packageJson = require("./package.json");
var path = require("path");
var swPrecache = require("./node_modules/sw-precache/lib/sw-precache.js");

module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-bump');

    // Project configuration.
    grunt.initConfig({
        bump: {
            options: {
                files: ['src/app/config.ts'],
                updateConfigs: [],
                commit: true,  // true
                commitMessage: 'Release v%VERSION%',
                commitFiles: ['src/app/config.ts'],
                createTag: true,  // true
                tagName: 'v%VERSION%',
                tagMessage: 'Version %VERSION%',
                push: true,  // true
                pushTo: 'origin',
                gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d',
                globalReplace: false,
                prereleaseName: false,
                metadata: '',
                regExp: false
            }
        },
        swPrecache: {
          dev: {
            handleFetch: false,
            rootDir: "app"
          },
          release: {
            handleFetch: true,
            rootDir: "platforms/browser/www"
          }
        }
    });

  function writeServiceWorkerFile(rootDir, handleFetch, callback) {
    var config = {
      cacheId: packageJson.name,
      /*dynamicUrlToDependencies: {
        'dynamic/page1': [
          path.join(rootDir, 'views', 'layout.jade'),
          path.join(rootDir, 'views', 'page1.jade')
        ],
        'dynamic/page2': [
          path.join(rootDir, 'views', 'layout.jade'),
          path.join(rootDir, 'views', 'page2.jade')
        ]
      },*/
      // If handleFetch is false (i.e. because this is called from swPrecache:dev), then
      // the service worker will precache resources but won't actually serve them.
      // This allows you to test precaching behavior without worry about the cache preventing your
      // local changes from being picked up during the development cycle.
      handleFetch: handleFetch,
      logger: grunt.log.writeln,
      staticFileGlobs: [
        rootDir + '/build/*',
        rootDir + '/assets/**/*',
        rootDir + '/lib/*',
        rootDir + '/index.html',
        rootDir + '/manifest.json',
        rootDir + '/cordova*',
        rootDir + '/plugins/**/*',
        rootDir + '/js/**.js'
      ],
      stripPrefix: rootDir + '/',
      // verbose defaults to false, but for the purposes of this demo, log more.
      verbose: true
    };

    swPrecache.write(path.join(rootDir, 'service-worker.js'), config, callback);
  }

  grunt.registerMultiTask('swPrecache', function() {
    var done = this.async();
    var rootDir = this.data.rootDir;
    var handleFetch = this.data.handleFetch;

    writeServiceWorkerFile(rootDir, handleFetch, function(error) {
      if (error) {
        grunt.fail.warn(error);
      }
      done();
    });
  });
};
