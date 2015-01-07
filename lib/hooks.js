var misc = require(__dirname + '/misc')
  , util = require('util')
  ;

var bitBucket = function*(body, confFile) {
  var conf = yield misc.readConf(confFile);
  var provider = 'bitbucket';
  var repo = body.repository.absolute_url.substring(1, body.repository.absolute_url.length-1);
  var combos = [];

  if (conf.providers[provider].hasOwnProperty(repo)) {
    for (var i = 0; i < body.commits.length; i++) {
      var branch = body.commits[i].branch;

      if (conf.providers[provider][repo].hasOwnProperty(branch)) {
        var combo = {
            provider: provider
          , repo: repo
          , branch: branch
          , conf: conf.providers[provider][repo][branch]
        };

        if (!misc.isIn(combos, combo)) {
          combos.push(combo);
        }
      }
    }
  }

  return combos;
};

var gitHub = function*(body, confFile) {
  var conf = yield misc.readConf(confFile);
  var combos = [];

  if (body.hasOwnProperty('repository')) {
    var provider = 'github';
    var repo = body.repository.full_name;
    var branch = body.ref.split('/')[2];
    
    if (conf.providers[provider].hasOwnProperty(repo) &&
        conf.providers[provider][repo].hasOwnProperty(branch)) {
      combos.push({
          provider: provider
        , repo: repo
        , branch: branch
        , conf: conf.providers[provider][repo][branch]
      });
    }
  }

  return combos;
};

var handleHooks = exports.handleHooks = function*(req, confFile) {
  confFile = confFile || 'repos.toml';
  var out = null;

  if (req.body.hasOwnProperty('canon_url') &&
      req.body.canon_url === 'https://bitbucket.org') {
    out = yield bitBucket(req.body, confFile);
  }
  else if (req.header('X-Github-Event') === 'push') {
    out = yield gitHub(req.body, confFile);
  }
  else {
    throw "Hook not supported";
  }

  return out;
};
