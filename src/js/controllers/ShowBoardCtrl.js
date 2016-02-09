angular.module('KanboardCtrl')
.controller('ShowBoardController', function($routeParams, $scope, navigation, dataFactory) {
    $scope.$navigation = navigation;
    $scope.project_id = $routeParams.projectId;
    $scope.selectedIndex = 0;
    var numberOfColumns;

    var api_id = parseInt($routeParams.api_id) + 1;
    $scope.api_id = $routeParams.api_id;
    var project;
    var board;
    $scope.tasks = [];

    dataFactory.getProjectById(api_id, $routeParams.projectId)
      .success(function(request) {
        project = request.result;
        $scope.project = project;
        console.log("Before " + $scope.selectedIndex);
        if($routeParams.columnId > 0){
            $scope.selectedIndex = $routeParams.columnId;
            console.log("In " + $scope.selectedIndex);
        }
      })
      .error(function(error) {
        console.log(error);
      });

    dataFactory.getBoard(api_id, $routeParams.projectId)
      .success(function(request) {
        $scope.board = request.result;
        board = request.result;
        $scope.columns = board[0].columns;
        numberOfColumns = board[0].columns.length;
        for(var i = 1; i < board.length; i++){
          for(var j = 0; j < board[i].columns.length; j++){
            for(var k = 0; k < board[i].columns[j].tasks.length; k++){
              $scope.columns[j].tasks.push(board[i].columns[j].tasks[k]);
            }
          }
        }
        //console.log($scope.columns[0]);
      })
      .error(function(error) {
        console.log(error);
      });

    $scope.nextColumn = function() {
      if ((numberOfColumns - 1) > $scope.selectedIndex) {
        $scope.selectedIndex++;
      }
    }

    $scope.previousColumn = function() {
      if ($scope.selectedIndex > 0) {
        $scope.selectedIndex--;
      }
    }
    
    $scope.$watch('selectedIndex', function(current, old) {
        if(current != old){
           navigation.board($routeParams.api_id,$routeParams.projectId,current,false);
        }
    });

  });