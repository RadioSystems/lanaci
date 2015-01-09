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

var display = exports.display = function*(next) {
  var conf = yield misc.readConf('repos.toml');
  var repodir = path.normalize(path.join(__dirname, '..', 'repos'));
  var dirs = [];
  var data = {
    projects: []
  };

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
                data.projects.push({
                    complete: !(err || file.length > 0)
                  , name: util.format('%s:%s:%s', provider, repo, branch)
                  , output: file || err
                });
              }
            }
          }
        }
      }
    }
  }

  var templatePath = path.join(__dirname, '..', 'frontend', 'template.html');
  var template = yield fs.readFile(templatePath, 'utf8');
  var html = ejs.render(template, data);

  this.body = html;
  yield next;
};
