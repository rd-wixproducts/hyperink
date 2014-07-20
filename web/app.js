var app = angular.module('hyperink', []);
var ref = new Firebase('https://popping-fire-1233.firebaseIO.com');

app.controller('paperCtrl', function($scope) {
  $scope.comments = []
  $scope.makingComment = false;
  $scope.tempComment = null;
  $scope.mousedCmt = null;
  $scope.showMousedCmt = false;
  $scope.curve = undefined;

  $scope.mouseDown = function($event) {
    var x = ($event.pageX - paper.offsetLeft),
        y = ($event.pageY);

    $scope.tempComment = { 
      d: ' M'+x+','+y,
      minX: x, maxX: x,
      minY: y, maxY: y
    };
    $scope.comments.push($scope.tempComment);
  };

  $scope.mouseMove = function($event) {
    if($scope.tempComment && !$scope.tempComment.done) {
      var x = ($event.pageX - paper.offsetLeft),
          y = ($event.pageY);

      $scope.tempComment.d += ' L'+x+','+y;
      $scope.tempComment.minX = Math.min($scope.tempComment.minX, x);
      $scope.tempComment.maxX = Math.max($scope.tempComment.maxX, x);
      $scope.tempComment.minY = Math.min($scope.tempComment.minX, y);
      $scope.tempComment.maxY = Math.max($scope.tempComment.maxY, y);
    }
  };

  $scope.mouseUp = function() {
    if($scope.tempComment) {
      $scope.tempComment.done = true;
      $scope.tempComment.x = $scope.tempComment.minX / 2 + $scope.tempComment.maxX / 2;
      $scope.tempComment.y = $scope.tempComment.minY / 2 + $scope.tempComment.maxY / 2;
      $scope.makingComment = true;
    }
  };

  $scope.hideCommentButton = function() {
    return $scope.commentText === '' || $scope.commentText === undefined;
  };

  $scope.showComment = function(cmt) {
    $scope.mousedCmt = cmt;

    if(cmt.done && !$scope.makingComment) {
      $scope.showMousedCmt = true;
    } else {
      $scope.showMousedCmt = false;
    }
  };

  $scope.hideComment = function() {
    $scope.showMousedCmt = false;
  };

  $scope.submitComment = function() {
    $scope.tempComment.text = $scope.commentText;
    //$scope.comments.push($scope.tempComment);
    
    $scope.tempComment = null;
    $scope.commentText = '';
    $scope.makingComment = false;
    ref.push($scope.tempComment);

  };

  $scope.closeCommentDialog = function() {
    $scope.commentText = '';
    $scope.tempComment = null;
    $scope.makingComment = false;
  };

  $scope.removeComment = function() {
    for(cmt in $scope.comments) {
      if($scope.comments[cmt].text === $scope.mousedCmt.text) {
        $scope.comments.splice(cmt, 1);
      }
    }
    $scope.makingComment = false;
    $scope.showMousedCmt = false;
  };

  $scope.cmtStyle = function(x, y) {
    var nX = x + paper.offsetLeft;
    return {'left': nX + 'px', 'top': y + 'px'};
  };

  //TODO need this?
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
