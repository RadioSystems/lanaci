var fs         = require('fs')
  , handlebars = require('handlebars')
  , hooks      = require(__dirname + '/../lib/hooks')
  , misc       = require(__dirname + '/../lib/misc')
  , path       = require('path')
  , task       = require(__dirname + '/../lib/task')
  , util       = require('util')
;

var integrate = exports.integrate = function(req, res, next) {
  var combos = hooks.handleHooks(req);

  if (combos === 'Hook not supported') {
    return res.send(400, combos);
  }

  res.send(200);
  res.end();

  for (var i = 0; i < combos.length; i++) {
    task(combos[i]);
  }
};

var display = exports.display = function(req, res, next) {
  var conf = misc.readConf('repos.json');
  var repodir = '/home/lana/repos/';
  var dirs = [];
  var data = {
    projects: []
  };

  for (var repo in conf) {
    if (conf.hasOwnProperty(repo)) {
      for (var branch in conf[repo]) {
        if (conf[repo].hasOwnProperty(branch)) {
          var dir = fs.readdirSynx(path.join(repodir, repo, branch));

          var file = '';
          if (dir.length > 0) {
            var m = misc.max(dir);
            file = fs.readFileSync(path.join(dir, m));
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

  var template = fs.readFileSync(__dirname + '/../frontend/template.html');
  var html = handlebars.compile(template)(data);

  res.send(200, html);
  res.end();
};
