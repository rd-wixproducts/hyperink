var app = angular.module('hyperink', []);

app.controller('paperCtrl', function($scope) {
  $scope.comments = [];
  $scope.makingComment = false;
  $scope.tempComment = {};

  $scope.createComment = function($event) {
    console.log($event);
    $scope.makingComment = false;

    $scope.tempComment = {
      x: $event.pageX - paper.offsetLeft,
      y: $event.pageY,
      comment: ''
    };

    $scope.makingComment = true;

    $scope.comments.push($scope.tempComment);
  };

  $scope.cmtStyle = function(x, y) {
    var nX = x + paper.offsetLeft;
    return {'left': nX + 'px', 'top': y + 'px'};
  };
  
  window.onresize = function() {
    $scope.$apply();
  };
});

app.directive('paper', function() {
  return {
    restrict: 'E',
    templateUrl: 'paper.partial.html'
  };
});
