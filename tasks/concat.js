/*
 * grunt-cmd-concat
 * https://github.com/spmjs/grunt-cmd-concat
 *
 * Copyright (c) 2013 Hsiaoming Yang
 * Licensed under the MIT license.
 */

var cmd = require('cmd-util');
var iduri = cmd.iduri;
var ast = cmd.ast;
var path = require('path');


module.exports = function(grunt) {

  grunt.registerMultiTask('concat', 'concat cmd modules.', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      separator: grunt.util.linefeed,
      relative: true,
      banner: ''
    });

    var records = [];

    this.files.forEach(function(f) {
      // reset records
      records = [];

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
        // Read file source.
        return readRelative(filepath);
      }).join(grunt.util.normalizelf(options.separator));

      // Write the destination file.
      grunt.file.write(f.dest, src);

      // Print a success message.
      grunt.log.writeln('File "' + f.dest + '" created.');
    });

    function readRelative(filepath) {
      var data = grunt.file.read(filepath);
      var meta = ast.parseFirst(data);

      if (grunt.util._.contains(records, meta.id)) {
        return '';
      }
      records.push(meta.id);

      if (!options.relative) {
        return data;
      }

      var rv = meta.dependencies.map(function(dep) {
        if (dep.charAt(0) === '.') {
          var id = iduri.absolute(meta.id, dep);
          if (grunt.util._.contains(records, id)) {
            return '';
          }
          records.push(id);

          var fpath = path.join(path.dirname(filepath), dep);
          if (!/\.js$/.test(fpath)) fpath += '.js';
          if (!grunt.file.exists(fpath)) {
            grunt.log.warn('file ' + fpath + ' not found');
            return '';
          }
          return grunt.file.read(fpath);
        }
        return '';
      }).join(grunt.util.normalizelf(options.separator));
      return [data, rv].join(grunt.util.normalizelf(options.separator));
    }
  });

};
