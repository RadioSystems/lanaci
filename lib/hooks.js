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
      var combo = [repo, branch];

      if (conf.bitbucket[repo].hasOwnProperty(branch) &&
          !misc.isIn(combos, combo)) {
        combos.push(combo);
      }
    }

    return combos;
  }
};
