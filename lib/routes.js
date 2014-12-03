var hooks = require('hooks');

var integrate = exports.integrate = function(req, res, next) {
  var branches = [];

  var combos = hooks.handleHooks(req);

  res.send(200);
  res.end();
};
