/*
 * grunt-cmd-concat
 * https://github.com/spmjs/grunt-cmd-concat
 *
 * Copyright (c) 2013 Hsiaoming Yang
 * Licensed under the MIT license.
 */

var path = require('path');

module.exports = function(grunt) {

  var ast = require('cmd-util').ast;
  var script = require('./lib/script').init(grunt);
  var style = require('./lib/style').init(grunt);

  var processors = {
    '.js': script.jsConcat,
    '.css': style.cssConcat
  };

  grunt.registerMultiTask('concat', 'concat cmd modules.', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      separator: grunt.util.linefeed,
      uglify: {
        beautify: true,
        comments: true
      },
      paths: ['sea-modules'],
      processors: {},
      relative: true,
      banner: ''
    });

    this.files.forEach(function(f) {
      // reset records
      grunt.option('concat-records', []);

      // Concat specified files.
      var src = options.banner + f.src.filter(function(filepath) {
        // Warn on and remove invalid source files (if nonull was set).
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return false;
        } else {
          return true;
        }
      }).map(function(filepath) {
        var extname = path.extname(filepath);
        var processor = options.processors[extname] || processors[extname];
        if (!processor) {
          return grunt.file.read(filepath);
        }
        return processor({src: filepath}, options);
      }).join(grunt.util.normalizelf(options.separator));

      if (/\.js$/.test(f.dest)) {
        src = ast.modify(src, {
          dependencies: function(v) {
            var ext = path.extname(v);
            // remove useless dependencies
            if (ext && ext !== '.js') return null;
            return v;
          }
        }).print_to_string(options.uglify);
      }
      // ensure a new line at the end of file
      src += '\n';

      // Write the destination file.
      grunt.file.write(f.dest, src);

      // Print a success message.
      grunt.log.writeln('File "' + f.dest + '" created.');
    });
  });
};
