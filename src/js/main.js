angular.module('project', ['ngRoute', 'ngMaterial', 'ngMdIcons', 'base64'])


.config(function($routeProvider) {
  $routeProvider
    .when('/', {
      controller: 'ProjectListController as projectList',
      templateUrl: 'view/project_list.html'
    })
    .when('/settings', {
      controller: 'SettingsController as settings',
      templateUrl: 'view/settings.html'
    })
    .when('/:api_id/board/show/:projectId/:projectColumn', {
      controller: 'ShowProjectController as showProject',
      templateUrl: 'view/board_show.html'
    })
    .when('/:api_id/task/show/:taskId', {
      controller: 'ShowTaskController as showTask',
      templateUrl: 'view/task_details.html'
    })
    .when('/:api_id/board/overdue/:projectId', {
      controller: 'ShowOverdueController as overdueBoard',
      templateUrl: 'view/board_overdue.html'
    })
    .otherwise({
      redirectTo: '/'
    });
})

.factory('navigation', ['$location', '$rootScope', function($location, $rootScope) {
  return {
    home: function() {
      $location.path('/');
      $location.replace();
      console.log("navi home");
      return;
    },
    settings: function() {
      $location.path('/settings');
      $location.replace();
      console.log("navi settings");
      return;
    },
    task: function(api_id, task_id) {
      $location.path('/'+ api_id + '/task/show/' + task_id);
      $location.replace();
      console.log("navi task");
      return;
    }
  }
}])

.factory('dataFactory', ['$base64', '$http', function($base64, $http) {

  var dataFactory = {};

  dataFactory.getEndpoints = function() {
    return [{
      "name": "Testpage",
      "token": "09d2645659634f08456dd53fcd12bd0e2122873a6585560ea6d4a3410095",
      "url": "http://litzbarski.de/todo_dev/jsonrpc.php"
    }, {
      "name": "Kanboard.net Demopage",
      "token": "da2776e2c7ca07b2b1169099550aa4a197024f2f7aac21212682240acc3f",
      "url": "http://demo.kanboard.net/jsonrpc.php"
    }];
  };

  dataFactory.getBaseUrl = function(api_id) {
    var api_config = this.getEndpoints()[api_id - 1];
    return api_config.url;
  };

  dataFactory.createConfig = function(api_id) {
    var api_config = this.getEndpoints()[api_id - 1];
    var auth = $base64.encode('jsonrpc' + ':' + api_config.token);
    var config = {
      headers: {
        'Authorization': 'Basic ' + auth
      }
    };
    return config;
  };

  dataFactory.getProjects = function(api_id) {
    var request = '{"jsonrpc": "2.0", "method": "getAllProjects", "id": '+ api_id +'}';
    return $http.post(this.getBaseUrl(api_id) + '?getAllProjects', request, this.createConfig(api_id));
  };

  dataFactory.getBoard = function(api_id, projectid) {
    var request = '{"jsonrpc": "2.0", "method": "getBoard", "id": '+ api_id +',"params": { "project_id": ' + projectid + ' }}';
    return $http.post(this.getBaseUrl(api_id) + '?getBoard', request, this.createConfig(api_id));
  };

  dataFactory.getProjectById = function(api_id, projectid) {
    var request = '{"jsonrpc": "2.0", "method": "getProjectById", "id": '+ api_id +',"params": { "project_id": ' + projectid + ' }}';
    return $http.post(this.getBaseUrl(api_id) + '?getProjectById', request, this.createConfig(api_id));
  };

  dataFactory.getProjectActivity = function(api_id, projectid) {
    var request = '{"jsonrpc": "2.0", "method": "getProjectActivity", "id": '+ api_id +',"params": { "project_id": ' + projectid + ' }}';
    return $http.post(this.getBaseUrl(api_id) + '?getProjectActivity', request, this.createConfig(api_id));
  };

  dataFactory.getTaskById = function(api_id, taskid) {
    var request = '{"jsonrpc": "2.0", "method": "getTask", "id": '+ api_id +',"params": { "task_id": ' + taskid + ' }}';
    return $http.post(this.getBaseUrl(api_id) + '?getTask', request, this.createConfig(api_id));
  };

  dataFactory.getOverdueTasks = function(api_id) {
    var request = '{"jsonrpc": "2.0", "method": "getOverdueTasks", "id": '+ api_id +'}';
    return $http.post(this.getBaseUrl(api_id) + '?getOverdueTasks', request, this.createConfig(api_id));
  };


  return dataFactory;
}])

.controller('ProjectListController', function($location, $routeParams, $route, $scope, navigation, dataFactory) {
  $scope.$navigation = navigation;
  var projectList = this;
  
  $scope.endpoints = dataFactory.getEndpoints();

  for (var i = 0; i < $scope.endpoints.length; i++) {
    $scope.endpoints[i].id = i;
    var id = i + 1;
    var result;
    dataFactory.getProjects(id)
      .success(function(request) {
        result = request.result;
        $scope.endpoints[request.id - 1].projects = result;
      })
      .error(function(error) {
        console.log(error);
      });
  }
})

.controller('ShowProjectController', function($location, $routeParams, $route, $scope, navigation, dataFactory) {
    $scope.$navigation = navigation;
    $scope.project_id = $routeParams.projectId;
    $scope.column_id = $routeParams.projectColumn;

    var api_id = parseInt($routeParams.api_id) + 1;
    $scope.api_id = $routeParams.api_id;
    var project;
    var board;
    var numberOfColumns;
    $scope.tasks = [];

    dataFactory.getProjectById(api_id, $routeParams.projectId)
      .success(function(request) {
        project = request.result;
        $scope.project_name = project.name;
      })
      .error(function(error) {
        console.log(error);
      });

    dataFactory.getBoard(api_id, $routeParams.projectId)
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
        //console.log($scope.tasks);

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
  .controller('ShowOverdueController', function($location, $routeParams, $route, $scope, navigation, dataFactory) {
    $scope.$navigation = navigation;
    var project_id = $routeParams.projectId;

    var api_id = parseInt($routeParams.api_id) + 1;
    $scope.api_id = $routeParams.api_id;
    var overdue;

    $scope.tasks = [];

    dataFactory.getOverdueTasks(api_id)
      .success(function(request) {
        overdue = request.result;

        for (var i = 0; i < overdue.length; i++) {
          if (overdue[i].project_id == project_id) {
            $scope.tasks.push(overdue[i]);
            $scope.project_name = overdue[i].project_name;
          }
        }

      })
      .error(function(error) {
        console.log(error);
      });

  })
  .controller('ShowTaskController', function($location, $routeParams, $route, $scope, navigation, dataFactory) {
    $scope.$navigation = navigation;

    var api_id = parseInt($routeParams.api_id) + 1;
    $scope.api_id = $routeParams.api_id;
    var id = $routeParams.taskId;
    $scope.task;

    dataFactory.getTaskById(api_id, id)
      .success(function(request) {
        $scope.task = request.result;
      })
      .error(function(error) {
        console.log(error);
      });

  })
  .controller('SettingsController', function($location, $routeParams, $route, $scope, navigation, dataFactory) {
    $scope.$navigation = navigation;

    $scope.endpoints = dataFactory.getEndpoints();

  });