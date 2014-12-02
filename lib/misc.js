var equal = require('deep-equal')
  , fs    = require('fs')
  , path  = require('path')
  ;

var readRepoConf = exports.readConf = function(file) {
  var filePath = path.join(__dirname, '..', 'conf', file);

  return JSON.parse(fs.readFileSync(filePath));
};

var isIn = exports.isIn = function(arr, el) {
  for (var i = 0; i < arr.length; i++) {
    if (equal(arr[i], el)) {
      return true;
    }
  }

  return false;
};
