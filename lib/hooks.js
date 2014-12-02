var misc = require(__dirname + '/misc')
  , util = require('util')
  ;

var bitBucket = exports.bitBucket = function(body) {
  var conf = misc.readRepoConf();
  var repo = body.repository.absolute_url;
  var combos = [];

  if (conf.bitbucket.hasOwnProperty(repo)) {
    for (var commit in body.commits) {
      if (body.commits.hasOwnProperty(commit)) {
        var branch = body.commits[commit].branch;
        var combo = [repo, branch];

        if (conf.bitbucket[repo].hasOwnProperty(branch) &&
            !misc.isIn(combos, combo)) {
          combos.push(combo);
        }
      }
    }

    return combos;
  }
};
