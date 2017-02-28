//create by ma.rongqin 2016.9.1
"use strict";
angular.module('planLSCentralKitchenIPModule', [])
    .controller('planLSCentralKitchenIPCtrl', ['$scope', 'trsHttpService', 'trsconfirm', 'trsspliceString', function($scope, trsHttpService, trsconfirm, trsspliceString) {
        initStatus();
        initData();
        /**
         * [initStatus description]初始化参数
         * @return {[type]} [description]
         * items 列表数据
         * ips 新增ip地址字符串
         * showInput 新增 ip
         * cancelAdd 取消新增
         */
        function initStatus() {
            $scope.data = {
                items: [],
                ips: []
            };
            $scope.status = {
                showInput: false,
                cancelAdd: false,
            };
        }
        /**
         * [initData description]初始化数据
         * @return {[type]} [description]
         */
        function initData() {
            requestData();
        }
        /**
         * [requestData description]请求数据
         * @return {[type]} [description]
         */
        function requestData() {
            var params = {
                typeid: 'screen',
                serviceid: 'ipconfig',
                modelid: 'getip'
            };
            $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), params, 'get').then(function(data) {
                initStatus();
                $scope.data.items = data;
            });
        }
        /**
         * [addIp description]新增 数组push对象ip,用来改变input框不同的值。 input框显示,取消新增按钮显示,新增input框时,input框内容为空
         */
        $scope.addIp = function() {
            $scope.data.ips.push({ip:''});
            $scope.status.showInput = true;
            $scope.status.cancelAdd = true;
        };
        /**
         *  删除  未上传 ip
         * @return {[type]} [description]
         * index 传递的是数组
         */
        $scope.delNewIP = function(index) {
            $scope.data.ips.splice(index,1);
            if ($scope.data.ips.length == "0") {
                $scope.status.showInput = false;
                $scope.status.cancelAdd = false;
            }
        };
        /**
         * [cancel description]取消新增 新增ip input框不显示,input框内容为空 ,取消新增按钮不显示
         * @return {[type]} [description]
         */
        $scope.cancel = function() {
            $scope.status.cancelAdd = false;
            $scope.data.ips = [];
        };
        /**
         * [save description]保存
         * @return {[type]} [description]
         */
        $scope.save = function() {
            var ips = trsspliceString.spliceString($scope.data.ips, "ip", ";");
            var params = {
                typeid: 'screen',
                serviceid: 'ipconfig',
                modelid: 'saveip',
                ip: ips
            };
            $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), params, 'get').then(function(data) {
                trsconfirm.alertType("保存成功", "", "success", false, function() {
                    requestData();
                });
            });
        };
        /**
         * [del description]删除IP
         * @return {[type]} [description]
         */
        $scope.del = function(item) {
            trsconfirm.confirmModel('删除', '确认删除', function() {
                var params = {
                    typeid: 'screen',
                    serviceid: 'ipconfig',
                    modelid: 'deleteIp',
                    ip: item.IP
                };
                $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), params, 'get').then(function(data) {
                        requestData();
                });
            });
        };
    }]);
