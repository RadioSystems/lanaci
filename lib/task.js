var fs   = require('co-fs')
  , misc = require(__dirname + '/misc')
  , path = require('path')
  , util = require('util')
  ;

var integrate = exports.integrate = function*(combo, processCommand) {
  processCommand = processCommand || misc.processCommand;
  
  var repository = combo[0];
  var branch = combo[1];
  var host = combo[2].host || '';
  var testCommands = combo[2].test_commands || ['npm test'];

  if (!host) {
    throw util.format('Invalid host: %s with project %s', host, repository);
  }

  var result = '', cmd = '';
  var repoDir = util.format('/home/lana/repos/%s/', repository);
  var logFile = util.format('/home/lana/logs/%s/%d', repository, Date.now());

  cmd = 'git fetch origin';
  yield processCommand(cmd, repoDir, logFile);
  
  cmd = util.format('git checkout %s', branch);
  yield processCommand(cmd, repoDir, logFile);
  
  cmd = util.format('git merge origin/%s -X theirs', branch);
  yield processCommand(cmd, repoDir, logFile); 

  for (var i = 0; i < testCommands.length; i++) {
    cmd = testCommands[i];
    yield processCommand(cmd, repoDir, logFile);
  }

  cmd = util.format('docker build -t=%s .', repository);
  yield processCommand(cmd, repoDir, logFile);

  var localImgDir = '/home/lana/local-images/';
  var imgFile = util.format('%s.tar', repository.replace(/\//g, '_'));
  cmd = util.format('docker save -o %s%s %s', localImgDir, imgFile, repository);
  yield processCommand(cmd, repoDir, logFile);

  var remoteImgDir = '/home/lana/remote-images/';
  cmd = util.format('scp %s%s lana@%s:%s%s', localImgDir, imgFile, host, remoteImgDir, imgFile);
  yield processCommand(cmd, repoDir, logFile);

  cmd = util.format('ssh lana@%s docker load -i %s%s', host, remoteImgDir, imgFile);
  yield processCommand(cmd, repoDir, logFile);

  cmd = util.format('ssh lana@%s docker kill %s', host, repository);
  yield processCommand(cmd, repoDir, logFile);

  cmd = util.format('ssh lana@%s docker run -d --name %s %s', host, repository, repository);
  yield processCommand(cmd, repoDir, logFile);
};

var addRepository = exports.addRepository = function*(repository, branches, host, language, provider, test, url, processCommand) {
  processCommand = processCommand || misc.processCommand;
 
  if (!repository) {
    throw 'No repository specified!';
  }

  // Handle case of default URLs
  switch(provider) {
    case 'bitbucket':
      url = url || util.format('git@bitbucket.org:%s.git', repository);
      break;
    case 'github':
      url = url || util.format('git@github.com:%s.git', repository);
      break;
    default:
      throw util.format('Invalid provider: %s', provider);
  }

  var repoDir = util.format('/home/lana/repos/%s', repository);
  var cmd = util.format('git clone %s %s', url, repoDir);
  try {
    yield misc.processCommand(cmd, repoDir, '/dev/stderr');
  }
  catch (err) {
    if (err.message !== util.format("fatal: destination path '%s' already exists and is not an empty directory", repoDir)) {
      throw err;
    }
  }
  
  for (var i = 0; i < branches.length; i++) {
    var branch = branches[i];
    cmd = util.format('mkdir -p /home/lana/logs/%s/%s', repository, branch);
    yield misc.processCommand(cmd, '/home/lana', '/dev/stderr');

    cmd = util.format('git checkout --track origin/%s', branch);
    yield misc.processCommand(cmd, repoDir, '/dev/stderr');
  }
};
