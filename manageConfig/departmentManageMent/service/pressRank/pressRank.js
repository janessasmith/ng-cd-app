/*
    Author:CC
    Time:2016-11-01
*/
"use strict";
angular.module("departmentPressRankModule", [])
    .controller("departmentPressRanCtrl", ["$scope", "$modalInstance", "$state", "trsHttpService","trsspliceString","trsconfirm","departments",function($scope, $modalInstance, $state, trsHttpService,trsspliceString,trsconfirm,departments) {
        initStatus();
        /**
         * [initStatus description]初始化状态
         * @return {[type]} [description]
         */
        function initStatus() {
            $scope.data={
                departments:departments,
                selectedItem:"",
            };
        }
        $scope.cancel = function() {
            $modalInstance.dismiss();
        };

        $scope.confirm = function() {
            var params = {
                "serviceid": "nb_departmentSet",
                "methodname": "reorderDepartment",
                "ObjectIds": trsspliceString.spliceString($scope.data.departments,
                "DEPARTMENTID", ','),
            };
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, 'get').then(function(data) {
                trsconfirm.alertType('顺序更改成功', "", "success", false, function() {
                     $modalInstance.close();
                });
            });

        };
        //选中被移动的照排版面
        $scope.selecDepartment = function(department) {
            $scope.data.selectedItem = department;
        };

        //上移
        $scope.moveUp = function() {
            var currentIndex = $scope.data.departments.indexOf($scope.data.selectedItem);
            if (currentIndex !== 0) {
                swapItems($scope.data.departments, currentIndex, currentIndex - 1);
            }
        };

        //下移
        $scope.moveDown = function() {
            var currentIndex = $scope.data.departments.indexOf($scope.data.selectedItem);
            if (currentIndex !== $scope.data.departments.length - 1) {
                swapItems($scope.data.departments, currentIndex, currentIndex + 1);
            }
        };

        //置顶
        $scope.moveToTop = function() {
            var currentIndex = $scope.data.departments.indexOf($scope.data.selectedItem);
            if (currentIndex !== 0) {
                $scope.data.departments.splice(0, 0, $scope.data.departments.splice(currentIndex, 1)[0]);
            }
        };

        //至尾
        $scope.moveToBottom = function() {
            var currentIndex = $scope.data.departments.indexOf($scope.data.selectedItem);
            if (currentIndex !== $scope.data.departments.length - 1) {
                $scope.data.departments[$scope.data.departments.length - 1] = $scope.data.departments.splice(currentIndex, 1)[0];
            }
        };

        function swapItems(list, index1, index2) {
            list[index1] = list.splice(index2, 1, list[index1])[0];
        }

    }]);
