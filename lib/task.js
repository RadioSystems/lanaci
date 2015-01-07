var fs     = require('co-fs')
  , misc   = require(__dirname + '/misc')
  , path   = require('path')
  , ramble = require('ramble-on')
  , util   = require('util')
  ;

var integrate = exports.integrate = function*(combo, processCommand, handleError) {
  processCommand = processCommand || misc.processCommand;
  handleError = handleError || fs.writeFile; 
  
  var repository = combo[0];
  var branch = combo[1];
  var hosts = combo[2].hosts || [];
  var preCommands = combo[2].pre_commands || ['npm test'];
  var result = '', cmd = '';
  var homeDir = path.normalize(path.join(__dirname, '..'));
  var repoDir = path.join(homeDir, 'repos', repository);
  var logFile = path.join(homeDir, 'logs', repository, branch, Date.now().toString());

  try {
    if (hosts.length === 0) {
      throw util.format('You must specify a list of hosts for %s %s', repository, branch);
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
  
    for (var j = 0; j < hosts.length; j++) {
      var host = hosts[j];
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
  }
  catch (err) {
    yield handleError(logFile, err.message || err);
  }
};

var addRepository = exports.addRepository = function*(repository, branch, hosts, provider, url, preCommands, processCommand, confFile) {
  processCommand = processCommand || misc.processCommand;
  confFile = confFile || 'repos.toml';
 
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
  
  var logDir = path.join(homeDir, 'logs', repository, branch);

  cmd = util.format('mkdir -p %s', logDir);
  
  yield processCommand(cmd, homeDir);

  cmd = util.format('git checkout --track origin/%s', branch);

  yield processCommand(cmd, repoDir);

  // Add new repo/branch to config file
  var conf = yield misc.readConf(confFile);
  ramble(conf, ['providers', provider, repository, branch], {
      hosts: hosts
    , pre_commands: preCommands
  }, true);
  
  yield misc.writeConf(confFile, conf);
};

var addRemote = exports.addRemote = function*(user, host, port, processCommand) {
  processCommand = processCommand || misc.processCommand;

  var hostString1 = util.format('-p %s %s@%s', port, user, host);

  var cmd = util.format('ssh %s "sudo useradd -m -s /bin/false -d /home/lanaci lanaci"', hostString1);
  
  yield processCommand(cmd, '/tmp');

  cmd = util.format('ssh %s "sudo gpasswd -a lanaci docker"', hostString1);
  
  yield processCommand(cmd, '/tmp');

  cmd = util.format('ssh %s "sudo service docker restart"', hostString1);
  
  yield processCommand(cmd, '/tmp');

  cmd = util.format('ssh %s "sudo -u lanaci mkdir -p /home/lanaci/.ssh"', hostString1);
  
  yield processCommand(cmd, '/tmp');

  cmd = util.format('ssh %s "sudo -u lanaci chmod 700 /home/lanaci/.ssh"', hostString1);
  
  yield processCommand(cmd, '/tmp');

  var sshPath = path.join(__dirname, '..', 'conf', '.ssh', 'id_rsa.pub');
  var hostString2 = util.format('-P %s %s@%s', port, user, host);
  cmd = util.format('scp %s %s:%s', sshPath, hostString2, '/tmp/id_rsa.pub');
  
  yield processCommand(cmd, '/tmp');

  cmd = util.format('ssh %s "sudo chown lanaci /tmp/id_rsa.pub"', hostString1);
  
  yield processCommand(cmd, '/tmp');

  cmd = util.format('ssh %s "sudo -u lanaci cat /tmp/id_rsa.pub >> /home/lanaci/.ssh/authorized_keys"', hostString1);
  
  yield processCommand(cmd, '/tmp');

  cmd = util.format('ssh %s "sudo -u lanaci rm /tmp/id_rsa.pub"', hostString1);
  
  yield processCommand(cmd, '/tmp');
};
