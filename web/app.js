var app = angular.module('hyperink', []);

app.controller('paperCtrl', function($scope) {
  $scope.comments = [];
  $scope.makingComment = false;
  $scope.tempComment = {};
  $scope.mousedCmt = {};
  $scope.showMousedCmt = false;

  $scope.createComment = function($event) {
    $scope.makingComment = false;

    $scope.tempComment = {
      x: $event.pageX - paper.offsetLeft,
      y: $event.pageY,
      text: ''
    };

    $scope.makingComment = true;

  };

  $scope.hideCommentButton = function() {
    return $scope.commentText === '' || $scope.commentText === undefined;
  };

  $scope.showComment = function(cmt) {
    $scope.mousedCmt = cmt;
    $scope.showMousedCmt = true;
  };

  $scope.hideComment = function() {
    $scope.showMousedCmt = false;
  };

  $scope.submitComment = function() {
    $scope.tempComment.text = $scope.commentText;
    $scope.comments.push($scope.tempComment);
    $scope.tempComment = {};
    $scope.commentText = '';
    $scope.makingComment = false;
  };

  $scope.closeCommentDialog = function() {
    $scope.commentText = '';
    $scope.tempComment = {};
    $scope.makingComment = false;
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
