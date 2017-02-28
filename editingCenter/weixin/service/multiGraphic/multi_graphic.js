'use strict';
angular.module("wechatMultiGraphicRankModule", [])
    .controller("wechatMultiGraphicRankCtrl", ["$scope", "$modalInstance", "trsHttpService", "trsconfirm", "trsspliceString", "draftParams", "editingCenterWechatService", function($scope, $modalInstance, trsHttpService, trsconfirm, trsspliceString, draftParams, editingCenterWechatService) {
        initStatus();
        initData();
        /**
         * [initStatus description]初始化状态
         * @return {[type]} [description]
         */
        function initStatus() {
            $scope.status = {
                
            };
            $scope.data = {
                metaDataIds: draftParams.data.split(','), //图文稿件ID数组
                wxChannelId: draftParams.wxChannelId, //微信公众号ID
                items: [],
            };
        }
        /**
         * [initData description]初始化数据
         * @return {[type]} [description]
         */
        function initData() {
            angular.forEach($scope.data.metaDataIds, function(id, index, array){
                var params = {
                    "serviceid": "nb_wechatdoc",
                    "methodname": "getWeChatPicsDoc",
                    "MetaDataId": id,
                    "WXChannelId": $scope.data.wxChannelId
                };
                trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function(data) {
                    $scope.data.items.push(data);
                });
            });
        }
        /**
         * [confirm description]确认
         * @return {[type]} [description]
         */
        $scope.confirm = function() {
            // var metaDataIds = trsspliceString.spliceString($scope.data.items, "METADATAID", ",");
            var metaDataIds = [];
            angular.forEach($scope.data.metaDataIds, function(id, index){
                metaDataIds.push(id);
            });
            $modalInstance.close(JSON.stringify(metaDataIds));
        };
        /**
         * [cancel description]取消
         * @return {[type]} [description]
         */
        $scope.cancel = function() {
            $modalInstance.dismiss();
        };
        /**
         * [moveUp description]上移
         * @return {[type]} [description]
         */
        $scope.moveUp = function(index) {
            swapItems($scope.data.items, index, index - 1);
        };
        /**
         * [moveDown description]下移
         * @return {[type]} [description]
         */
        $scope.moveDown = function(index) {
            swapItems($scope.data.items, index, index + 1);
        };
        /**
         * [swapItems description]修改顺序
         * @return {[type]} [description]
         */
        function swapItems(list, index1, index2) {
            list[index1] = list.splice(index2, 1, list[index1])[0];
        }
    }]);
