var app = angular.module('hyperink', []);

app.controller('paperCtrl', function($scope) {
  $scope.comments = [];
  $scope.makingComment = false;
  $scope.tempComment = {};
  $scope.mousedCmt = {};
  $scope.showMousedCmt = false;
  $scope.curve = undefined;
  $scope.prev_curve = undefined


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

  onmousedown = function($event){
    $scope.curve = document.createElementNS('http://www.w3.org/2000/svg','path');
    $scope.curve.setAttribute('d', 'M'+ ($event.pageX - document.getElementById('paper').offsetLeft) +' '+($event.pageY- document.getElementById('paper').offsetTop))
    $scope.curve.setAttribute('stroke', 'rgba(100, 140, 255, 0.8)')
    $scope.curve.setAttribute('fill', 'rgba(250, 200, 200, 0)');
    document.getElementById('hyperspace').appendChild($scope.curve)
  }

  onmouseup = function(){
    $scope.curve.setAttribute('fill', 'rgba(250, 200, 200, 0.2)');
    $scope.curve.setAttribute('stroke', 'rgba(100, 140, 255, 0)')
    $scope.prev_curve = $scope.curve;
    $scope.curve = undefined;
  }

  onmousemove = function($event){
    console.log($event, $scope.curve)
    if($scope.curve)
      $scope.curve.setAttribute('d', $scope.curve.getAttribute('d') + 'L'+($event.pageX - document.getElementById('paper').offsetLeft)+' '+($event.pageY- document.getElementById('paper').offsetTop));
  }
  
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


