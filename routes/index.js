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
    return this.response.send(400, combos);
  }

  yield next;

  this.response.send(200);
  this.response.end();

  for (var i = 0; i < combos.length; i++) {
    task(combos[i]);
  }
};

var projects = exports.projects = function*(next) {
  var conf = yield misc.readConf('repos.toml');
  var repodir = path.normalize(path.join(__dirname, '..', 'repos'));
  var dirs = [];
  var projects = [];

  for (var provider in conf.providers) {
    if (conf.providers.hasOwnProperty(provider)) {
      for (var repo in conf.providers[provider]) {
        if (conf.providers[provider].hasOwnProperty(repo)) {
          for (var branch in conf.providers[provider][repo]) {
            if (conf.providers[provider][repo].hasOwnProperty(branch)) {
              var err = false;
              var file = '';

              try {
                var dirPath = path.join(repodir, provider, repo, branch);
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
  console.log(projects);
  this.body = projects;

  yield next;
};

//var index = exports.index = function*(next) {
//  var filePath = path.join(__dirname, '..', 'frontend', 'public', 'template.html');
//  
//  this.body = yield fs.readFile(filePath);
//
//  yield next;
//};
