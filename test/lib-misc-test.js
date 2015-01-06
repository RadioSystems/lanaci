var co_mocha = require('co-mocha')
  , expect   = require('chai').expect
  , fs       = require('co-fs')
  , misc     = require(__dirname + '/../lib/misc')
  , util     = require('util')
  ;

describe('lib/misc', function() {
  describe('readConf', function() {
    it('should read the file and return an object with its contents', function*() {
      var repos = yield misc.readConf('repos.json.template');
      expect(repos).to.be.an('object');
      expect(repos).to.deep.equal({
          "version": "0.0.1"
        , "providers": {
              "bitbucket": {
                "repo/path": {
                    "branch": {
                        "host": "branch.example.com"
                      , "test_commands": [
                          "npm test"
                        ]
                    }
                  , "other_branch": {
                        "host": "other.branch.example.com"
                      , "test_commands": [
                          "npm test"
                        ]
                    }
                }
              }
            , "github": {
                "github/repo": {
                    "another_branch": {
                        "host": "another.branch.example.com"
                      , "test_commands": [
                          "lein test"
                        ]
                    }
                  , "yet_another_branch": {
                        "host": "yet.another.branch.example.com"
                      , "test_commands": [
                          "lein test"
                        ]
                    }
                }
              } 
          }
      });
    });
  });

  describe('isIn', function() {
    it('should return true when the element is already present in the array', function() {
      var arr = [
          ['test/me', 'master']
        , ['petsafesoftwareteam/rscswitchboard', 'master']
        , ['petsafesoftwareteam/rscswitchboard', 'test']
      ];
      var el = ['petsafesoftwareteam/rscswitchboard', 'test'];

      expect(misc.isIn(arr, el)).to.equal(true);
    });

    it('should return false when no array element matches the element', function() {
      var arr = [
        ['test/me', 'master']
        , ['another/rscswitchboard', 'test']
        , ['petsafesoftwareteam/rscswitchboard', 'master']
      ];
      var el = ['petsafesoftwareteam/rscswitchboard', 'test'];
      
      expect(misc.isIn(arr, el)).to.equal(false);
    });

    it('should match case', function() {
      var arr = [
          ['test/me', 'master']
        , ['petsafesoftwareteam/rscswitchboard', 'master']
        , ['petsafesoftwareteam/rscswitchboard', 'TEST']
      ];
      var el = ['petsafesoftwareteam/rscswitchboard', 'test'];
      
      expect(misc.isIn(arr, el)).to.equal(false);
    });
  });

  describe('max', function() {
    it('should return the greatest string in the set', function() {
      var arr = ['0123', '9879', '6705', '8294'];
      var m = misc.max(arr);

      expect(m).to.equal('9879');
    });
  });

  describe('processCommand', function () {
    it('should process the command', function*() {
      var exec = function* (cmd, opts) {
        return {stdout: cmd, error: null, stderr: ''};
      };

      var result = yield misc.processCommand('ls -al .', __dirname, exec);

      expect(result).to.equal('ls -al .');
    });

    it('should write error.message to the error file', function*() {
      var exec = function* (cmd, opts) {
        return {stdout: cmd, err: {message: 'Write this'}, stderr: ''};
      };
      var throwsErr = false;

      try {
        yield misc.processCommand('ls -al .', '/tmp', exec);
      }
      catch (err) {
        throwsErr = true;
        expect(err.message).to.equal('Write this');
      }
      finally {
        expect(throwsErr).to.equal(true);
      }
    });

    it('should write stderr to the error file', function*() {
      var exec = function* (cmd, opts) {
        return {stdout: cmd, err: null, stderr: 'Write this too'};
      };
      var throwsStdErr = false;

      try {
        yield misc.processCommand('ls -al .', '/tmp', exec);
      }
      catch (err) {
        expect(err.message).to.equal('Write this too');
        throwsStdErr = true;
      }
      finally {
        expect(throwsStdErr).to.equal(true);
      }
    });
  });
});
