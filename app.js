var koa       = require('koa')
  , koaBody   = require('koa-body')
  , router    = require('koa-router')
  , routes    = require(__dirname + '/routes')
  ;

var app = koa();

app.use(router(app));

app.get('/', routes.display);
app.post('/', koaBody, routes.integrate);

app.listen(6823, function () {
  console.log('%s listening at %s', app.name, app.url);
});
