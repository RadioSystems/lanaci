var co        = require('co')
  , daemonize = require('daemonize2')
  , fs        = require('co-fs')
  , minimist  = require('minimist')
  , path      = require('path')
  , task      = require(__dirname + '/lib/task')
  , util      = require('util')
  ;

var usage = util.format([
    'Usage: %s <start|stop|add>'
  , 'Add Options:'
  , '\t-h --host\tSpecify remote host'
  , '\t-p --provider\tCode host that provides webhooks <github|bitbucket>'
  , '\t-r --repository\tName of repository'
  , '\t-u --url\tURL of private code repository'
].join('\n'), process.argv.slice(0, 2).join(' '));


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

  var confPath = path.join(__dirname, 'conf', 'test.json');
  var testConf = JSON.parse(yield fs.readFile(confPath));
  for (var i = 0; i < languages.length; i++) {
    if (testConf.hasOwnProperty(languages[i])) {
      tests.push(testConf[languages[i]]);
    }
    else {
      console.error(util.format('Invalid language: %s', languages[i]));
    }
  }

  //yield task.addRepository(repository, branch, hosts, provider, tests, url);
  console.log(tests);
};

co(function* () {
  var argv = process.argv;
  var usage = util.format([
      'Usage: %s <start|stop|add> [AddOptions]'
    , 'Add Options:'
    , '\tName of repository'
    , '\tName of branch'
    , '\t-H --host\tComma-separated list of remote hosts: host1.example.com,host2.example.com,etc.'
    , '\t-l --language\tProgramming language of application'
    , '\t-p --provider\tCode host that provides webhooks <github|bitbucket>'
    , '\t-u --url\tURL of private code repository'
  ].join('\n'), argv.slice(0, 2).join(' '));
  console.log(argv);

  var daemon = daemonize.setup({
      main: path.join(__dirname, 'app.js')
    , name: 'lana'
    , pidfile: 'lana.pid'
  });

  var cmd = argv[2];
  console.log(cmd);

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
