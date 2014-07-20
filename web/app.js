var app = angular.module('hyperink', []);

app.controller('paperCtrl', function($scope) {
  $scope.comments = [];
  $scope.makingComment = false;
  $scope.tempComment = {};
  $scope.mousedCmt = {};
  $scope.showMousedCmt = false;
  $scope.curve = undefined;

  // $scope.createComment = function($event) {
  //   $scope.makingComment = false;
    
  //   $scope.tempComment = {
  //     x: $event.pageX - paper.offsetLeft,
  //     y: $event.pageY,
  //     text: ''
  //   };

  //   $scope.makingComment = true;

  // };
  $scope.mouseDown = function($event){
    console.log($event)
    var x = ($event.pageX - paper.offsetLeft),
        y = ($event.pageY);

    $scope.tempComment = {
      d: ' M'+x+','+y,
      minX: x, maxX: x,
      minY: y, maxY: y
    }
    $scope.comments.push($scope.tempComment);
  }
  $scope.mouseMove = function($event){
    // console.log($event)
    if($scope.tempComment && !$scope.tempComment.done){
      var x = ($event.pageX - paper.offsetLeft),
          y = ($event.pageY);

      $scope.tempComment.d += ' L'+x+','+y
      $scope.tempComment.minX = Math.min($scope.tempComment.minX, x)
      $scope.tempComment.maxX = Math.max($scope.tempComment.maxX, x)
      $scope.tempComment.minY = Math.min($scope.tempComment.minY, y)
      $scope.tempComment.maxY = Math.max($scope.tempComment.maxY, y)
    }
  }
  $scope.mouseUp = function(){
    $scope.tempComment.done = true;
    $scope.tempComment.x = $scope.tempComment.minX / 2 + $scope.tempComment.maxX / 2;
    $scope.tempComment.y = $scope.tempComment.minY / 2 + $scope.tempComment.maxY / 2;
    // $scope.tempComment = null;
    $scope.makingComment = true;
  }
  $scope.hideCommentButton = function() {
    return $scope.commentText === '' || $scope.commentText === undefined;
  };

  $scope.showComment = function(cmt) {
    console.log('showing shit')
    
    $scope.mousedCmt = cmt;

    $scope.showMousedCmt = true;
  };

  $scope.hideComment = function() {
    $scope.showMousedCmt = false;
  };

  $scope.submitComment = function() {
    $scope.tempComment.text = $scope.commentText;
    $scope.comments.push($scope.tempComment);
    
    $scope.tempComment = null;
    $scope.commentText = '';
    $scope.makingComment = false;
  };

  $scope.closeCommentDialog = function() {
    $scope.commentText = '';
    $scope.tempComment = {};
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

});

app.directive('paper', function() {
  return {
    restrict: 'E',
    templateUrl: 'paper.partial.html'
  };
});


