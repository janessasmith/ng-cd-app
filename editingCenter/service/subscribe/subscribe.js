'use strict';
/*
    Create by zheng.lu 2017-03-08
*/
angular.module("subscribeModalMudule", [])
    .controller("subscribeModalCtrl", ["$scope", "$modalInstance", "draftParams", function($scope, $modalInstance, draftParams) {
        initStatus();
        initData();

        /**
         * [initStatus description: 初始化状态]
         * @return {[type]} [description]
         */
        function initStatus() {
            $scope.data = {
                modalTitle: draftParams.modalTitle
            };
        }

        function initData() {

        }

        /**
         * [cancel description: 弹窗 取消按钮]
         * @return {[type]} [description]
         */
        $scope.cancel = function() {
            $modalInstance.dismiss('111');
        };
}]);