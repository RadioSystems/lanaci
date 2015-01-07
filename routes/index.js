var fs         = require('fs')
  , handlebars = require('handlebars')
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
  console.log('Got here!');
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
              var dir = yield fs.readdir(path.join(repodir, repo, branch));

              var file = '';
              if (dir.length > 0) {
                var m = misc.max(dir);
                file = yield fs.readFile(path.join(dir, m));
              }
              else {
                file = '';
              }

              data.projects.push({
                  complete: file.length > 0 ? true: false
                , output: file
              });
            }
          }
        }
      }
    }
  }

  var templatePath = path.join(__dirname, '..', 'frontend', 'template.html');
  var template = yield fs.readFile(templatePath);
  var html = handlebars.compile(template)(data);

  this.response.send(200, html);
  yield next;
};
