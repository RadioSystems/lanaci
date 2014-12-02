describe('lib/hooks', function() {
  describe('bitbucket', function() {
    it('should return the combos on a valid request', function() {
      var validRequest = {
        "canon_url": "https://bitbucket.org",
        "commits": [
          {
            "author": "bubba",
            "branch": "test",
            "files": [
              {
                "file": "somefile.py",
                "type": "modified"
              }
            ],
            "message": "Added some more things to somefile.py\n",
            "node": "620ade18607a",
            "parents": [
              "702c70160afc"
            ],
            "raw_author": "Bubba Earl <bubba@earl.com>",
            "raw_node": "620ade18607ac42d872b568bb92acaa9a28620e9",
            "revision": null,
            "size": -1,
            "timestamp": "2012-05-30 05:58:56",
            "utctimestamp": "2012-05-30 03:58:56+00:00"
          }
        ],
        "repository": {
          "absolute_url": "/bubba/project-x/",
          "fork": false,
          "is_private": true,
          "name": "Project X",
          "owner": "marcus",
          "scm": "git",
          "slug": "project-x",
          "website": "https://atlassian.com/"
        },
        "user": "marcus"
      };

      
    });
  });
});
