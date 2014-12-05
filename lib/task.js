var misc = require(__dirname + '/misc')
  , util = require('util')
  ;

var task = exports.task = function(combo) {
  var repo = combo[0];
  var branch = combo[1];
  var test = combo[2].test || false;
  var build = combo[2].build || false;

  var cmd = util.format(
      '%s/../sh/integrate.sh %s %s %s %s'
    , __dirname
    , repo
    , branch
    , test
  ); 

  misc.processCommand(cmd, repo, function (err, out) {
    if (err) {
      console.error(err);
    }
    
    console.log(out);
  });
};
