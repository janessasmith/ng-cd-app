/**
 * Created by MRQ on 2016/1/6.
 */
"use strict";
angular.module("appModifyChannlOtherViewsModule", [])
    .controller("appModifyChannlOtherViewsCtrl", ["$scope", "$modalInstance",function ($scope, $modalInstance) {
        $scope.cancel = function () {
            $scope.$close();
        };
        $scope.confirm = function () {
            $modalInstance.close({});
        };
    }]);