var exec = require('child_process').exec
  , path = require('path')
  , util = require('util')
  ;

var fetch = exports.fetch = function(repo, remote, branch, cb) {
  exec(util.format('git fetch %s && git merge %s -X theirs',
                   remote,
                   util.format('%s/%s', remote, branch)),
       {cwd: path.join('/home/lana/repos', repo)},
       function (error, stdout, stderr) {
         if (error !== null) {
           return cb(error);
         }
         else if (stderr !== null) {
           return cb(stderr);
         }

         cb(null);
       }
      );
};
