var koa       = require('koa')
  , koaBody   = require('koa-body')
  , router    = require('koa-router')
  , routes    = require(__dirname + '/routes')
  ;

var createApp = exports.createApp = function() {
  var app = koa();
  
  app.use(router(app));
  
  app.get('/', routes.display);
  app.post('/', koaBody, routes.integrate);

  return app;
};
