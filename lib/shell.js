var exec = require('child_process').exec
  , path = require('path')
  , util = require('util')
  ;

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
