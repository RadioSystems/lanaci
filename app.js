var koa       = require('koa')
  , koaBody   = require('koa-body')
  , path      = require('path')
  , router    = require('koa-router')
  , routes    = require(__dirname + '/routes')
  , koaStatic = require('koa-static')
  ;

var createApp = exports.createApp = function() {
  var app = koa();
  
  app.use(koaStatic(path.join(__dirname, 'frontend', 'public')));
  app.use(router(app));
  
  //app.get('/', routes.index);
  app.get('/projects', routes.projects);
  app.post('/', koaBody, routes.integrate);

  return app;
};
