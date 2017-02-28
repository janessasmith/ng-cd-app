"use strict";
/**
 * customMonitor Module
 *
 * Description 部门稿库管理
 * Author:CC 2016-11-1
 */
angular.module('departmentManageMentModule', ['departmentManageMentRouterModule', 'departmentManageMentServiceModule']).
controller('departmentManageMentController', ['$scope', '$state', '$timeout', 'treeService', 'trsHttpService', 'trsconfirm', 'trsspliceString', 'trsGroupTreeLocationService', function($scope, $state, $timeout, treeService, trsHttpService, trsconfirm, trsspliceString, trsGroupTreeLocationService) {
    $scope.$on("changeUnit", function(event, msg) {
        $scope.$broadcast("departmentUnit", msg);
    });
}]);
