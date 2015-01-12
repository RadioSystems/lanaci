var app       = require(__dirname + '/app.js')
  , co        = require('co')
  , fs        = require('co-fs')
  , minimist  = require('minimist')
  , path      = require('path')
  , task      = require(__dirname + '/lib/task')
  , util      = require('util')
  ;

var addRepository = function*(argv) {
  var args = minimist(argv);

  var repository = args['_'][0]
    , branch     = args['_'][1] 
    , hosts      = args.h || args.hosts 
    , options    = args.o || args.options
    , preCmds    = args['_'].slice(2)
    , provider   = args.p || args.provider 
    , url        = args.u || args.url
    ;

  yield task.addRepository(repository, branch, hosts, provider, url, preCmds, options);
};

var addRemote = function*(argv) {
  var args = minimist(argv);
  var user = args['_'][0];
  var host = args['_'][1];

  yield task.addRemote(user, host);
};

var startApp = false, stopApp = false;

co(function*() {
  var argv = process.argv;
  var usage = util.format([
      'Usage: %s <start|stop|add-project|add-remote> [AddOptions|AddRemoteOptions]'
    , 'Add Options:'
    , '\tName of repository'
    , '\tName of branch'
    , '\tComma-separated list of remote hosts: host1.example.com,host2.example.com,etc.'
    , '\t-o --options\tContainer runtime options'
    , '\t-p --provider\tCode host that provides webhooks <github|bitbucket>'
    , '\t-u --url\tURL of private code repository'
    , '\tThe rest are assumed to be pre-commands'
    , ''
    , 'Add-Remote Options'
    , '\tRemote User'
    , '\tRemote Host'
  ].join('\n'), argv.slice(0, 2).join(' '));

  var cmd = argv[2];

  switch (cmd) {
    case 'start':
      startApp = true;
      yield fs.writeFile('lanaci.pid', process.pid);
      break;
    case 'stop':
      stopApp = true;
      break;
    case 'add-project':
      yield addRepository(argv.slice(3));
      break;
    case 'add-remote':
      yield addRemote(argv.slice(3));
      break;
    case '-h':
      console.log(usage);
      break;
    default:
      console.error(usage);
  }
});

if (startApp) {
  app.createApp().listen(6823, function () {
    console.log('Server started!');
  });
}
else if (stopApp) {
  co(function*() {
    try {
      var pid = yield fs.readFile('lanaci.pid'); 
      process.kill(parseInt(pid), 'SIGKILL');
      yield fs.unlink('lanaci.pid');
    }
    catch (err) {
      console.error('LanaCI is not started!');
    }
  });
}
