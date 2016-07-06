'use strict';

var app = angular.module('wecoApp');
app.controller('subbranchesController', ['$scope', '$state', '$timeout', 'Branch', function($scope, $state, $timeout, Branch) {
  $scope.tabItems = ['all time', 'this year', 'this month', 'this week', 'today', 'this hour'];
  $scope.tabStates =
    ['weco.branch.subbranches({ "branchid": "' + $scope.branchid + '", "filter": "alltime" })',
     'weco.branch.subbranches({ "branchid": "' + $scope.branchid + '", "filter": "year" })',
     'weco.branch.subbranches({ "branchid": "' + $scope.branchid + '", "filter": "month" })',
     'weco.branch.subbranches({ "branchid": "' + $scope.branchid + '", "filter": "week" })',
     'weco.branch.subbranches({ "branchid": "' + $scope.branchid + '", "filter": "today" })',
     'weco.branch.subbranches({ "branchid": "' + $scope.branchid + '", "filter": "hour" })'];

  $scope.branches = [];

  Branch.getRoots().then(function(branches) {
    $timeout(function() {
      $scope.branches = branches;
    });
  }, function() {
    // TODO: pretty error
    console.error("Unable to get branches!");
  });
}]);
