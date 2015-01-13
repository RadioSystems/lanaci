var equal = require('deep-equal')
  , fs    = require('co-fs')
  , js2t  = require('json2toml')
  , path  = require('path')
  , toml  = require('toml')
  ;

var readConf = exports.readConf = function*(file) {
  var data = yield fs.readFile(file);

  return toml.parse(data);
};

var writeConf = exports.writeConf = function*(file, contents) {
  yield fs.writeFile(file, js2t(contents));
};

var isIn = exports.isIn = function(arr, el) {
  for (var i = 0; i < arr.length; i++) {
    if (equal(arr[i], el)) {
      return true;
    }
  }

  return false;
};

var max = exports.max = function(arr) {
  var m = arr[0];

  for (var i = 1; i < arr.length; i++) {
    if (arr[i] > m) {
      m = arr[i];
    }
  }

  return m;
};

var processCommand = exports.processCommand = function*(cmd, cwd, exec) {
  exec = exec || require('exec-co');
  var result = yield exec(cmd, {cwd: cwd});

  if (result.err) {
    throw result.err;
  }
  else if (result.stderr) {
    throw {message: result.stderr};
  }

  return result.stdout;
};
