var equal = require('deep-equal')
  , fs    = require('co-fs')
  , path  = require('path')
  , util = require('util')
  ;

var readConf = exports.readConf = function*(file) {
  var filePath = path.join(__dirname, '..', 'conf', file);
  var data = yield fs.readFile(filePath);

  return JSON.parse(data);
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

var processCommand = exports.processCommand = function*(cmd, cwd, log, exec) {
  exec = exec || require('exec-co');
  var result = yield exec(cmd, {cwd: cwd});

  if (result.err) {
    yield fs.writeFile(log, result.err.message, 'utf8');
    throw result.err;
  }
  else if (result.stderr) {
    yield fs.writeFile(log, result.stderr, 'utf8');
    throw {message: result.stderr};
  }
};
