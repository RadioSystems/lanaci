angular.module('projectsApp', [])

.factory('Projects', function ($http) {
  return {
    getProjects: function () {
      return $http.get('/projects').then(function (result) {
        return result.data;
      });
    }
  };
})

.controller('ProjectsCtrl', function ($scope, Projects) {
  $scope.projects = [];
  $scope.retrievedProjects = false;

  Projects.getProjects().then(function (projects) {
    $scope.projects = projects;
    $scope.retrievedProjects = true;
  });
});
