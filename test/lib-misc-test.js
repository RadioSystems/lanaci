var co_mocha = require('co-mocha')
  , expect   = require('chai').expect
  , fs       = require('co-fs')
  , misc     = require(__dirname + '/../lib/misc')
  , path     = require('path')
  , util     = require('util')
  ;

describe('lib/misc', function() {
  describe('readConf', function() {
    it('should read the file and return an object with its contents', function*() {
      var confPath = path.join(__dirname, '..', 'conf', 'repos.toml.template');
      var repos = yield misc.readConf(confPath);
      expect(repos).to.be.an('object');
      expect(repos).to.deep.equal({
          "version": "0.0.1"
        , "providers": {
              "bitbucket": {
                "repo/path": {
                    "branch": {
                        "hosts": {
                          "branch.example.com": "-v /host:/container"
                        }
                      , "pre_commands": [
                          "npm test"
                        ]
                    }
                  , "other_branch": {
                        "hosts": {
                          "other.branch.example.com": "-p 4000:4000"
                        }
                      , "pre_commands": [
                          "lein test"
                        ]
                    }
                }
              }
            , "github": {
                "github/repo": {
                    "another_branch": {
                        "hosts": {
                          "another.branch.example.com": "-v /host2:/container -p 4001:4001"
                        }
                      , "pre_commands": [
                          "go test"
                        ]
                    }
                  , "yet_another_branch": {
                        "hosts": {
                          "yet.another.branch.example.com": ""
                        }
                      , "pre_commands": [
                          "some other command"
                        ]
                    }
                }
              } 
          }
      });
    });
  });

  describe('writeConf', function() {
    it('should write the config file', function*() {
      var test = {
          "version": "0.0.1"
        , "providers": {
            "github": {
              "elzair/protolib": {
                "master": {
                    "hosts": {
                      "protolib.example.com": "-p 4000:4000"
                    }
                  , "pre_commands": [
                      "npm test"
                    ]
                }
              }
            } 
          }
      };

      var confPath = path.join(__dirname, 'data', 'misc-writeConf-1.toml');
      yield misc.writeConf(confPath, test);

      var contents = yield misc.readConf(confPath);

      expect(contents).to.deep.equal(test);
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
