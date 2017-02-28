//create by ma.rongqin 2016.9.1
"use strict";
angular.module('planLSCentralKitchenMediaModule', [])
    .controller('planLSCentralKitchenMediaCtrl', ['$scope', 'trsHttpService', 'trsconfirm', function($scope, trsHttpService, trsconfirm) {
        initStatus();
        initData();
        /**
         * [initStatus description:初始化状态]
         */
        function initStatus() {
            $scope.params = {
                typeid: 'screen',
                serviceid: 'mediaclass',
                modelid: 'get',
            };
            $scope.status = {
                currEdit: '',
                startNew: false,
                newName: '',
                newType: '',
                newScroll: '',
                newSeat: '',
                scrollList: {
                    "0": '固定',
                    "1": '滚动'
                },
                scrollOption: [{
                    name: '固定',
                    value: '0'
                }, {
                    name: '滚动',
                    value: '1'
                }],
                seatList: {
                    '1': '核心圈',
                    '2': '紧密圈',
                    '3': '协同圈'
                },
                seatOption: [{
                    name: '核心圈',
                    value: '1',
                }, {
                    name: '紧密圈',
                    value: '2'
                }, {
                    name: '协同圈',
                    value: '3'
                }],
                editName: '',
                editType: '',
                editScroll: '',
                editSeat: '',

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
            });
        };
        /**
         * [saveEdit description:保存]
         */
        // $scope.save = function() {
        //     if ($scope.status.startNew) {
        //         if (typeof Number($scope.status.newCODE) != 'number' || Number.isNaN(Number($scope.status.newCODE)) || $scope.status.newCODE == '' || $scope.status.newSTATEMENT == '') {
        //             trsconfirm.alertType('格式错误', 'code与code明文不能为空，且code必须为数字', 'error', false);
        //             return;
        //         };
        //         if ($scope.data.allCode.indexOf(Number($scope.status.newCODE)) > -1) {
        //             trsconfirm.confirmModel('覆盖', '该CODE已存在，是否覆盖', function() {
        //                 saveNew();
        //             });
        //         } else {
        //             saveNew();
        //         };
        //     } else {
        //         if ($scope.status.currEditCopy.STATEMENT == '') {
        //             trsconfirm.alertType('格式错误', 'code明文不能为空', 'error', false);
        //             return;
        //         };
        //         saveEdit();
        //     }
        // };
        $scope.save = function() {
            if ($scope.status.currEdit != '') {
                // if ($scope.status.editName == "" || $scope.status.editType == "") {
                //     trsconfirm.alertType('格式错误', '媒体名称与媒体类型不得为空', 'error', false);
                //     return;
                // }
                saveFn($scope.status.currEdit, $scope.status.editName, $scope.status.editType, $scope.status.editScroll.value, $scope.status.editSeat.value);
            } else {
                // if ($scope.status.newName == "" || $scope.status.newType == "") {
                //     trsconfirm.alertType('格式错误', '媒体名称与媒体类型不得为空', 'error', false);
                //     return;
                // }
                saveFn(Number($scope.data.items[$scope.data.items.length - 1].PRODUCT_ID) + 1, $scope.status.newName, $scope.status.newType, $scope.status.newScroll.value, $scope.status.newSeat.value);
            }
        };
        /**
         * [saveEdit description:保存编辑]
         */
        function saveFn(id, name, type, scroll, seat) {
            var params = {
                typeid: 'screen',
                serviceid: 'mediaclass',
                modelid: 'updateandsave',
                product_id: id,
                product_name: name,
                product_type: type,
                flag: scroll,
                quan_type: seat,
            };
            $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), params, 'get').then(function(data) {
                $scope.status.currEdit = "";
                $scope.status.startNew = false;
                trsconfirm.alertType("保存成功", "", "success", false, function() {
                    requestData();
                });
            });
        };
        /**
         * [startEdit description:开始编辑]
         */
        $scope.startEdit = function(item) {
            if ($scope.status.startNew) return;
            $scope.status.currEdit = item.PRODUCT_ID;
            $scope.status.editName = item.PRODUCT_NAME;
            $scope.status.editType = item.PRODUCT_TYPE;
            $scope.status.editScroll = $scope.status.scrollOption[Number(item.FLAG)];
            $scope.status.editSeat = $scope.status.seatOption[Number(item.QUAN_TYPE) - 1];
        };
        /**
         * [cancelNew description:取消新增]
         */
        $scope.startNew = function() {
            $scope.status.startNew = true;
            $scope.status.newName = '';
            $scope.status.newType = '';
            $scope.status.newScroll = $scope.status.scrollOption[0];
            $scope.status.newSeat = $scope.status.seatOption[0];
        };
        /**
         * [deleteItem description:删除]
         */
        $scope.deleteItem = function(item) {
            trsconfirm.confirmModel('删除', '确认删除', function() {
                var params = {
                    typeid: 'screen',
                    serviceid: 'mediaclass',
                    modelid: 'delete',
                    product_id: item.PRODUCT_ID,
                };
                $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), params, 'get').then(function(data) {
                    requestData();
                });
            });
        };
    }])
