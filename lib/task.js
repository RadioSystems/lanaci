var fs     = require('co-fs')
  , misc   = require(__dirname + '/misc')
  , path   = require('path')
  , ramble = require('ramble-on')
  , util   = require('util')
  ;

var integrate = exports.integrate = function*(combo, processCommand, handleError) {
  processCommand = processCommand || misc.processCommand;
  handleError = handleError || fs.writeFile; 
  
  var provider = combo[0];
  var repository = combo[1];
  var branch = combo[2];
  var hosts = combo[3].hosts || {};
  var preCommands = combo[3].pre_commands || ['npm test'];
  var result = '', cmd = '';
  var homeDir = path.normalize(path.join(__dirname, '..'));
  var repoDir = path.join(homeDir, 'repos', provider, repository);
  var logFile = path.join(homeDir, 'logs', provider, repository, branch, Date.now().toString());

  try {
    if (Object.keys(hosts).length === 0) {
      throw util.format('You must specify hosts for %s %s', repository, branch);
    }
  
    cmd = '/usr/bin/env git fetch origin';
    yield processCommand(cmd, repoDir);
    
    cmd = util.format('/usr/bin/env git checkout %s', branch);
    yield processCommand(cmd, repoDir);
    
    cmd = util.format('/usr/bin/env git merge origin/%s -X theirs', branch);
    yield processCommand(cmd, repoDir); 
  
    for (var i = 0; i < preCommands.length; i++) {
      cmd = preCommands[i];
      yield processCommand(cmd, repoDir);
    }
  
    cmd = util.format('/usr/bin/env docker build -t=%s .', repository);
    yield processCommand(cmd, repoDir);
  
    var localImgDir = path.join(homeDir, 'local-images');
    var imgFile = util.format('%s.tar', repository.replace(/\//g, '_'));
    cmd = util.format('/usr/bin/env docker save -o %s/%s %s', localImgDir, imgFile, repository);
    yield processCommand(cmd, repoDir);
  
    for (var host in hosts) {
      if (hosts.hasOwnProperty(host)) {
        var remoteImgDir = path.join(homeDir, 'remote-images');
        var options = hosts[host];

        cmd = util.format('scp %s/%s lanaci@%s:%s/%s', localImgDir, imgFile, host, remoteImgDir, imgFile);
        yield processCommand(cmd, repoDir);
  
        cmd = util.format('ssh lanaci@%s docker load -i %s/%s', host, remoteImgDir, imgFile);
        yield processCommand(cmd, repoDir);
  
        cmd = util.format('ssh lanaci@%s docker kill %s', host, repository);
        yield processCommand(cmd, repoDir);
  
        cmd = util.format('ssh lanaci@%s docker run -d %s --name %s %s', host, options, repository, repository);
        yield processCommand(cmd, repoDir);
      }
    }
  }
  catch (err) {
    yield handleError(logFile, err.message || err);
  }
};

var addProject = exports.addProject = function*(provider, repository, branch, host, options, preCommands, url, processCommand, confFile) {
  processCommand = processCommand || misc.processCommand;
  confFile = confFile || 'repos.toml';
  console.log(provider);

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

  if (!repository) {
    throw 'No repository specified';
  }
  if (!branch) {
    throw 'No branch specified';
  }

  // Ensure the options param has a corresponding host param
  if (options && !host) {
    throw "Must specify host alongside options";
  }

  var homeDir = path.join(__dirname, '..');
  var repoDir = path.join(homeDir, 'repos', provider, repository);

  // Create project repository if non-existent
  var cmd = util.format('/usr/bin/env git clone %s %s', url, repoDir);

  try {
    yield processCommand(cmd, repoDir);
  }
  catch (err) {
    if (err.message !== util.format("fatal: destination path '%s' already exists and is not an empty directory.", repoDir)) {
      throw err;
    }
  }
  
  // Create log directory if non-existent
  var logDir = path.join(homeDir, 'logs', provider, repository, branch);

  cmd = util.format('mkdir -p %s', logDir);
  
  yield processCommand(cmd, homeDir);

  // Create local branch if non-existent
  cmd = util.format('/usr/bin/env git checkout --track origin/%s', branch);

  try {
    yield processCommand(cmd, repoDir);
  }
  catch (err) {
    if (err.message !== util.format("fatal: A branch named '%s' already exists.", branch)) {
      throw err;
    }
  }

  // Add new repo/branch to config file
  var conf = yield misc.readConf(confFile);
  var confProps = ['providers', provider, repository, branch];
  var project = {};

  try { // Project already exists in config file
    project = ramble(conf, confProps);

    if (host) {
      project.hosts[host] = options;
    }

    project.pre_commands = preCommands ? preCommands : project.pre_commands;
  }
  catch (err) { // New project
    project = {
        hosts: {}
      , pre_commands: preCommands
    };

    if (host) {
      project.hosts[host] = options;
    }
  }

  ramble(conf, confProps, project, true);

  yield misc.writeConf(confFile, conf);
};

var addRemote = exports.addRemote = function*(user, host, processCommand) {
  processCommand = processCommand || misc.processCommand;

  if (!user) {
    throw "Invalid user";
  }
  if (!host) {
    throw "Invalid host";
  }

  var hostString = util.format('%s@%s', user, host);

  var cmd = util.format('ssh %s "sudo useradd -m -s /bin/false -d /home/lanaci lanaci"', hostString);
  
  yield processCommand(cmd, '/tmp');

  cmd = util.format('ssh %s "sudo gpasswd -a lanaci docker"', hostString);
  
  yield processCommand(cmd, '/tmp');

  cmd = util.format('ssh %s "sudo service docker restart"', hostString);
  
  yield processCommand(cmd, '/tmp');

  cmd = util.format('ssh %s "sudo -u lanaci mkdir -p /home/lanaci/.ssh"', hostString);
  
  yield processCommand(cmd, '/tmp');

  cmd = util.format('ssh %s "sudo -u lanaci chmod 700 /home/lanaci/.ssh"', hostString);
  
  yield processCommand(cmd, '/tmp');

  var sshPath = path.join(__dirname, '..', 'conf', '.ssh', 'id_rsa.pub');
  cmd = util.format('scp %s %s:%s', sshPath, hostString, '/tmp/id_rsa.pub');
  
  yield processCommand(cmd, '/tmp');

  cmd = util.format('ssh %s "sudo chown lanaci /tmp/id_rsa.pub"', hostString);
  
  yield processCommand(cmd, '/tmp');

  cmd = util.format('ssh %s "sudo -u lanaci cat /tmp/id_rsa.pub >> /home/lanaci/.ssh/authorized_keys"', hostString);
  
  yield processCommand(cmd, '/tmp');

  cmd = util.format('ssh %s "sudo -u lanaci rm /tmp/id_rsa.pub"', hostString);
  
  yield processCommand(cmd, '/tmp');
};
