var expect = require('chai').expect
  , misc = require(__dirname + '/../lib/misc')
  ;

describe('lib/misc', function() {
  describe('readConf', function() {
    it('should read the file and return an object with its contents', function() {
      var repos = misc.readConf('repos.json.template');
      expect(repos).to.be.an('object');
      expect(repos).to.deep.equal({
          "bitbucket": {
            "repo/path": {
                "branch": {
                    "test": true
                  , "host": "branch.example.com"
                }
              , "other_branch": {
                    "test": false
                  , "host": "other.branch.example.com"
                }
            }
          }
        , "github": {
            "github/repo": {
                "another_branch": {
                    "test": true
                  , "host": "another.branch.example.com"
                }
              , "yet_another_branch": {
                    "test": false
                  , "host": "yet.another.branch.example.com"
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
});
