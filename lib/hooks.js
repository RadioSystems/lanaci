var misc = require(__dirname + '/misc')
  , util = require('util')
  ;

var bitBucket = exports.bitBucket = function(body, confFile) {
  confFile = confFile || 'repos.json';
  var conf = misc.readConf(confFile);
  var repo = body.repository.absolute_url;
  var combos = [];

  if (conf.bitbucket.hasOwnProperty(repo)) {
    for (var i = 0; i < body.commits.length; i++) {
      var branch = body.commits[i].branch;

      if (conf.bitbucket[repo].hasOwnProperty(branch)) {
        var combo = {
            repo: repo
          , branch: branch
          , conf: conf.bitbucket[repo][branch]
        };

        if (!misc.isIn(combos, combo)) {
          combos.push(combo);
        }
      }
    }

    return combos;
  }
};
