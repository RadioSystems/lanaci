var projectsApp = angular.module('projectsApp', []);

projectsApp.factory('Projects', ['$http', function ($http) {
  return {
    getProjects: function () {
      return $http.get('/projects').then(function (result) {
        return result.data;
      });
    }
  };
}]);

projectsApp.controller('ProjectsCtrl', ['$scope', 'Projects', function ($scope, Projects) {
  $scope.projects = [];
  $scope.retrievedProjects = false;

  Projects.getProjects().then(function (projects) {
    $scope.projects = projects;
    $scope.retrievedProjects = true;
  });
}]);
