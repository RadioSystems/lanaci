var exec  = require('child_process').exec
  , equal = require('deep-equal')
  , fs    = require('fs')
  , path  = require('path')
  , util = require('util')
  ;

var readConf = exports.readConf = function(file) {
  var filePath = path.join(__dirname, '..', 'conf', file);

  return JSON.parse(fs.readFileSync(filePath));
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

var processCommand = exports.processCommand = function(cmd, repo, cb) {
  exec(
      cmd
    , {cwd: path.join('/home/lana/repos', repo)}
    , function (error, stdout, stderr) {
        var outError = null;

        if (error) {
          outError = error;
        }
        else if (stderr) {
          outError = stderr;
        }

        cb(outError, stdout);
      }
  );
};
