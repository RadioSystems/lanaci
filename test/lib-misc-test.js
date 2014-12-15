var co_mocha = require('co-mocha')
  , expect   = require('chai').expect
  , fs       = require('co-fs')
  , misc     = require(__dirname + '/../lib/misc')
  ;

describe('lib/misc', function() {
  describe('readConf', function() {
    it('should read the file and return an object with its contents', function*() {
      var repos = yield misc.readConf('repos.json.template');
      expect(repos).to.be.an('object');
      expect(repos).to.deep.equal({
          "bitbucket": {
            "repo/path": {
                "branch": {
                    "test": true
                  , "host": "branch.example.com"
                  , "language": "nodejs"
                }
              , "other_branch": {
                    "test": false
                  , "host": "other.branch.example.com"
                  , "language": "go"
                }
            }
          }
        , "github": {
            "github/repo": {
                "another_branch": {
                    "test": true
                  , "host": "another.branch.example.com"
                  , "language": "clojure"
                }
              , "yet_another_branch": {
                    "test": false
                  , "host": "yet.another.branch.example.com"
                  , "language": "ruby"
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

      yield misc.processCommand('ls -al .', '/tmp', '/tmp/test', exec);
      var exists = yield fs.exists('/tmp/test');

      expect(exists).to.equal(false);
    });

    it('should write error.message to the error file', function*() {
      var exec = function* (cmd, opts) {
        return {stdout: cmd, err: {message: 'Write this'}, stderr: ''};
      };
      var throwsErr = false;

      try {
        yield misc.processCommand('ls -al .', '/tmp', '/tmp/test', exec);
      }
      catch (err) {
        expect(err.message).to.equal('Write this');
        throwsErr = true;
        var exists = yield fs.exists('/tmp/test');
        expect(exists).to.equal(true);
        var contents = yield fs.readFile('/tmp/test', 'utf8');
        expect(contents).to.equal('Write this');
        yield fs.unlink('/tmp/test');
      }
      finally {
        expect(throwsErr).to.equal(true);
      }

    });
  });
});
