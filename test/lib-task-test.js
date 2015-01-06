var co_mocha = require('co-mocha')
  , expect   = require('chai').expect
  , path     = require('path')
  , task     = require(__dirname + '/../lib/task')
  , util     = require('util')
  ;

describe('lib/task', function() {
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
          'elzair/protolib'
        , 'test'
        , {
              host: 'example.com'
            , pre_commands: ["npm test"] 
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
        , 'ssh lanaci@example.com docker run -d --name elzair/protolib elzair/protolib'
      ]);
    });

    it('should throw an error on an invalid host', function*() {
      var combo = [
          'elzair/protolib'
        , 'test'
        , {
              testCommands: ['npm test']
          }
      ]; 
      var throwsErr = false;

      try {
        yield task.integrate(combo, processCommand, handleError);
      }
      catch (err) {
        throwsErr = true;
        expect(err).to.equal('Invalid host:  with project elzair/protolib and branch test');
      }
      finally {
        expect(throwsErr).to.equal(true);
      }
    });
  });

  describe('addRepository', function() {
    var log, processCommand;

    beforeEach(function*() {
      log = [];
      processCommand = function*(cmd, cwd) {
        log.push(cmd);
      };
    });
    
    it('should add a repository', function*() {
      yield task.addRepository('elzair/protolib', ['test'], 'example.com', 'github', '', ['npm test'], processCommand);
    });

    it('should throw an error on an invalid repository', function*() {
      var throwsErr = false;

      try {
        yield task.addRepository('', ['test'], 'example.com', 'github', '', ['npm test'], processCommand);
      }
      catch (err) {
        throwsErr = true;
        expect(err).to.equal('No repository specified!');
      }
      finally {
        expect(throwsErr).to.equal(true);
      }
    });

    it('should throw an error on an unsupported provider', function*() {
      var throwsErr = false;

      try {
        yield task.addRepository('elzair/protolib', ['test'], 'example.com', 'sourceforge', '', ['npm test'], processCommand);
      }
      catch (err) {
        throwsErr = true;
        expect(err).to.equal('Invalid provider: sourceforge');
      }
      finally {
        expect(throwsErr).to.equal(true);
      }
    });
  });
});
