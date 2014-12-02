var expect = require('chai').expect
  , misc = require(__dirname + '/../lib/misc')
  ;

describe('lib/misc', function() {
  describe('readConf', function() {
    it('should read the file and return an object with its contents', function() {
      var repos = misc.readConf('repos.json.template');

      expect(repos).to.be.an('object');
      expect(repos).to.have.property('/repo/path/');
      expect(repos['/repo/path/']).to.be.an('object');
      expect(repos).to.have.deep.property('/repo/path/.branch');
      expect(repos['/repo/path/'].branch).to.be.an('object');
      expect(repos).to.have.deep.property('/repo/path/.branch.dir', '/local/path');
      expect(repos).to.have.deep.property('/repo/path/.branch.test', true);
    });
  });

  describe('isIn', function() {
    it('should return true when the element is already present in the array', function() {
      var arr = [
        ['/test/me', 'master']
        , ['/petsafesoftwareteam/rscswitchboard', 'master']
        , ['/petsafesoftwareteam/rscswitchboard', 'test']
      ];
      var el = ['/petsafesoftwareteam/rscswitchboard', 'test'];

      expect(misc.isIn(arr, el)).to.equal(true);
    });

    it('should return false when no array element matches the element', function() {
      var arr = [
        ['/test/me', 'master']
        , ['/another/rscswitchboard', 'test']
        , ['/petsafesoftwareteam/rscswitchboard', 'master']
      ];
      var el = ['/petsafesoftwareteam/rscswitchboard', 'test'];
      
      expect(misc.isIn(arr, el)).to.equal(false);
    });

    it('should match case', function() {
      var arr = [
        ['/test/me', 'master']
        , ['/petsafesoftwareteam/rscswitchboard', 'master']
        , ['/petsafesoftwareteam/rscswitchboard', 'TEST']
      ];
      var el = ['/petsafesoftwareteam/rscswitchboard', 'test'];
      
      expect(misc.isIn(arr, el)).to.equal(false);
    });
  });
});
