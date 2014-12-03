var restify   = require('restify')
  , routes    = require(__dirname + '/routes')
  , integrate = routes.integrate
  ;

var server = restify.createServer();
server.use(restify.bodyParser({ mapParams: false }));

server.post('/', integrate);

server.listen(8080, function () {
  console.log('%s listening at %s', server.name, server.url);
});
