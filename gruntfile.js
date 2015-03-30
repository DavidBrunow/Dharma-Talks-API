module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    rsync: {
        options: {
            args: ["--verbose"],
            exclude: [".git*",
                      "*.scss",
                      "gruntfile.js",
                      "tests/",
                      "css/",
                      "scripts/",
                      "phantomas/"],
            recursive: true
        },
        dist: {
            options: {
                src: "./",
                dest: "../dist"
            }
        },
        stage: {
            options: {
                src: "../dist/",
                dest: "/var/www/site",
                host: "user@staging-host",
                delete: true // Careful this option could cause data loss, read the docs!
            }
        },
        prod: {
            options: {
                src: "./",
                dest: "~/public/api.brunow.org/public",
                host: "dbrunow@firehawk.brunow.org",
                delete: true // Careful this option could cause data loss, read the docs!
            }
        }
    }
  });

  // Load the plugins.
  grunt.loadNpmTasks('grunt-rsync');

  // Default task(s).
  //grunt.registerTask('default', ['jshint', 'qunit', 'uglify', 'concat', 'cssmin', 'sitemap:dist']);

  //Other tasks
  grunt.registerTask("deploy", ["rsync:prod"]);
};