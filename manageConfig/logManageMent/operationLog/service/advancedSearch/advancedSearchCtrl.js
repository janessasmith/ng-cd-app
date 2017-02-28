'use strict';
/**
 * by zhou 2016-7-22
 */
angular.module("advancedSearchModule", [])
    .controller('advancedSearchCtrl', ['$scope', '$filter', '$modalInstance', 'trsHttpService', function($scope, $filter, $modalInstance, trsHttpService) {
        initStatus();

        function initStatus() {
            $scope.status = {
                search:{
                type: "2",
                strsortmethod: "-operator_time",
                operator: "",
                medianame: "",
                displayname: "",
                time: "",
                ip: "",
                operatedesc: ""
                }
            };
            // 默认显示 起始时间和结束时间
            var date = new Date();
            $scope.fromDate = date.setMonth(date.getMonth() - 1);
            $scope.untilDate = date.setMonth(date.getMonth() + 1);
            $scope.minformDate = date.setMonth(date.getMonth() - 1)-60*60*24*1000;
        }
        $scope.$watch("fromDate",function(newValue, oldValue) {
            $scope.minformDate = newValue - 60*60*24*1000;
        });
        /**
         * [cancel description] 取消
         * @return {[type]} [description]
         */
        $scope.cancel = function() {
            $modalInstance.dismiss();
        };
        /**
         * [send description] 确定  filter 返回查询起始时间和结束时间
         * @return {[type]} [description]
         */
        $scope.send = function() {
            var Stime = $filter('date')($scope.fromDate, 'yyyy-MM-dd');
            var Dtime = $filter('date')($scope.untilDate, 'yyyy-MM-dd');
            $scope.status.search.time = Stime + ";" + Dtime;
            $modalInstance.close($scope.status.search);
        };
    }]);
