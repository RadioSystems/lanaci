var koa       = require('koa')
  , koaBody   = require('koa-body')
  , koaRouter = require('koa-router')
  , routes    = require(__dirname + '/routes')
  ;

var server = koa();

server.get('/', routes.display);
server.post('/', koaBody, routes.integrate);

server.listen(6823, function () {
  console.log('%s listening at %s', server.name, server.url);
});
