var fs   = require('co-fs')
  , misc = require(__dirname + '/misc')
  , path = require('path')
  , util = require('util')
  ;

var task = exports.task = function*(combo, exec) {
  exec = exec || require('exec-co');
  
  try {
    var repo = combo[0];
    var branch = combo[1];
    var test = combo[2].test || false;
    var host = combo[2].host || '';
    var language = combo[2].language || 'nodejs';
  
    if (!host) {
      throw util.format('Invalid host %s with project %s', host, repo);
    }
  
    var result = '', cmd = '';
    var repoDir = util.format('/home/lana/repos/%s/', repo);
    var logFile = util.format('/home/lana/logs/%s/%d', repo, Date.now());
  
    cmd = 'git fetch origin';
    yield misc.processCommand(cmd, repoDir, logFile, exec);
    
    cmd = util.format('git checkout %s', branch);
    yield misc.processCommand(cmd, repoDir, logFile, exec);
    
    cmd = util.format('git merge origin/%s -X theirs', branch);
    yield misc.processCommand(cmd, repoDir, logFile, exec);
  
    var testPath = path.join(__dirname, '..', 'conf', 'test.json');
    var tests = JSON.parse(yield fs.readFile(testPath));
    if (!tests.hasOwnProperty(language)) {
      throw util.format('Invalid language: %s', language);
    }
    cmd = tests[language];
    yield misc.processCommand(cmd, repoDir, logFile, exec);
  
    cmd = util.format('docker build -t=%s .', repo);
    yield misc.processCommand(cmd, repoDir, logFile, exec);
  
    var localImgDir = '/home/lana/local-images/';
    var imgFile = util.format('%s.tar', repo.replace(/\//g, '_'));
    cmd = util.format('docker save -o %s%s %s', localImgDir, imgFile, repo);
    yield misc.processCommand(cmd, repoDir, logFile, exec);

    var remoteImgDir = '/home/lana/remote-images/';
    cmd = util.format('scp %s%s %s:%s%s', localImgDir, imgFile, host, remoteImgDir, imgFile);
    yield misc.processCommand(cmd, repoDir, logFile, exec);

    cmd = util.format('ssh %s docker load -i %s%s', host, remoteImgDir, imgFile);
    yield misc.processCommand(cmd, repoDir, logFile);

    cmd = util.format('ssh %s docker kill %s', host, repo);
    yield misc.processCommand(cmd, repoDir, logFile, exec);

    cmd = util.format('ssh %s docker run -d --name %s %s', host, repo, repo);
    yield misc.processCommand(cmd, repoDir, logFile, exec);

    yield fs.writeFile(logFile, ''); // Write empty file on success
  }  
  catch (err) {
    console.error(err);
  }
};
