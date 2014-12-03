var git      = require(__dirname + '/git')
  , hooks    = require(__dirname + '/hooks')
  , run      = require(__dirname + '/run')
  , unitTest = require(__dirname + '/unit-test')
;

var hasErrors = function(error, stderr) {
  if (error) {
    console.error(error);
    return true;
  }
  else if (stderr) {
    console.error(stderr);
    return true;
  }

  return false;
};


var fetchHelper = function(repo, branch) {
  
};


var integrate = exports.integrate = function(req, res, next) {
  var combos = hooks.handleHooks(req);

  if (combos === 'Hook not supported') {
    return res.send(400, combos);
  }

  res.send(200);
  res.end();

  combos.forEach(function (el, i, arr) {
    git.fetch(
        el[0]
      , 'origin'
      , el[1]
      , function (fetchErr, fetchOut, fetchStdErr) {
          if (fetchErr) {
            return console.error(fetchErr);
          }
          else if (fetchStdErr) {
            return console.error(fetchStdErr);
          }

        unitTest.unitTest(
          el[0], function () {
            
          })
        }
    );
  });
};
