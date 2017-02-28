/**
 * 采编中心 微博 流程记录
 * by zhou 2016-9-26
 */
"use strict";
angular.module("weiboProcessRecordModule", [])
    .controller('weiboProcessRecordCtrl', ['$scope', '$modalInstance','trsHttpService','initVersionService',function($scope, $modalInstance,trsHttpService,initVersionService) {
        initStatus();
        initData();

        function initStatus(){
            $scope.data ={
                items : [],
                date:[]
            };
        }
        /**
         * [initData description]初始化参数
         * @return {[type]} [description]
         */
        function initData(){
            var id = eval("(" + localStorage.getItem("weibo.processWindow") + ")").objId;
            $scope.params = {
                    "serviceid": "wcm61_socialprocess",
                    "methodname": "queryToJson",
                    "ObjId": id,
                    "objType":1
            };
            trsHttpService.httpServer('/wcm/rbcenter.do', $scope.params, "get").then(function(data) {
                $scope.data.items = data;
                $scope.data.date = $scope.data.date.concat(initVersionService.getDayContent($scope.data.items));
            });
        }
        /**
         * [cancel description] 取消
         * @return {[type]} [description]
         */
        $scope.cancel = function() {
            $modalInstance.dismiss();
        };
    }]);