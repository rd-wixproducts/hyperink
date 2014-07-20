var app = angular.module('hyperink', []);

app.controller('paperCtrl', function($scope) {
  $scope.comments = [];
  $scope.makingComment = undefined;
  $scope.tempComment = {};
  $scope.mousedCmt = {};
  $scope.showMousedCmt = false;
  $scope.curve = undefined;


  /*
  $scope.createComment = function($event) {
    $scope.makingComment = false;

    $scope.tempComment = {
      x: $event.pageX - paper.offsetLeft,
      y: $event.pageY,
      text: ''
    };

    $scope.makingComment = true;

  };
  */

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
    $scope.comments[$scope.comments.length - 1].text = $scope.commentText;
    $scope.closeCommentDialog();
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

  $scope.cmtStyle = function(cmt) {
    if(cmt === undefined) {
      return {};
    }
    var x = cmt.x + paper.offsetLeft;
    var y = cmt.y;
    return {'left': x + 'px', 'top': y + 'px'};
  };

  onmousedown = function($event) {
    $scope.curve = document.createElementNS('http://www.w3.org/2000/svg','path');
    $scope.curve.setAttribute('d', 'M'+ ($event.pageX - document.getElementById('paper').offsetLeft) +' '+($event.pageY- document.getElementById('paper').offsetTop))
    $scope.curve.setAttribute('stroke', 'rgba(125, 0, 125, 0.8)');
    $scope.curve.setAttribute('fill', 'rgba(0, 0, 0, 0)');
    document.getElementById('hyperspace').appendChild($scope.curve);
  };

  onmouseup = function() {
    $scope.curve.setAttribute('fill', 'rgba(125, 0, 125, 0.2)');
    $scope.curve.setAttribute('stroke', 'rgba(0, 0, 0, 0)');
    $scope.tempComment = {
      curve: $scope.curve,
      x: $scope.curve.getBBox().x,
      y: $scope.curve.getBBox().y,
      w: $scope.curve.getBBox().width,
      h: $scope.curve.getBBox().height,
      d: $scope.curve.getAttribute('d'),
      text: ''
    };
    $scope.makingComment = true;
    if($scope.tempComment.x > 10 && $scope.tempComment.y > 10) {
      $scope.comments.push($scope.tempComment);
    }
    $scope.curve.parentNode.removeChild($scope.curve);
    $scope.curve = null;
  };

  onmousemove = function($event){
    //console.log($event, $scope.curve)
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


