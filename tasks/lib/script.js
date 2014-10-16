var path = require('path');
var cmd = require('cmd-util');
var ast = cmd.ast;
var iduri = cmd.iduri;

exports.init = function(grunt) {

  var exports = {};

  exports.jsConcat = function(fileObj, options) {
    var data = grunt.file.read(fileObj.src);

    var meta = ast.parseFirst(data);
    var records = grunt.option('concat-records');

    if (grunt.util._.contains(records, meta.id)) {
      return '';
    }
    records.push(meta.id);

    if (options.include === 'self') {
      return data;
    }

    var pkgPath = path.resolve('package.json');
    if (grunt.file.exists(pkgPath)) {
      var pkg = grunt.file.readJSON(pkgPath);
      if (pkg.spm && pkg.spm.styleBox === true) {
        options.styleBox = true;
      }
    }

    var uniqueDeps = {
      deps: {},
      has: function(id) {
        return this.deps[id]
      },
      cache: function(data) {
        if(data) {
          var meta = ast.parse(data)
          meta.forEach(function(m) {
            uniqueDeps.deps[m.id] = true
          })
        }
      }
    }

    var rv = meta.dependencies.map(function(dep) {
      if (dep.charAt(0) === '.') {
        var id = iduri.absolute(meta.id, dep);
        if (grunt.util._.contains(records, id)) {
          return '';
        }
        records.push(id);

        var fpath = path.join(path.dirname(fileObj.src), dep);
        if (!/\.js$/.test(fpath)) fpath += '.js';
        if (!grunt.file.exists(fpath)) {
          if (!/\{\w+\}/.test(fpath)) {
            grunt.log.warn('file ' + fpath + ' not found');
          }
          return '';
        }

        if(uniqueDeps.has(dep)) {
          return ''
        }

        var data = grunt.file.read(fpath)
        uniqueDeps.cache(data)

        var astCache = ast.getAst(data);
        var srcId = ast.parseFirst(astCache).id;
        astCache = ast.modify(astCache,  function(v) {
          if (v.charAt(0) === '.') {
            return iduri.absolute(srcId, v);
          }
          return v;
        });
        return astCache.print_to_string(options.uglify);

      } else if ((/\.css$/.test(dep) && options.css2js) || options.include === 'all') {
        var fileInPaths;

        options.paths.some(function(basedir) {
          var fpath = path.join(basedir, dep);
          if (!/\.css$/.test(dep)) {
            fpath += '.js';
          }
          if (grunt.file.exists(fpath)) {
            fileInPaths = fpath;
            return true;
          }
        });

        if (!fileInPaths) {
          grunt.log.warn('file ' + dep + ' not found');
        } else {
          if (uniqueDeps.has(dep)) {
            return ''
          }
          var data = grunt.file.read(fileInPaths);
          if (/\.css$/.test(dep)) {
            var css2jsData = options.css2js(data, dep, options);
            uniqueDeps.cache(css2jsData)
            return css2jsData
          }
          uniqueDeps.cache(data)
          return data;
        }
      }
      return '';
    }).join(grunt.util.normalizelf(options.separator));
    return [data, rv].join(grunt.util.normalizelf(options.separator));
  };

  return exports;
};
