"use strict";
/**
 *  timeCueModule Module
 *
 * Description 策划中心 选题事件 事件分析 事件管理
 * rebuild: flj 2016-5-24
 */
angular.module('eventManagermentModule', ['eventManagementModuleRouter', 'createHotEventModule'])
    .controller('eventManagermentController', ["$scope", "$filter", "trsHttpService", "calendarService", "uiCalendarConfig", "trsconfirm", "storageListenerService",
        function($scope, $filter, trsHttpService, calendarService, uiCalendarConfig, trsconfirm, storageListenerService) {
            initStatus();
            initData();

            function initStatus() {
                $scope.data = {
                    curEventManage: "manual",
                    items: "",
                    searchWord: ""
                };
                $scope.page = {
                    "CURRPAGE": 0,
                    "PAGESIZE": 10
                };
                $scope.params = {
                    "typeid": "event",
                    "eventid": 0,
                    "serviceid": "eventmgr",
                    "modelid": "hoteventlist",
                    "page_no": $scope.page.CURRPAGE,
                    "page_size": $scope.page.PAGESIZE,
                    "event_type": "public", //热门事件
                };
                $scope.status = {
                    jumpToPageNum: 1,
                    eventType: "public",
                    createType: 'manual'
                };
            }

            function initData() {
                requestData();
            }
            /**
             * [requestData description列表数据请求]
             * @return {[type]} [description]
             */
            function requestData() {
                if ($scope.data.keywords != "" && $scope.data.keywords != null) {
                    $scope.params.key_word = $scope.data.keywords;
                } else {
                    $scope.params.key_word = "";
                }
                if ($scope.data.curEventManage == 'recommendation') {
                    $scope.params.event_type = 'personal';
                    $scope.params.modelid = 'recommendevent';
                } else {
                    $scope.params.event_type = 'public';
                    $scope.params.modelid = 'hoteventlist';
                }
                $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), $scope.params, "get").then(function(data) {
                    $scope.data.items = data.CONTENT;
                    $scope.page = {
                        CURRPAGE: data.NUMBER + 1,
                        PAGESIZE: data.SIZE,
                        ITEMCOUNT: data.TOTALELEMENTS,
                        PAGECOUNT: data.TOTALPAGES
                    };
                });
            }
            /**
             * [getEventManageList description]点击‘热门事件列表’、‘部门推荐’tab切换相关操作开始
             * @return {[type]} [description]
             */
            $scope.getEventManageList = function(type) {
                $scope.data.curEventManage = type;
                $scope.params.page_no = 0;
                $scope.status.jumpToPageNum = 1;
                requestData();
            };
            /**
             * 将日期字符串转换为时间戳
             */
            $scope.timeStamp = function(thisTime) {
                return $filter("date")(thisTime, "yyyy-MM-dd hh:mm:ss").toString();
            };
            /**
             * [brokeMonitorSearch description;根据关键词检索(包含检索的分页列表信息)]
             * @param  {[type]} ev [description:按下空格也能提交]
             */
            $scope.queryListBySearchWord = function(ev) {
                if ((angular.isDefined(ev) && ev.keyCode == 13) || angular.isUndefined(ev)) {
                    $scope.params.page_no = 0;
                    $scope.status.jumpToPageNum = 1;
                    requestData();
                }
            };
            /**
             * [pageChanged description]分页请求
             * @return {[type]} [description]
             */
            $scope.pageChanged = function() {
                $scope.params.page_no = $scope.page.CURRPAGE - 1;
                $scope.status.jumpToPageNum = $scope.page.CURRPAGE;
                requestData();
            };

            $scope.jumpToPage = function() {
                if ($scope.status.jumpToPageNum > $scope.page.PAGECOUNT) {
                    $scope.status.jumpToPageNum = $scope.page.PAGECOUNT;
                }
                $scope.params.page_no = $scope.status.jumpToPageNum - 1;
                requestData();
            };

            $scope.deleteEvent = function(event) {
                trsconfirm.confirmModel("删除事件", "是否确认删除该事件", function() {
                    var params = {
                        "typeid": "event",
                        "eventid": event.ID,
                        "serviceid": "eventmgr",
                        "modelid": "delete"
                    };
                    $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), params, "get").then(function(data) {
                        trsconfirm.alertType("删除成功", "", "success", false, function() {
                            requestData();
                        });
                    });
                });
            };
            /**
             * [applypass description事件设为隐藏]
             * @param  {[type]} event [description]
             * @return {[type]}       [description]
             */
            $scope.sethidden = function(event) {
                /*console.log(event.hidden);*/
                var isShow = event.HIDDEN == false ? "隐藏" : "可见";

                trsconfirm.confirmModel("隐藏事件", "是否确认将该事件设为" + isShow, function() {
                    var params = {
                        "typeid": "event",
                        "eventid": event.ID,
                        "serviceid": "eventmgr",
                        "modelid": "sethidden",
                        "hidden": event.HIDDEN
                    };
                    $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), params, "get").then(function(data) {
                        trsconfirm.alertType("操作成功", "", "success", false, function() {

                            requestData();
                        });
                    });
                });
            };

        }
    ]);
