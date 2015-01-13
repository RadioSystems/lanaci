var fs         = require('co-fs')
  , hooks      = require(__dirname + '/../lib/hooks')
  , misc       = require(__dirname + '/../lib/misc')
  , path       = require('path')
  , task       = require(__dirname + '/../lib/task')
  , util       = require('util')
;

var integrate = exports.integrate = function*(next) {
  var combos = hooks.handleHooks(this.request);

  if (combos === 'Hook not supported') {
    this.throw(combos, 400);
  }

  this.status = 200;

  yield next;

  for (var i = 0; i < combos.length; i++) {
    task(combos[i]);
  }
};

var projects = exports.projects = function*(next) {
  var dirs = [];
  var projects = [];
  var confFile = path.join(__dirname, '..', 'conf', 'repos.toml');
  var logDir = path.join(__dirname, '..', 'logs');

  try {
    var conf = yield misc.readConf(confFile);

    for (var provider in conf.providers) {
      if (conf.providers.hasOwnProperty(provider)) {
        for (var repo in conf.providers[provider]) {
          if (conf.providers[provider].hasOwnProperty(repo)) {
            for (var branch in conf.providers[provider][repo]) {
              if (conf.providers[provider][repo].hasOwnProperty(branch)) {
                var err = false;
                var file = '';

                try {
                  var dirPath = path.join(logDir, provider, repo, branch);
                  var dir = yield fs.readdir(dirPath);

                  if (dir.length > 0) {
                    var m = misc.max(dir);
                    file = yield fs.readFile(path.join(dir, m));
                  }
                  else {
                    file = '';
                  }
                }
                catch (e) {
                  console.error(e);
                  err = e;
                }
                finally {
                  projects.push({
                      branch: branch
                    , output: file || err
                    , provider: provider
                    , repo: repo
                  });
                }
              }
            }
          }
        }
      }
    }
  }
  catch (err2) {
    console.error(err2);
  }
  finally {
    this.body = projects;
    yield next;
  }
};
