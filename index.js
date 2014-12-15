var argv      = require('minimist')(process.argv.slice(2))
  , daemonize = require('daemonize2')
  , path      = require('path')
  , task      = require(__dirname + '/../lib/task')
  , util      = require('util')
  ;

var usage = util.format([
    'Usage: %s <start|stop|add>'
  , 'Add Options:'
  , '\t-h --host\tSpecify remote host'
  , '\t-l --language\tProgramming language of application'
  , '\t-p --provider\tCode host that provides webhooks <github|bitbucket>'
  , '\t-r --repository\tName of repository'
  , '\t-u --url\tURL of private code repository'
].join('\n'), argv['_'][0]);

var daemon = require('daemonize2').setup({
    main: path.join(__dirname, '..', 'app.js')
  , name: 'lana'
  , pidfile: 'lana.pid'
});

var cmd = argv['_'][1];

var addRepository = function*(args) {
  var branches = args['_'].slice(2)
    , host       = args.h || args.host 
    , language   = args.l || args.language || 'nodejs'
    , provider   = args.p || args.provider || 'github'
    , repository = args['_'][2]
    , test       = true;
    , url        = args.u || args.url || ''
    ;

  if (args.hasOwnProperty('t')) {
    test = args.t;
  }
  else if (args.hasOwnProperty('test')) {
    test = args.test;
  }

  yield task.addRepository(repository, branches, host, language, provider, test, url);
};


switch (cmd) {
  case 'start':
    daemon.start();
    break;
  case 'stop':
    daemon.stop();
    break;
  case 'add':
    addRepository(argv);
    break;
  default:
    console.error(usage);
}
