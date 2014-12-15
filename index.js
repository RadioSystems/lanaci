var argv      = require('minimist')(process.argv.slice(2))
  , daemonize = require('daemonize2')
  , misc      = require(__dirname+'/lib/misc')
  , path      = require('path')
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
  try {
    var host       = args.h || args.host || '127.0.0.1'
      , language   = args.l || args.language || 'nodejs'
      , provider   = args.p || args.provider || 'github'
      , repository = args['_'][2]
      , url        = args.u || args.url || ''
      ;
  
    if (!repository) {
      console.error('No repository specified!');
      process.exit(2);
    }
  
    // Handle case of default URLs
    if (url === '') {
      switch(provider) {
        case 'bitbucket':
          url = util.format('git@bitbucket.org:%s.git', repository);
          break;
        case 'github':
          url = util.format('git@github.com:%s.git', repository);
          break;
        default:
          console.error(util.format('Invalid provider: %s', provider));
          process.exit(3);
      }
    }
  
    var repoDir = util.format('/home/lana/repos/%s', repository);
    var cmd = util.format('git clone %s %s', url, repoDir);
    yield misc.processCommand(cmd, repoDir, '/dev/stderr');
    
    for (var i = 2; i < args['_'].length; i++) {
      var branch = args['_'][i];
      cmd = util.format('mkdir -p /home/lana/logs/%s/%s', repository, branch);
      yield misc.processCommand(cmd, '/home/lana', '/dev/stderr');
  
      cmd = util.format('git checkout --track origin/%s', branch);
      yield misc.processCommand(cmd, repoDir, '/dev/stderr');
    }
  }
  catch (err) {
    console.error(err.message);
    process.exit(4);
  }
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
