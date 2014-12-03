var expect = require('chai').expect
  , hooks  = require(__dirname + '/../lib/hooks')
  ;

describe('lib/hooks', function() {
  describe('bitbucket', function() {
    it('should return the combos on a valid request', function() {
      var validRequest = {
        "canon_url": "https://bitbucket.org",
        "commits": [
          {
            "author": "bubba",
            "branch": "branch",
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
          "absolute_url": "/repo/path/",
          "fork": false,
          "is_private": true,
          "name": "Project X",
          "owner": "bubba",
          "scm": "git",
          "slug": "project-x",
          "website": "https://atlassian.com/"
        },
        "user": "bubba"
      };

      var combos = hooks.bitBucket(validRequest, "repos.json.template");

      expect(combos).to.be.an('array');
      expect(combos).to.have.length(1);
      expect(combos[0]).to.deep.equal({
          repo: '/repo/path/'
        , branch: 'branch'
        , conf: {
              dir: '/local/path'
            , test: true
          }
      });
    });

    it('should filter duplicate combos', function() {
      var validRequest = {
        "canon_url": "https://bitbucket.org",
        "commits": [
          {
            "author": "bubba",
            "branch": "branch",
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
          },
          {
            "author": "bubba",
            "branch": "nonexistent_branch",
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
          },
          {
            "author": "bubba",
            "branch": "other_branch",
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
          },
          {
            "author": "bubba",
            "branch": "branch",
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
          },
          {
            "author": "bubba",
            "branch": "other_branch",
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
          "absolute_url": "/repo/path/",
          "fork": false,
          "is_private": true,
          "name": "Project X",
          "owner": "bubba",
          "scm": "git",
          "slug": "project-x",
          "website": "https://atlassian.com/"
        },
        "user": "bubba"
      };

      var combos = hooks.bitBucket(validRequest, "repos.json.template");

      expect(combos).to.be.an('array');
      expect(combos).to.have.length(2);
      expect(combos[0]).to.deep.equal({
          repo: '/repo/path/'
        , branch: 'branch'
        , conf: {
              dir: '/local/path'
            , test: true
          }
      });
      expect(combos[1]).to.deep.equal({
          repo: '/repo/path/'
        , branch: 'other_branch'
        , conf: {
              dir: '/other/branch/dir'
            , test: false 
          }
      });
    });
  });
});
