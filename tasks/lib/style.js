var path = require('path');
var cmd = require('cmd-util');
var format = require('util').format;
var css = cmd.css;
var iduri = cmd.iduri;

exports.init = function(grunt) {

  var exports = {};

  exports.cssConcat = function(fileObj, options) {
    var data = grunt.file.read(fileObj.src);
    var meta = css.parse(data)[0];

    var records = grunt.option('concat-records');
    if (grunt.util._.contains(records, meta.id)) {
      return '';
    }
    records.push(meta.id);

    if (!options.relative) {
      return data;
    }

    function recurse(code) {
      var content, fpath;

      return css.stringify(code, function(node) {
        if (node.id && grunt.util._.contains(records, node.id)) {
          return false;
        }
        if (node.id) {
          records.push(node.id);
        }
        if (node.type === 'import' && node.id) {
          if (node.id.charAt(0) === '.') {
            var id = iduri.absolute(meta.id, node.id);
            if (grunt.util._.contains(records, id)) {
              return false; 
            }
            records.push(id);
            fpath = path.join(path.dirname(fileObj.src), node.id);
            if (!/\.css$/.test(fpath)) fpath += '.css';
            if (!grunt.file.exists(fpath)) {
              grunt.log.warn('file ' + fpath + ' not found');
              return false;
            }
            content = grunt.file.read(fpath);
            return recurse(css.parse(content));
          }
          var fileInPaths;
          options.paths.some(function(basedir) {
            fpath = path.join(basedir, node.id);
            if (!/\.css$/.test(fpath)) fpath += '.css';
            if (grunt.file.exists(fpath)) {
              fileInPaths = fpath;
              return true;
            }
          });
          if (!fileInPaths) {
            grunt.log.warn('file ' + node.id + ' not found');
            return false;
          }
          content = grunt.file.read(fpath);
          return recurse(css.parse(content));
        }
      });
    }

    var ret = [
      format('/*! block %s */', meta.id),
      recurse(meta.code),
      format('/*! endblock %s */', meta.id)
    ].join('\n');
    return ret;
  };

  return exports;
};
