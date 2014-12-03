var shell    = require(__dirname + '/shell')
  , fetch    = shell.fetch
  , run      = shell.run
  , unitTest = shell.unitTest
  ;

var task = exports.task = function(repo, branch, conf) {
  fetch(repo, 'origin', branch,
        function (fetchErr, fetchOut) {
          if (fetchErr) {
            return console.error(fetchErr);
          }

          if (conf.test) {
            unitTest(repo,
                     function (testErr, testOut) {
                       console.log(testOut);
                       if (testErr) {
                         return console.error(testErr);
                       }

                       run(repo,
                           function (runErr, runOut) {
                             if (runErr) {
                               console.error(runErr);
                             }
                           }
                       );

                       
                     }
            );
          }
          else {
            run(repo,
                function (runErr, runOut) {
                  if (runErr) {
                    console.error(runErr);
                  }
                }
            );
          }
        }
  );
};
