var exec = require('child_process').exec
  , path = require('path')
  , util = require('util')
  ;

var fetch = exports.fetch = function(repo, remote, branch, cb) {
  exec(util.format('git fetch %s && git merge %s',
                   repo,
                   util.format('%s/%s', remote, branch)),
       {cwd: path.join('/home/lana/repos', repo)},
       function (error, stdout, stderr) {
         if (error !== null) {
           cb(error);
         }

         cb(null);
       }
      );
};
