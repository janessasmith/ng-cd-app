"use strict";
angular.module("productManageMentWeixinSubscriptionModifyModule", [])
    .controller('productManageMentWeixinSubscriptionModifyCtrl', ['$scope', '$modalInstance', 'trsconfirm', 'item', 'trsHttpService', function($scope, $modalInstance, trsconfirm, item, trsHttpService) {
        initStatus();

        /**
         * [initStatus description] 初始化状态
         * @return {[type]} [description]
         */
        function initStatus() {
            $scope.list = {};
            var params = {
                serviceid: "mlf_wechatconfig",
                methodname: "findChannelById",
                ChannelId: item.CHANNELID,
                TopChannelId: 0
            };
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, 'get').then(function(data) {
                $scope.list.forbidDays = data.REPEATUSETIME;
                $scope.list.CheckFgdAttribute = data.CHECKFGDATTRIBUTE;
            });

        }

        /**
         * [cancel description] 关闭弹窗
         * @return {[type]} [description]
         */
        $scope.cancel = function() {
            $modalInstance.dismiss();
        };

        /**
         * [checkProperty description] 选择是否检查稿件属性
         * @return {[type]} [description]
         */
        $scope.checkProperty = function() {
            $scope.list.CheckFgdAttribute = $scope.list.CheckFgdAttribute === '1' ? '0' : '1';
        };

        /**
         * [isConfirm description] 保存弹窗
         * @return {Boolean} [description]
         */
        $scope.isConfirm = function() {
            var regex = /^\-?[0-9]+$/;
            if (!regex.test($scope.list.forbidDays) || $scope.list.forbidDays < 0) {
                trsconfirm.alertType("请输入不小于0的整数", "", "error", false);
                $scope.daysError = true;
                return;
            }
            var params = {
                serviceid: "mlf_wechatconfig",
                methodname: "saveNewChnl",
                OBJECTID: item.CHANNELID,
                TopChannelId: 0,
                PARENTID: 0,
                RepeatUseTime: $scope.list.forbidDays,
                CheckFgdAttribute: $scope.list.CheckFgdAttribute
            };
            $modalInstance.close(params);
        };

        $scope.$watch("list.forbidDays", function(newValue) {
            $scope.daysError = false;
        });
    }]);
