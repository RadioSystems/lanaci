var co_mocha = require('co-mocha')
  , expect   = require('chai').expect
  , task     = require(__dirname + '/../lib/task')
  ;

describe('lib/task', function() {
  describe('integrate', function() {
    it('should process a valid combination', function*() {
      var log = [];
      var processCommand = function*(cmd, cwd, logFile) {
        log.push(cmd);
      };
      var combo = [
          'elzair/protolib'
        , 'test'
        , {
              test: true
            , host: 'example.com'
            , language: 'nodejs'
          }
      ];

      yield task.integrate(combo, processCommand, false);

      expect(log).to.deep.equal([
          'git fetch origin'
        , 'git checkout test'
        , 'git merge origin/test -X theirs'
        , 'npm test'
        , 'docker build -t=elzair/protolib .'
        , 'docker save -o /home/lana/local-images/elzair_protolib.tar elzair/protolib'
        , 'scp /home/lana/local-images/elzair_protolib.tar lana@example.com:/home/lana/remote-images/elzair_protolib.tar'
        , 'ssh lana@example.com docker load -i /home/lana/remote-images/elzair_protolib.tar'
        , 'ssh lana@example.com docker kill elzair/protolib'
        , 'ssh lana@example.com docker run -d --name elzair/protolib elzair/protolib'
      ]);
    });

    it('should throw an error on an invalid host', function*() {
      var log = [];
      var processCommand = function*(cmd, cwd, logFile) {
        log.push(cmd);
      };
      var combo = [
          'elzair/protolib'
        , 'test'
        , {
              test: true
            , language: 'nodejs'
          }
      ]; 
      var throwsErr = false;

      try {
        yield task.integrate(combo, processCommand, false);
      }
      catch (err) {
        throwsErr = true;
        expect(err).to.equal('Invalid host:  with project elzair/protolib');
      }
      finally {
        expect(throwsErr).to.equal(true);
      }
    });
 
    it('should throw an error on an invalid language', function*() {
      var log = [];
      var processCommand = function*(cmd, cwd, logFile) {
        log.push(cmd);
      };
      var combo = [
          'elzair/protolib'
        , 'test'
        , {
              test: true
            , host: 'example.com'
            , language: 'no-lang'
          }
      ]; 
      var throwsErr = false;

      try {
        yield task.integrate(combo, processCommand, false);
      }
      catch (err) {
        throwsErr = true;
        expect(err).to.equal('Invalid language: no-lang');
      }
      finally {
        expect(throwsErr).to.equal(true);
      }
    });
 });

  describe('addRepository', function() {
    it('should add a repository', function*() {
      var log = [];
      var processCommand = function*(cmd, cwd, logFile) {
        log.push(cmd);
      }; 

      yield task.addRepository('elzair/protolib', ['test'], 'example.com', 'nodejs', 'github', true, '', processCommand);
      console.log(log);
    });

    it('should throw an error on an invalid repository', function*() {
      var log = [];
      var processCommand = function*(cmd, cwd, logFile) {
        log.push(cmd);
      }; 
      var throwsErr = false;

      try {
        yield task.addRepository('', ['test'], 'example.com', 'nodejs', 'github', true, '', processCommand);
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
      var log = [];
      var processCommand = function*(cmd, cwd, logFile) {
        log.push(cmd);
      }; 
      var throwsErr = false;

      try {
        yield task.addRepository('elzair/protolib', ['test'], 'example.com', 'nodejs', 'sourceforge', true, '', processCommand);
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
