var co_mocha = require('co-mocha')
  , expect   = require('chai').expect
  , task     = require(__dirname + '/../lib/task')
  ;

describe('lib/task', function() {
  describe('task', function() {
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

      yield task.task(combo, processCommand, false);

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
  });
});
