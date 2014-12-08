var restify   = require('restify')
  , routes    = require(__dirname + '/routes')
  , display   = routes.display
  , integrate = routes.integrate
  ;

var server = restify.createServer();
server.use(restify.bodyParser({ mapParams: false }));

server.get('/', display);
server.post('/', integrate);

server.listen(6823, function () {
  console.log('%s listening at %s', server.name, server.url);
});
