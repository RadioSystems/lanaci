var exec = require('child_process').exec
  , path = require('path')
  , util = require('util')
  ;

var fetch = exports.fetch = function(repo, remote, branch, cb) {
  exec(
      util.format(
          'git fetch %s && git merge %s -X theirs'
        , remote
        , util.format('%s/%s', remote, branch)
      )
    , {cwd: path.join('/home/lana/repos', repo)}
    , cb
  );
};

var unitTest = exports.unitTest = function(repo, cb) {
  exec(
      'npm test'
    , {cwd: path.join('/home/lana/repos', repo)}
    , cb
  );
};

var run = exports.run = function(repo, cb) {
  exec(
      'npm start'
    , {cwd: path.join('/home/lana/repos', repo)}
    , cb
  );
};
