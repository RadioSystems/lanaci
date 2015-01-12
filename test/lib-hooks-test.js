var co_mocha = require('co-mocha')
  , expect   = require('chai').expect
  , hooks    = require(__dirname + '/../lib/hooks')
  , mocks    = require('node-mocks-http')
;

describe('lib/hooks', function() {
  describe('handleHooks', function() {
    describe('bitbucket', function() {
      it('should return the combos on a valid request', function*() {
        var validRequest = mocks.createRequest({
          "method": "POST",
          "url": "/",
          "body": {
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
          }
        });
        
        var combos = yield hooks.handleHooks(validRequest, "repos.toml.template");
        
        expect(combos).to.be.an('array');
        expect(combos).to.have.length(1);
        expect(combos[0]).to.deep.equal({
            provider: 'bitbucket'
          , repo: 'repo/path'
          , branch: 'branch'
          , conf: {
              hosts: ['branch.example.com']
            , options: '-v /host:/container'
            , pre_commands: ['npm test']
          }
        });
      });
      
      it('should filter duplicate combos', function*() {
        var validRequest = mocks.createRequest({
          "method": "POST",
          "url": "/",
          "body": {
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
          }
        });
        
        var combos = yield hooks.handleHooks(validRequest, "repos.toml.template");
        
        expect(combos).to.be.an('array');
        expect(combos).to.have.length(2);
        expect(combos[0]).to.deep.equal({
            provider: 'bitbucket'
          , repo: 'repo/path'
          , branch: 'branch'
          , conf: {
              hosts: ['branch.example.com']
            , options: '-v /host:/container'
            , pre_commands: ['npm test']
          }
        });
        expect(combos[1]).to.deep.equal({
            provider: 'bitbucket'
          , repo: 'repo/path'
          , branch: 'other_branch'
          , conf: {
              hosts: ['other.branch.example.com']
            , options: '-p 4000:4000'
            , pre_commands: ['lein test']
          }
        });
      });
    });

    describe('github', function() {
      it('should return the combos on a valid request', function*() {
        var validRequest = mocks.createRequest({
          "method": "POST",
          "url": "/",
          "headers": {
            "X-Gitub-Delivery": "72d3162e-cc78-11e3-81ab-4c9367dc0958",
            "User-Agent": "Github-Hookshot/044aadd",
            "Content-Type": "application/json",
            "X-Github-Event": "push"
          },
          "body": {
            "ref": "refs/heads/another_branch",
            "before": "4d2ab4e76d0d405d17d1a0f2b8a6071394e3ab40",
            "after": "7700ca29dd050d9adacc0803f866d9b539513535",
            "created": false,
            "deleted": false,
            "forced": false,
            "base_ref": null,
            "compare": "https://github.com/baxterthehacker/public-repo/compare/4d2ab4e76d0d...7700ca29dd05",
            "commits": [
              {
                "id": "7700ca29dd050d9adacc0803f866d9b539513535",
                "distinct": true,
                "message": "Trigger pages build",
                "timestamp": "2014-10-09T17:10:36-07:00",
                "url": "https://github.com/baxterthehacker/public-repo/commit/7700ca29dd050d9adacc0803f866d9b539513535",
                "author": {
                  "name": "Kyle Daigle",
                  "email": "kyle.daigle@github.com",
                  "username": "kdaigle"
                },
                "committer": {
                  "name": "Kyle Daigle",
                  "email": "kyle.daigle@github.com",
                  "username": "kdaigle"
                },
                "added": [

                ],
                "removed": [

                ],
                "modified": [
                  "index.html"
                ]
              }
            ],
            "head_commit": {
              "id": "7700ca29dd050d9adacc0803f866d9b539513535",
              "distinct": true,
              "message": "Trigger pages build",
              "timestamp": "2014-10-09T17:10:36-07:00",
              "url": "https://github.com/baxterthehacker/public-repo/commit/7700ca29dd050d9adacc0803f866d9b539513535",
              "author": {
                "name": "Kyle Daigle",
                "email": "kyle.daigle@github.com",
                "username": "kdaigle"
              },
              "committer": {
                "name": "Kyle Daigle",
                "email": "kyle.daigle@github.com",
                "username": "kdaigle"
              },
              "added": [

              ],
              "removed": [

              ],
              "modified": [
                "index.html"
              ]
            },
            "repository": {
              "id": 20000106,
              "name": "public-repo",
              "full_name": "github/repo",
              "owner": {
                "name": "baxterthehacker",
                "email": "baxterthehacker@users.noreply.github.com"
              },
              "private": false,
              "html_url": "https://github.com/baxterthehacker/public-repo",
              "description": "",
              "fork": false,
              "url": "https://github.com/baxterthehacker/public-repo",
              "forks_url": "https://api.github.com/repos/baxterthehacker/public-repo/forks",
              "keys_url": "https://api.github.com/repos/baxterthehacker/public-repo/keys{/key_id}",
              "collaborators_url": "https://api.github.com/repos/baxterthehacker/public-repo/collaborators{/collaborator}",
              "teams_url": "https://api.github.com/repos/baxterthehacker/public-repo/teams",
              "hooks_url": "https://api.github.com/repos/baxterthehacker/public-repo/hooks",
              "issue_events_url": "https://api.github.com/repos/baxterthehacker/public-repo/issues/events{/number}",
              "events_url": "https://api.github.com/repos/baxterthehacker/public-repo/events",
              "assignees_url": "https://api.github.com/repos/baxterthehacker/public-repo/assignees{/user}",
              "branches_url": "https://api.github.com/repos/baxterthehacker/public-repo/branches{/branch}",
              "tags_url": "https://api.github.com/repos/baxterthehacker/public-repo/tags",
              "blobs_url": "https://api.github.com/repos/baxterthehacker/public-repo/git/blobs{/sha}",
              "git_tags_url": "https://api.github.com/repos/baxterthehacker/public-repo/git/tags{/sha}",
              "git_refs_url": "https://api.github.com/repos/baxterthehacker/public-repo/git/refs{/sha}",
              "trees_url": "https://api.github.com/repos/baxterthehacker/public-repo/git/trees{/sha}",
              "statuses_url": "https://api.github.com/repos/baxterthehacker/public-repo/statuses/{sha}",
              "languages_url": "https://api.github.com/repos/baxterthehacker/public-repo/languages",
              "stargazers_url": "https://api.github.com/repos/baxterthehacker/public-repo/stargazers",
              "contributors_url": "https://api.github.com/repos/baxterthehacker/public-repo/contributors",
              "subscribers_url": "https://api.github.com/repos/baxterthehacker/public-repo/subscribers",
              "subscription_url": "https://api.github.com/repos/baxterthehacker/public-repo/subscription",
              "commits_url": "https://api.github.com/repos/baxterthehacker/public-repo/commits{/sha}",
              "git_commits_url": "https://api.github.com/repos/baxterthehacker/public-repo/git/commits{/sha}",
              "comments_url": "https://api.github.com/repos/baxterthehacker/public-repo/comments{/number}",
              "issue_comment_url": "https://api.github.com/repos/baxterthehacker/public-repo/issues/comments/{number}",
              "contents_url": "https://api.github.com/repos/baxterthehacker/public-repo/contents/{+path}",
              "compare_url": "https://api.github.com/repos/baxterthehacker/public-repo/compare/{base}...{head}",
              "merges_url": "https://api.github.com/repos/baxterthehacker/public-repo/merges",
              "archive_url": "https://api.github.com/repos/baxterthehacker/public-repo/{archive_format}{/ref}",
              "downloads_url": "https://api.github.com/repos/baxterthehacker/public-repo/downloads",
              "issues_url": "https://api.github.com/repos/baxterthehacker/public-repo/issues{/number}",
              "pulls_url": "https://api.github.com/repos/baxterthehacker/public-repo/pulls{/number}",
              "milestones_url": "https://api.github.com/repos/baxterthehacker/public-repo/milestones{/number}",
              "notifications_url": "https://api.github.com/repos/baxterthehacker/public-repo/notifications{?since,all,participating}",
              "labels_url": "https://api.github.com/repos/baxterthehacker/public-repo/labels{/name}",
              "releases_url": "https://api.github.com/repos/baxterthehacker/public-repo/releases{/id}",
              "created_at": 1400625583,
              "updated_at": "2014-07-25T16:37:51Z",
              "pushed_at": 1412899789,
              "git_url": "git://github.com/baxterthehacker/public-repo.git",
              "ssh_url": "git@github.com:baxterthehacker/public-repo.git",
              "clone_url": "https://github.com/baxterthehacker/public-repo.git",
              "svn_url": "https://github.com/baxterthehacker/public-repo",
              "homepage": null,
              "size": 665,
              "stargazers_count": 0,
              "watchers_count": 0,
              "language": null,
              "has_issues": true,
              "has_downloads": true,
              "has_wiki": true,
              "has_pages": true,
              "forks_count": 0,
              "mirror_url": null,
              "open_issues_count": 24,
              "forks": 0,
              "open_issues": 24,
              "watchers": 0,
              "default_branch": "master",
              "stargazers": 0,
              "master_branch": "master"
            },
            "pusher": {
              "name": "baxterthehacker",
              "email": "baxterthehacker@users.noreply.github.com"
            },
            "sender": {
              "login": "baxterthehacker",
              "id": 6752317,
              "avatar_url": "https://avatars.githubusercontent.com/u/6752317?v=2",
              "gravatar_id": "",
              "url": "https://api.github.com/users/baxterthehacker",
              "html_url": "https://github.com/baxterthehacker",
              "followers_url": "https://api.github.com/users/baxterthehacker/followers",
              "following_url": "https://api.github.com/users/baxterthehacker/following{/other_user}",
              "gists_url": "https://api.github.com/users/baxterthehacker/gists{/gist_id}",
              "starred_url": "https://api.github.com/users/baxterthehacker/starred{/owner}{/repo}",
              "subscriptions_url": "https://api.github.com/users/baxterthehacker/subscriptions",
              "organizations_url": "https://api.github.com/users/baxterthehacker/orgs",
              "repos_url": "https://api.github.com/users/baxterthehacker/repos",
              "events_url": "https://api.github.com/users/baxterthehacker/events{/privacy}",
              "received_events_url": "https://api.github.com/users/baxterthehacker/received_events",
              "type": "User",
              "site_admin": false
            }
          }
        });

        var combos = yield hooks.handleHooks(validRequest, "repos.toml.template");
        
        expect(combos).to.be.an('array');
        expect(combos).to.have.length(1);
        expect(combos[0]).to.deep.equal({
            provider: 'github'
          , repo: 'github/repo'
          , branch: 'another_branch'
          , conf: {
              hosts: ['another.branch.example.com']
            , options: '-v /host2:/container -p 4001:4001'
            , pre_commands: ['go test']
          }
        });
      });
    });

    describe('error', function() {
      it('should gracefully handle an invalid hook', function*() {
        var invalidRequest = mocks.createRequest({
          method: "POST",
          url: "/",
          body: {
            foo: "bar"
          }
        });
        var throwsErr = false;

        try {
          yield hooks.handleHooks(invalidRequest, "repos.toml.template");
        }
        catch(err) {
          throwsErr = true;
          expect(err).to.equal("Hook not supported");
        }
        finally {
          expect(throwsErr).to.equal(true);
        }
      });
    });
  });
});
