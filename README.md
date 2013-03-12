# grunt-cmd-concat

> Concatenate cmd files.

## Getting Started
This plugin requires Grunt `~0.4.0`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-cmd-concat --save-dev
```

One the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-cmd-concat');
```

## The "concat" task

### Overview
In your project's Gruntfile, add a section named `cmd_concat` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  concat: {
    options: {
      // Task-specific options go here.
    },
    your_target: {
      // Target-specific file lists and/or options go here.
    },
  },
})
```

### Options

#### options.separator

Type: `String`
Default value: `',  '`

A string value that is used to do something with whatever.

#### options.relative

Type: `Boolean`
Default value: `true`

Include all relative dependencies.

### Usage Examples

#### Simple Concat

This is the same as `grunt-contrib-concat`.

```js
grunt.initConfig({
  concat: {
    options: {
      relative: false
    },
    files: {
      'dist/a.js': ['src/a.js', 'src/b.js'],
    },
  },
})
```

#### Relative Concat

This will include all relative dependencies.

```js
grunt.initConfig({
  concat: {
    options: {
      relative: true
    },
    files: {
      'dist/a.js': ['src/a.js', 'src/b.js'],
    },
  },
})
```

The `a.js` is something like:

```js
define('a', ['./c'], ...)
```

And the result should be the concat of `a.js`, `c.js` and `b.js`.

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_
