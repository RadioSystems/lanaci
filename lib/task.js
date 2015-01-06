var fs   = require('co-fs')
  , misc = require(__dirname + '/misc')
  , path = require('path')
  , util = require('util')
  ;

var integrate = exports.integrate = function*(combo, processCommand, handleError) {
  processCommand = processCommand || misc.processCommand;
  handleError = handleError || fs.writeFile; 
  
  var repository = combo[0];
  var branch = combo[1];
  var host = combo[2].host || '';
  var preCommands = combo[2].pre_commands || ['npm test'];
  var result = '', cmd = '';
  var homeDir = path.normalize(path.join(__dirname, '..'));
  var repoDir = path.join(homeDir, 'repos', repository);
  var logFile = path.join(homeDir, 'logs', repository, branch, Date.now().toString());

  try {
    if (!host) {
      throw util.format('Invalid host: %s with project %s and branch %s', host, repository, branch);
    }
  
    cmd = 'git fetch origin';
    yield processCommand(cmd, repoDir);
    
    cmd = util.format('git checkout %s', branch);
    yield processCommand(cmd, repoDir);
    
    cmd = util.format('git merge origin/%s -X theirs', branch);
    yield processCommand(cmd, repoDir); 
  
    for (var i = 0; i < preCommands.length; i++) {
      cmd = preCommands[i];
      yield processCommand(cmd, repoDir);
    }
  
    cmd = util.format('docker build -t=%s .', repository);
    yield processCommand(cmd, repoDir);
  
    var localImgDir = path.join(homeDir, 'local-images');
    var imgFile = util.format('%s.tar', repository.replace(/\//g, '_'));
    cmd = util.format('docker save -o %s/%s %s', localImgDir, imgFile, repository);
    yield processCommand(cmd, repoDir);
  
    var remoteImgDir = path.join(homeDir, 'remote-images');
    cmd = util.format('scp %s/%s lanaci@%s:%s/%s', localImgDir, imgFile, host, remoteImgDir, imgFile);
    yield processCommand(cmd, repoDir);
  
    cmd = util.format('ssh lanaci@%s docker load -i %s/%s', host, remoteImgDir, imgFile);
    yield processCommand(cmd, repoDir);
  
    cmd = util.format('ssh lanaci@%s docker kill %s', host, repository);
    yield processCommand(cmd, repoDir);
  
    cmd = util.format('ssh lanaci@%s docker run -d --name %s %s', host, repository, repository);
    yield processCommand(cmd, repoDir);
  }
  catch (err) {
    yield handleError(logFile, err.message || err);
  }
};

var addRepository = exports.addRepository = function*(repository, branches, host, provider, url, preCommands, processCommand) {
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

  var homeDir = path.join(__dirname, '..');
  var repoDir = path.join(homeDir, 'repos', repository);
  var cmd = util.format('git clone %s %s', url, repoDir);

  try {
    yield processCommand(cmd, repoDir);
  }
  catch (err) {
    if (err.message !== util.format("fatal: destination path '%s' already exists and is not an empty directory", repoDir)) {
      throw err;
    }
  }
  
  for (var i = 0; i < branches.length; i++) {
    var branch = branches[i];
    var logDir = path.join(homeDir, 'logs', repository, branch);

    cmd = util.format('mkdir -p %s', logDir);
    
    yield processCommand(cmd, homeDir);

    cmd = util.format('git checkout --track origin/%s', branch);
    yield processCommand(cmd, repoDir);
  }
};
