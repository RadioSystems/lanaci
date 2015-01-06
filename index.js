var co        = require('co')
  , daemonize = require('daemonize2')
  , fs        = require('co-fs')
  , minimist  = require('minimist')
  , path      = require('path')
  , task      = require(__dirname + '/lib/task')
  , util      = require('util')
  ;

var addRepository = function*(argv) {
  var args = minimist(argv);
  console.log(args);
  var repository = args['_'][0]
    , branch     = args['_'][1]
    , hosts      = args['_'][2].split(',')
    , provider   = args.p || args.provider || 'github'
    , preCmds    = args['_'].slice(3)
    , url        = args.u || args.url || ''
    ;

  yield task.addRepository(repository, branch, hosts, provider, url, preCmds);
};

co(function* () {
  var argv = process.argv;
  var usage = util.format([
      'Usage: %s <start|stop|add> [AddOptions]'
    , 'Add Options:'
    , '\tName of repository'
    , '\tName of branch'
    , '\tComma-separated list of remote hosts: host1.example.com,host2.example.com,etc.'
    , '\t-p --provider\tCode host that provides webhooks <github|bitbucket>'
    , '\t-u --url\tURL of private code repository'
    , '\tThe rest are assumed to be pre-commands'
  ].join('\n'), argv.slice(0, 2).join(' '));

  var daemon = daemonize.setup({
      main: path.join(__dirname, 'app.js')
    , name: 'lana'
    , pidfile: 'lana.pid'
  });

  var cmd = argv[2];

  switch (cmd) {
    case 'start':
      daemon.start();
      break;
    case 'stop':
      daemon.stop();
      break;
    case 'add':
      yield addRepository(argv.slice(3));
      break;
    case '-h':
      console.log(usage);
      break;
    default:
      console.error(usage);
  }
});
