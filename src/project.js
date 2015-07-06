angular.module('project', ['ngRoute'])


.service('Projects', function() {

})

.config(function($routeProvider) {
  $routeProvider
    .when('/', {
      controller: 'ProjectListController as projectList',
      templateUrl: 'list.html'
    })
    .when('/board/show/:projectId/:projectColumn', {
      controller: 'ShowProjectController as showProject',
      templateUrl: 'board.html'
    })
    .when('/task/show/:taskId', {
      controller: 'ShowTaskController as showTask',
      templateUrl: 'task.html'
    })
    .otherwise({
      redirectTo: '/'
    });
})

.factory('dataFactory', ['$http', function($http) {

  var config = {
    headers: {
      'Authorization': '<-enter auth->'
    }
  };

  var urlBase = '<-enter url->';
  var dataFactory = {};

  dataFactory.getProjects = function() {
    var request = '{"jsonrpc": "2.0", "method": "getAllProjects", "id": 1}';
    return $http.post(urlBase+'?getAllProjects', request, config);
  };

  dataFactory.getBoard = function(projectid) {
    var request = '{"jsonrpc": "2.0", "method": "getBoard", "id": 1,"params": { "project_id": ' + projectid + ' }}';
    return $http.post(urlBase+'?getBoard', request, config);
  };

  dataFactory.getProjectById = function(projectid) {
    var request = '{"jsonrpc": "2.0", "method": "getProjectById", "id": 1,"params": { "project_id": ' + projectid + ' }}';
    return $http.post(urlBase+'?getProjectById', request, config);
  };
  
  dataFactory.getTaskById = function(taskid) {
    var request = '{"jsonrpc": "2.0", "method": "getTask", "id": 1,"params": { "task_id": ' + taskid + ' }}';
    return $http.post(urlBase+'?getTask', request, config);
  };


  return dataFactory;
}])

.controller('ProjectListController', ['$scope', 'dataFactory',
  function($scope, dataFactory) {
    var projectList = this;

    dataFactory.getProjects()
      .success(function(request) {
        projectList.projects = request.result;
        //console.log(projectList.projects);
      })
      .error(function(error) {
        console.log(error);
      });

  }
])

.controller('ShowProjectController', function($routeParams, $route, $scope, dataFactory) {
  $scope.project_id = $routeParams.projectId;
  $scope.column_id = $routeParams.projectColumn;

  var project;
  var board;
  var numberOfColumns;
  $scope.tasks = [];



  dataFactory.getProjectById($routeParams.projectId)
    .success(function(request) {
      project = request.result;
      $scope.project_name = project.name;
    })
    .error(function(error) {
      console.log(error);
    });

  dataFactory.getBoard($routeParams.projectId)
    .success(function(request) {
      board = request.result;
      numberOfColumns = board[0].columns.length;
      $scope.column_number = numberOfColumns;
      $scope.column_name = board[0].columns[$routeParams.projectColumn - 1].title;

      //console.log("start loop");
      for (var i = 0; i < board.length; i++) {
        //console.log("new Swimlane");
        for (var j = 0; j < board[i].columns[$routeParams.projectColumn - 1].tasks.length; j++) {
          $scope.tasks.push(board[i].columns[$routeParams.projectColumn - 1].tasks[j]);
        }
      }
      console.log($scope.tasks);

    })
    .error(function(error) {
      console.log(error);
    });


  $scope.nextColumn = function() {
    if (numberOfColumns > $scope.column_id) {
      $routeParams.projectColumn = $routeParams.projectColumn * 1 + 1;
      $route.updateParams($routeParams);
    }
  }

  $scope.previousColumn = function() {
    if ($scope.column_id > 1) {
      $routeParams.projectColumn = $routeParams.projectColumn * 1 - 1;
      $route.updateParams($routeParams);
    }
  }
  
})

.controller('ShowTaskController', function($routeParams, $route, $scope, dataFactory) {
  
  var id = $routeParams.taskId;
  $scope.task;

  dataFactory.getTaskById(id)
    .success(function(request) {
      $scope.task = request.result;
    })
    .error(function(error) {
      console.log(error);
    });

});