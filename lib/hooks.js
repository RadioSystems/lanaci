var misc = require(__dirname + '/misc')
  , util = require('util')
  ;

var bitBucket = function(body, confFile) {
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
  }

  return combos;
};

var gitHub = function(body, confFile) {
  var conf = misc.readConf(confFile);
  var combos = [];

  if (body.hasOwnProperty('repository')) {
    var repo = '/' + body.repository.full_name;
    var branch = body.ref.splice('/')[2];
    
    if (conf.github.hasOwnProperty(repo) &&
        conf.github[repo].hasOwnProperty(branch)) {
      combos.push({
          repo: repo
        , branch: branch
        , conf: conf.bitbucket[repo][branch]
      });
    }
  }

  return combos;
};


var handleHooks = exports.handleHooks = function(req, confFile) {
  confFile = confFile || 'repos.json';

  if (req.body.hasOwnProperty('canon_url') &&
      req.body.canon_url === 'https://bitbucket.org') {
    return bitBucket(req.body, confFile);
  }
  else if (req.header('X-Github-Event') === 'push') {
    return gitHub(req.body, confFile);
  }
  else {
    return "Hook not supported";
  }
};
