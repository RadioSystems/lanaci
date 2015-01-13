var co_mocha = require('co-mocha')
  , expect   = require('chai').expect
  , fs       = require('co-fs')
  , misc     = require(__dirname + '/../lib/misc')
  , path     = require('path')
  , task     = require(__dirname + '/../lib/task')
  , toml     = require('toml')
  , util     = require('util')
  ;

describe('lib/task', function() {
  var dataPath = path.join(__dirname, 'data');

  describe('integrate', function() {
    var log, processCommand, handleError;

    beforeEach(function*() {
      log = [];
      processCommand = function*(cmd, cwd) {
        log.push(cmd);
      };
      handleError = function* (logFile, contents) {
        throw contents;
      };
    });
    
    it('should process a valid combination', function*() {
      var combo = [
          'github'
        , 'elzair/protolib'
        , 'test'
        , {
              'hosts': {
                'example.com': '-v /host:/container'
              }
            , 'pre_commands': ["npm test"] 
          }
      ];

      yield task.integrate(combo, processCommand, handleError);

      var homeDir = path.normalize(path.join(__dirname, '..'));
      expect(log).to.deep.equal([
          'git fetch origin'
        , 'git checkout test'
        , 'git merge origin/test -X theirs'
        , 'npm test'
        , 'docker build -t=elzair/protolib .'
        , 'docker save -o '+homeDir+'/local-images/elzair_protolib.tar elzair/protolib'
        , 'scp '+homeDir+'/local-images/elzair_protolib.tar lanaci@example.com:'+homeDir+'/remote-images/elzair_protolib.tar'
        , 'ssh lanaci@example.com docker load -i '+homeDir+'/remote-images/elzair_protolib.tar'
        , 'ssh lanaci@example.com docker kill elzair/protolib'
        , 'ssh lanaci@example.com docker run -d -v /host:/container --name elzair/protolib elzair/protolib'
      ]);
    });

    it('should throw an error when no hosts are specified', function*() {
      var combo = [
          'github'
        , 'elzair/protolib'
        , 'test'
        , {
              'hosts': {
              }
            , 'pre_commands': ['npm test']
          }
      ]; 
      var throwsErr = false;

      try {
        yield task.integrate(combo, processCommand, handleError);
      }
      catch (err) {
        throwsErr = true;
        expect(err).to.equal('You must specify hosts for elzair/protolib test');
      }
      finally {
        expect(throwsErr).to.equal(true);
      }
    });
  });

  describe('addProject', function() {
    var log, processCommand;

    beforeEach(function*() {
      log = [];
      processCommand = function*(cmd, cwd) {
        log.push(cmd);
      };
    });
    
    it('should add a repository', function*() {
      var input  = path.join(dataPath, 'task-addProject-input-1.toml');
      var output  = path.join(dataPath, 'task-addProject-output-1.toml');
      var backup = yield misc.readConf(input);

      yield task.addProject('github', 'elzair/protolib', 'test', 'example.com', '-p 4000:4000', ['npm test'], '', processCommand, input);

      var projectPath = path.join(__dirname, '..');

      expect(log).to.deep.equal([
          'git clone git@github.com:elzair/protolib.git '+projectPath+'/repos/github/elzair/protolib'
        , 'mkdir -p '+projectPath+'/logs/github/elzair/protolib/test'
        , 'git checkout --track origin/test'
      ]);

      var contents = yield misc.readConf(input);
      var testContents = yield misc.readConf(output);

      expect(contents).to.deep.equal(testContents);

      yield misc.writeConf(input, backup, dataPath); // Restore file
    });
   
    it('should add an additional host when one is specified', function*() {
      var input  = path.join(dataPath, 'task-addProject-input-2.toml');
      var output  = path.join(dataPath, 'task-addProject-output-2.toml');
      var backup = yield misc.readConf(input);

      yield task.addProject('bitbucket', 'elzair/project', 'master', 'another.example.com', '-v /host:/container', ['npm test'], '', processCommand, input);

      var projectPath = path.join(__dirname, '..');

      expect(log).to.deep.equal([
          'git clone git@bitbucket.org:elzair/project.git '+projectPath+'/repos/bitbucket/elzair/project'
        , 'mkdir -p '+projectPath+'/logs/bitbucket/elzair/project/master'
        , 'git checkout --track origin/master'
      ]);

      var contents = yield misc.readConf(input);
      var testContents = yield misc.readConf(output);

      expect(contents).to.deep.equal(testContents);

      yield misc.writeConf(input, backup, dataPath); // Restore file
    });
  
    it('should add an additional branch when one is specified', function*() {
      var input  = path.join(dataPath, 'task-addProject-input-3.toml');
      var output  = path.join(dataPath, 'task-addProject-output-3.toml');
      var backup = yield misc.readConf(input);

      yield task.addProject('bitbucket','elzair/project', 'dev', 'another-example.com', '-p 4000:4000', ['lein test'], '', processCommand, input);

      var projectPath = path.join(__dirname, '..');

      expect(log).to.deep.equal([
          'git clone git@bitbucket.org:elzair/project.git '+projectPath+'/repos/bitbucket/elzair/project'
        , 'mkdir -p '+projectPath+'/logs/bitbucket/elzair/project/dev'
        , 'git checkout --track origin/dev'
      ]);

      var contents = yield misc.readConf(input);
      var testContents = yield misc.readConf(output);

      expect(contents).to.deep.equal(testContents);

      yield misc.writeConf(input, backup, dataPath); // Restore file
    });
   
    it('should update the pre-commands of a project', function*() {
      var input  = path.join(dataPath, 'task-addProject-input-4.toml');
      var output  = path.join(dataPath, 'task-addProject-output-4.toml');
      var backup = yield misc.readConf(input);

      yield task.addProject('bitbucket', 'elzair/project', 'master', '', '', ['lein test'], '', processCommand, input);

      var projectPath = path.join(__dirname, '..');

      expect(log).to.deep.equal([
          'git clone git@bitbucket.org:elzair/project.git '+projectPath+'/repos/bitbucket/elzair/project'
        , 'mkdir -p '+projectPath+'/logs/bitbucket/elzair/project/master'
        , 'git checkout --track origin/master'
      ]);

      var contents = yield misc.readConf(input);
      var testContents = yield misc.readConf(output);

      expect(contents).to.deep.equal(testContents);

      yield misc.writeConf(input, backup, dataPath); // Restore file
    });
  
    it('should update the options of a project', function*() {
      var input  = path.join(dataPath, 'task-addProject-input-5.toml');
      var output  = path.join(dataPath, 'task-addProject-output-5.toml');
      var backup = yield misc.readConf(input);

      yield task.addProject('bitbucket', 'elzair/project', 'master', 'example.com', '-p 4000:4000', ['npm test'], '', processCommand, input);

      var projectPath = path.join(__dirname, '..');

      expect(log).to.deep.equal([
          'git clone git@bitbucket.org:elzair/project.git '+projectPath+'/repos/bitbucket/elzair/project'
        , 'mkdir -p '+projectPath+'/logs/bitbucket/elzair/project/master'
        , 'git checkout --track origin/master'
      ]);

      var contents = yield misc.readConf(input);
      var testContents = yield misc.readConf(output);

      expect(contents).to.deep.equal(testContents);

      yield misc.writeConf(input, backup, dataPath); // Restore file
    });

    it('should throw an error on an unsupported provider', function*() {
      var throwsErr = false;

      try {
        yield task.addProject('sourceforge', 'elzair/protolib', 'test', 'example.com', '-p 4000:4000', ['npm test'], processCommand);
      }
      catch (err) {
        throwsErr = true;
        expect(err).to.equal('Invalid provider: sourceforge');
      }
      finally {
        expect(throwsErr).to.equal(true);
      }
    });

    it('should throw an error on an invalid repository', function*() {
      var throwsErr = false;

      try {
        yield task.addProject('github', '', 'test', 'example.com', '-p 4000:4000', ['npm test'], '', processCommand);
      }
      catch (err) {
        throwsErr = true;
        expect(err).to.equal('No repository specified');
      }
      finally {
        expect(throwsErr).to.equal(true);
      }
    });

    it('should throw an error on an invalid branch', function*() {
      var throwsErr = false;

      try {
        yield task.addProject('github', 'elzair/protolib', '', 'example.com', '-p 4000:4000', ['npm test'], '', processCommand);
      }
      catch (err) {
        throwsErr = true;
        expect(err).to.equal('No branch specified');
      }
      finally {
        expect(throwsErr).to.equal(true);
      }
    });
  });

  describe('addRemote', function() {
    var log, processCommand;

    beforeEach(function*() {
      log = [];
      processCommand = function*(cmd, cwd) {
        log.push(cmd);
      };
    });

    it('should add a remote host', function*() {
      var sshPath = path.join(__dirname, '..', 'conf', '.ssh', 'id_rsa.pub');
      yield task.addRemote('elzair', '127.0.0.1', processCommand);

      expect(log).to.deep.equal([
          'ssh elzair@127.0.0.1 "sudo useradd -m -s /bin/false -d /home/lanaci lanaci"'
        , 'ssh elzair@127.0.0.1 "sudo gpasswd -a lanaci docker"'
        , 'ssh elzair@127.0.0.1 "sudo service docker restart"'
        , 'ssh elzair@127.0.0.1 "sudo -u lanaci mkdir -p /home/lanaci/.ssh"'
        , 'ssh elzair@127.0.0.1 "sudo -u lanaci chmod 700 /home/lanaci/.ssh"'
        , 'scp ' + sshPath + ' elzair@127.0.0.1:/tmp/id_rsa.pub'
        , 'ssh elzair@127.0.0.1 "sudo chown lanaci /tmp/id_rsa.pub"'
        , 'ssh elzair@127.0.0.1 "sudo -u lanaci cat /tmp/id_rsa.pub >> /home/lanaci/.ssh/authorized_keys"'
        , 'ssh elzair@127.0.0.1 "sudo -u lanaci rm /tmp/id_rsa.pub"'
      ]);
    });

    it('should throw an error on an invalid user', function*() {
      var throwsErr = false;
      try {
        yield task.addRemote('', '127.0.0.1', processCommand);
      }
      catch (err) {
        throwsErr = true;
        expect(err).to.equal('Invalid user'); 
      }
      finally {
        expect(throwsErr).to.equal(true);
      }
    });

    it('should throw an error on an invalid host', function*() {
      var throwsErr = false;
      try {
        yield task.addRemote('elzair', '', processCommand);
      }
      catch (err) {
        throwsErr = true;
        expect(err).to.equal('Invalid host'); 
      }
      finally {
        expect(throwsErr).to.equal(true);
      }
    });
  });
});
