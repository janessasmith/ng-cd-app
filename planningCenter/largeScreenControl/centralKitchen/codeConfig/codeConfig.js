//create by ma.rongqin 2016.9.1
"use strict";
angular.module('planLSCentralKitchenCodeModule', [])
    .controller('planLSCentralKitchenCodeCtrl', ['$scope', 'trsHttpService', 'trsconfirm', function($scope, trsHttpService, trsconfirm) {
        initStatus();
        initData();
        /**
         * [initStatus description:初始化状态]
         */
        function initStatus() {
            $scope.params = {
                typeid: 'screen',
                serviceid: 'centralkitchenconfig',
                modelid: 'getCode',
            };
            $scope.status = {
                // currEdit:'',
                startNew: false,
            };
            $scope.data = {};
        };
        /**
         * [initData description:初始化状态]
         */
        function initData() {
            requestData();
        };
        /**
         * [requestData description:请求数据]
         */
        function requestData() {
            $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), $scope.params, 'get').then(function(data) {
                $scope.data.items = data;
                $scope.data.allCode = [];
                angular.forEach(data, function(value, key) {
                    $scope.data.allCode.push(value.CODE);
                });
            });
        };
        /**
         * [cancelEdit description:取消编辑]
         */
        $scope.cancelEdit = function() {
            $scope.status.currEdit = "";
        };
        /**
         * [startEdit description:开始编辑]
         */
        $scope.startEdit = function(item) {
            if ($scope.status.startNew) return;
            $scope.status.currEdit = item;
            $scope.status.currEditCopy = angular.copy(item);
        };
        /**
         * [saveEdit description:保存]
         */
        $scope.save = function() {
            if ($scope.status.startNew) {
                // if (typeof Number($scope.status.newCODE) != 'number' || Number.isNaN(Number($scope.status.newCODE)) || $scope.status.newCODE == '' || $scope.status.newSTATEMENT == '') {
                //     trsconfirm.alertType('格式错误', 'code与code明文不能为空，且code必须为数字', 'error', false);
                //     return;
                // };
                if ($scope.data.allCode.indexOf(Number($scope.status.newCODE)) > -1) {
                    trsconfirm.confirmModel('覆盖', '该CODE已存在，是否覆盖', function() {
                        saveNew();
                    });
                } else {
                    saveNew();
                };
            } else {
                // if ($scope.status.currEditCopy.STATEMENT == '') {
                //     trsconfirm.alertType('格式错误', 'code明文不能为空', 'error', false);
                //     return;
                // };
                saveEdit();
            }
        };
        /**
         * [saveEdit description:保存编辑]
         */
        function saveEdit() {
            var params = {
                typeid: 'screen',
                serviceid: 'centralkitchenconfig',
                modelid: 'saveOrUpdateCode',
                code: $scope.status.currEditCopy.CODE,
                explain: $scope.status.currEditCopy.STATEMENT
            };
            $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), params, 'get').then(function(data) {
                $scope.status.currEdit = "";
                trsconfirm.alertType("保存成功", "", "success", false, function() {
                    requestData();
                });
            });
        };
        /**
         * [cancelNew description:取消新增]
         */
        $scope.cancelNew = function() {
            $scope.status.startNew = false;
            $scope.status.newSTATEMENT = '';
            $scope.status.newCODE = '';
        };
        /**
         * [saveNew description:保存新增]
         */
        function saveNew() {
            var params = {
                typeid: 'screen',
                serviceid: 'centralkitchenconfig',
                modelid: 'saveOrUpdateCode',
                code: $scope.status.newCODE,
                explain: $scope.status.newSTATEMENT
            };
            $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), params, 'get').then(function(data) {
                $scope.status.startNew = false;
                $scope.status.newSTATEMENT = '';
                $scope.status.newCODE = '';
                trsconfirm.alertType("保存成功", "", "success", false, function() {
                    requestData();
                });
            });
        };
        /**
         * [deleteItem description:删除]
         */
        $scope.deleteItem = function(item) {
            trsconfirm.confirmModel('删除', '确认删除', function() {
                var params = {
                    typeid: 'screen',
                    serviceid: 'centralkitchenconfig',
                    modelid: 'deleteCode',
                    code: item.CODE,
                };
                $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), params, 'get').then(function(data) {
                    requestData();
                });
            });
        };
    }])
