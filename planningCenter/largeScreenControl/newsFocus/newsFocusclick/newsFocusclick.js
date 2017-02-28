/*create by ma.rongqin 2016.8.4*/
"use strict"
angular.module('largeScreenCtrlNewsFocusClickModule', [])
    .controller('largeScreenCtrlNewsFocusClickCtrl', ['$scope', '$state', '$q', '$stateParams', 'trsHttpService',
        function($scope, $state, $q, $stateParams, trsHttpService) {
            initStatus();
            initData();
            /**
             * [initStatus description]初始化状态
             */
            function initStatus() {
                $scope.status = {
                    'fieldid': $stateParams.fieldid,
                    'hotspotids': $stateParams.hotspotids,
                    'selectedid': $stateParams.selectedid,
                    'currfield': $stateParams.currfield,
                    'currfieldName': decodeURIComponent($stateParams.currfieldname),
                    'currDraftId': '',
                };
                $scope.data = {
                    hotspot: [],
                    draftList: [],
                    detail: {
                        TITLE: '',
                        CONTENT: '',
                    },
                };
            };
            /**
             * [initData description]初始化数据
             */
            function initData() {
                saveFn($scope.status.fieldid, $scope.status.hotspotids + ';' + $scope.status.selectedid + ';' + $scope.status.currfield, '').then(function(isTrue) {
                    return getFn();
                }).then(function(data) {
                    dealDetail(data);
                });
            };
            /**
             * [saveFn description]保存方法
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
                $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), saveParams, 'get').then(function(isTrue) {
                    defer.resolve(isTrue);
                });
                return defer.promise;
            };
            /**
             * [getFn description]获取方法
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
            /**
             * [dealDetail description]处理详情
             */
            function dealDetail(_data) {
                var data = _data.defaultEntity;
                //detail
                $scope.data.detail = data;
                $scope.data.detail.CONTENT = dealBreakRow(data.CONTENT);
                //hotspot
                $scope.data.hotspot = [];
                for (var i = 0; i < data.SHORTTITLELIST.length; i++) {
                    $scope.data.hotspot.push({
                        TITLE: data.SHORTTITLELIST[i],
                        ID: data.HOTLIST[i]
                    });
                };
                //draftList
                $scope.data.draftList = [];
                for (var j = 0; j < 6; j++) {
                    $scope.data.draftList.push({
                        TITLE: data.DOCTITLELIST[j],
                        ID: data.LISTID[j]
                    });
                };
                $scope.status.currDraftId = data.LISTID[0];
            };
            /**
             * [returnFocusPage description]返回焦点页面
             */
            $scope.returnFocusPage = function() {
                $state.go('plan.newsfocus', {
                    returnfieldid: $scope.status.fieldid
                });
            };
            /**
             * [chooseHotspot description]选择热点
             */
            $scope.chooseHotspot = function(hotspot) {
                $scope.status.selectedid = hotspot.ID;
                saveFn($scope.status.fieldid, $scope.status.hotspotids + ';' + $scope.status.selectedid + ';' + $scope.status.currfield, '').then(function(isTrue) {
                    return getFn();
                }).then(function(data) {
                    dealDetail(data);
                })
            };
            /**
             * [chooseDraft description]选择文章
             */
            $scope.chooseDraft = function(draft) {
                $scope.status.currDraftId = draft.ID;
                saveFn($scope.status.fieldid, $scope.status.hotspotids + ';' + $scope.status.selectedid + ';' + $scope.status.currfield, $scope.status.currDraftId).then(function(isTrue) {
                    return getFn();
                }).then(function(data) {
                    $scope.data.detail = data.defaultEntity;
                    $scope.data.detail.CONTENT = dealBreakRow(data.defaultEntity.CONTENT);
                });
            };
            /**
             * [dealBreakRow description]处理换行
             */
            function dealBreakRow(data) {
                var content = data;
                content = content.replace(/\r\n/g, "<br/>");
                content = content.replace(/\r/g, "<br/>");
                content = content.replace(/\n/g, "<br/>");
                return content;
            }
        }
    ])
