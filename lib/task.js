var fs   = require('co-fs')
  , misc = require(__dirname + '/misc')
  , path = require('path')
  , util = require('util')
  ;

var task = exports.task = function*(combo, processCommand, dontWriteLogOnSuccess) {
  processCommand = processCommand || misc.processCommand;
  dontWriteLogOnSuccess = dontWriteLogOnSuccess || false;
  
  try {
    var repo = combo[0];
    var branch = combo[1];
    var test = combo[2].test || false;
    var host = combo[2].host || '';
    var language = combo[2].language || 'nodejs';
  
    if (!host) {
      throw util.format('Invalid host %s with project %s', host, repo);
    }

    processCommand('ls -al .', '/tmp', '/dev/stderr');
  
    var result = '', cmd = '';
    var repoDir = util.format('/home/lana/repos/%s/', repo);
    var logFile = util.format('/home/lana/logs/%s/%d', repo, Date.now());
  
    cmd = 'git fetch origin';
    yield processCommand(cmd, repoDir, logFile);
    
    cmd = util.format('git checkout %s', branch);
    yield processCommand(cmd, repoDir, logFile);
    
    cmd = util.format('git merge origin/%s -X theirs', branch);
    yield processCommand(cmd, repoDir, logFile);
  
    var testPath = path.join(__dirname, '..', 'conf', 'test.json');
    var tests = JSON.parse(yield fs.readFile(testPath));
    if (!tests.hasOwnProperty(language)) {
      throw util.format('Invalid language: %s', language);
    }
    cmd = tests[language];
    yield processCommand(cmd, repoDir, logFile);
  
    cmd = util.format('docker build -t=%s .', repo);
    yield processCommand(cmd, repoDir, logFile);
  
    var localImgDir = '/home/lana/local-images/';
    var imgFile = util.format('%s.tar', repo.replace(/\//g, '_'));
    cmd = util.format('docker save -o %s%s %s', localImgDir, imgFile, repo);
    yield processCommand(cmd, repoDir, logFile);

    var remoteImgDir = '/home/lana/remote-images/';
    cmd = util.format('scp %s%s lana@%s:%s%s', localImgDir, imgFile, host, remoteImgDir, imgFile);
    yield processCommand(cmd, repoDir, logFile);

    cmd = util.format('ssh lana@%s docker load -i %s%s', host, remoteImgDir, imgFile);
    yield processCommand(cmd, repoDir, logFile);

    cmd = util.format('ssh lana@%s docker kill %s', host, repo);
    yield processCommand(cmd, repoDir, logFile);

    cmd = util.format('ssh lana@%s docker run -d --name %s %s', host, repo, repo);
    yield processCommand(cmd, repoDir, logFile);

    if (dontWriteLogOnSuccess) {
      yield fs.writeFile(logFile, ''); // Write empty file on success
    }
  }  
  catch (err) {
    return err;
  }
};
