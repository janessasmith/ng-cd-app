/**
 * Created by MRQ on 2016/1/6.
 */
"use strict";
angular.module("productManageMentAppDeleteViewsModule", [])
    .controller("productManageMentAppDeleteViewsCtrl", ["$scope", "$modalInstance", "successFn", function ($scope, $modalInstance, successFn) {
        init();
        $scope.cancel = function () {
            $scope.$close();
        };
        $scope.confirm = function () {
            $modalInstance.close({});
        };
        function init() {
        };
    }]);