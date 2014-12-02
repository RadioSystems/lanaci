var hooks = require('hooks');

var integrate = exports.integrate = function(req, res, next) {
  var branches = [];
  
  if (req.body.hasOwnProperty('canon_url') &&
      req.body.canon_url === 'https://bitbucket.org') {
    res.send(200);
    res.end();
    hooks.bitBucket(req.body);
  }
  //else if (req.header('X-Github-Event') === 'push') {
  //  res.send(200);
  //  res.end();
  //  hooks.gitHub(req.body);
  //}
  else {
    console.error('Hook not supported!');
    return res.send(400);
  }
};
