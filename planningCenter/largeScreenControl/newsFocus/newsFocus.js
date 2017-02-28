"use strict";
/*
author:SMG
date:2016-08-01
 */
angular.module("largeScreenControlNewsFocusModule", [
        "largeScreenControlNewsFocusRouterModule",
        "largeScreenCtrlNewsFocusClickModule",
        "newsFocusServiceModule"
    ])
    .controller("largeScreenControlNewsFocusCtrl", ['$scope', '$state', '$stateParams', '$q', 'trsHttpService', 'newsFocusServiceSelecet', 'trsspliceString',
        function($scope, $state, $stateParams, $q, trsHttpService, newsFocusServiceSelecet, trsspliceString) {
            initStatus();
            initData();
            /**
             * [initStatus description:初始化状态]
             */
            function initStatus() {
                $scope.status = {
                    fieldOption: [],
                    fieldOrder: [],
                    returnFieldId: !!$stateParams.returnfieldid ? $stateParams.returnfieldid.split(';') : false,
                };
                $scope.data = {
                    field0: {
                        'list': [],
                        'selected': {},
                    },
                    field1: {
                        'list': [],
                        'selected': {},
                    },
                    field2: {
                        'list': [],
                        'selected': {},
                    },
                    field3: {
                        'list': [],
                        'selected': {},
                    },
                    field4: {
                        'list': [],
                        'selected': {},
                    },
                    field5: {
                        'list': [],
                        'selected': {},
                    },
                    field6: {
                        'list': [],
                        'selected': {},
                    },
                };
            };
            /**
             * [initData description:初始化数据]
             */
            function initData() {
                initDropDown();
                initHotspot();
            };

            /**
             * [initDropDown description:初始化下拉框]
             */
            function initDropDown() {
                $scope.status.fieldOption = newsFocusServiceSelecet.fieldType();
                $scope.status.returnFieldId ? returnDropDownFn() : initDropDownFn();
            };
            /**
             * [initDropDownFn description:初始化页面下拉框排序方法]
             */
            function initDropDownFn() {
                var index = 0;
                angular.forEach($scope.status.fieldOption, function(value, key) {
                    switch (value.name) {
                        case '政治':
                            $scope.data['field' + index].selected = value;
                            $scope.status.fieldOrder[index] = value.value;
                            index++;
                            break;
                        case '财经':
                            $scope.data['field' + index].selected = value;
                            $scope.status.fieldOrder[index] = value.value;
                            index++;
                            break;
                        case '司法':
                            $scope.data['field' + index].selected = value;
                            $scope.status.fieldOrder[index] = value.value;
                            index++;
                            break;
                        case '社会':
                            $scope.data['field' + index].selected = value;
                            $scope.status.fieldOrder[index] = value.value;
                            index++;
                            break;
                        case '人文':
                            $scope.data['field' + index].selected = value;
                            $scope.status.fieldOrder[index] = value.value;
                            index++;
                            break;
                        case '科技':
                            $scope.data['field' + index].selected = value;
                            $scope.status.fieldOrder[index] = value.value;
                            index++;
                            break;
                        case '体育':
                            $scope.data['field' + index].selected = value;
                            $scope.status.fieldOrder[index] = value.value;
                            index++;
                            break;
                    };
                });
            };
            /**
             * [returnDropDownFn description:返回页面时下拉框排序方法]
             */
            function returnDropDownFn() {
                angular.forEach($scope.status.returnFieldId, function(fieldId, index) {
                    angular.forEach($scope.status.fieldOption, function(field, key) {
                        if (field.value == fieldId) {
                            $scope.data['field' + index].selected = field;
                            $scope.status.fieldOrder[index] = field.value;
                        };
                    });
                });
            };
            /**
             * [initHotspot description:初始化热点]
             */
            function initHotspot() {
                saveFn($scope.status.fieldOrder.join(';'), "", "").then(function() {
                    return getFn();
                }).then(function(hotspotObj) {
                    getList(hotspotObj.field);
                });
            };
            /**
             * [queryHotsopt description:查询热点]
             */
            $scope.queryHotsopt = function(field, index) {
                $scope.status.fieldOrder[index] = $scope.data[field].selected.value;
                saveFn($scope.status.fieldOrder.join(';'), "", "").then(function() {
                    return getFn();
                }).then(function(hotspotObj) {
                    getList(hotspotObj.field);
                });
            };
            /**
             * [getList description:将数据整理成列表]
             */
            function getList(data) {
                var hotspotObj = {};
                for (var i = 0; i < data.length; i++) {
                    for (var j in data[i]) {
                        hotspotObj[j] = data[i][j];
                    };
                };
                angular.forEach($scope.data, function(value, key) {
                    value.list = hotspotObj[value.selected.value];
                });
            };
            /**
             * [clickToDetail description:查询热点]
             */
            $scope.clickToDetail = function(field, hotspot) {
                $state.go('plan.newsfocus.newsfocusclick', {
                    fieldid: $scope.status.fieldOrder.join(';'),
                    hotspotids: trsspliceString.spliceString($scope.data[field].list, "ID", ","),
                    selectedid: hotspot.ID,
                    currfield: $scope.data[field].selected.value,
                    currfieldname: encodeURIComponent($scope.data[field].selected.name),
                })
            };
            /**
             * [saveFn description:保存方法]
             */
            function saveFn(fields, status, hotguid) {
                var defer = $q.defer(),
                    saveParams = {
                        typeid: 'screen',
                        serviceid: 'feildlayout',
                        modelid: 'save',
                        fields: fields,
                        status: status,
                        hotguid: hotguid,
                    };
                $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), saveParams, 'get').then(function(data) {
                    defer.resolve(data);
                });
                return defer.promise;
            };
            /**
             * [getFn description:获取方法]
             */
            function getFn() {
                var defer = $q.defer(),
                    getParams = {
                        typeid: 'screen',
                        serviceid: 'hotpointrefact',
                        modelid: 'hotpointnews',
                    };
                $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), getParams, 'get').then(function(data) {
                    defer.resolve(data);
                });
                return defer.promise;
            };
        }
    ]);
