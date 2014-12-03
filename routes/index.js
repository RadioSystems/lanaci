var hooks = require(__dirname + '/../lib/hooks')
  , task  = require(__dirname + '/../lib/task')
;



var integrate = exports.integrate = function(req, res, next) {
  var combos = hooks.handleHooks(req);

  if (combos === 'Hook not supported') {
    return res.send(400, combos);
  }

  res.send(200);
  res.end();

  for (var i = 0; i < combos.length; i++) {
    task(combos[i][0], combos[i][1]);
  }
};
