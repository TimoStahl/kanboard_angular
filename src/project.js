angular.module('project', ['ngRoute', 'ngMaterial', 'ngMdIcons'])


.config(function($routeProvider) {
  $routeProvider
    .when('/', {
      controller: 'ProjectListController as projectList',
      templateUrl: 'view/project_list.html'
    })
    .when('/board/show/:projectId/:projectColumn', {
      controller: 'ShowProjectController as showProject',
      templateUrl: 'view/board_show.html'
    })
    .when('/task/show/:taskId', {
      controller: 'ShowTaskController as showTask',
      templateUrl: 'view/task_details.html'
    })
    .when('/board/overdue/:projectId', {
      controller: 'ShowOverdueController as overdueBoard',
      templateUrl: 'view/board_overdue.html'
    })
    .otherwise({
      redirectTo: '/'
    });
})

.factory('navigation', ['$location','$rootScope', function ($location,$rootScope) {
        return {
            home: function () {
                $location.path('/');
                $location.replace();
                console.log("navi home");
                return;
            }
        }
    }])

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
  
  dataFactory.getProjectActivity = function(projectid) {
    var request = '{"jsonrpc": "2.0", "method": "getProjectActivity", "id": 1,"params": { "project_id": ' + projectid + ' }}';
    return $http.post(urlBase+'?getProjectActivity', request, config);
  };
  
  dataFactory.getTaskById = function(taskid) {
    var request = '{"jsonrpc": "2.0", "method": "getTask", "id": 1,"params": { "task_id": ' + taskid + ' }}';
    return $http.post(urlBase+'?getTask', request, config);
  };
  
  dataFactory.getOverdueTasks = function() {
    var request = '{"jsonrpc": "2.0", "method": "getOverdueTasks", "id": 1}';
    return $http.post(urlBase+'?getOverdueTasks', request, config);
  };


  return dataFactory;
}])

.controller('ProjectListController', function($location,$routeParams, $route, $scope, navigation, dataFactory) {
    $scope.$navigation = navigation;
    var projectList = this;

    dataFactory.getProjects()
      .success(function(request) {
        projectList.projects = request.result;
      })
      .error(function(error) {
        console.log(error);
      });

})

.controller('ShowProjectController', function($location,$routeParams, $route, $scope, navigation, dataFactory) {
  $scope.$navigation = navigation;
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

      for (var i = 0; i < board.length; i++) {
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
.controller('ShowOverdueController', function($location,$routeParams, $route, $scope, navigation, dataFactory) {
  $scope.$navigation = navigation;
  var project_id = $routeParams.projectId;
  
  var overdue;

  $scope.tasks = [];

  dataFactory.getOverdueTasks()
    .success(function(request) {
      overdue = request.result;
      
      for (var i = 0; i < overdue.length; i++) {
        if(overdue[i].project_id == project_id){
          $scope.tasks.push(overdue[i]);
          $scope.project_name = overdue[i].project_name;
        }
      }

    })
    .error(function(error) {
      console.log(error);
    });

})
.controller('ShowTaskController', function($location,$routeParams, $route, $scope, navigation, dataFactory) {
  $scope.$navigation = navigation;
  
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