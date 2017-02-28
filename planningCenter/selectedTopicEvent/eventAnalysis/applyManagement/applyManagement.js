"use strict";
/**
 *  applyManagermentModule Module
 *
 * Description 策划中心 选题事件 事件分析 申请管理
 * rebuild: flj 2016-7-6
 */
angular.module('applyManagermentModule', [])
    .controller('applyManagermentController', ["$scope", "$filter", "trsHttpService", "trsconfirm",
        function($scope, $filter, trsHttpService, trsconfirm) {
            initStatus();
            initData();

            function initStatus() {
                $scope.page = {
                    "CURRPAGE": 0,
                    "PAGESIZE": 10
                };
                $scope.data = {
                    items: "",
                    keywords: "",
                    totalCount: 0
                };

                $scope.status = {
                    jumpToPageNum: 1,
                    eventType: 'personal' //只针对个人事件

                };
                $scope.params = {
                    "typeid": "event",
                    "eventid": 0,
                    "serviceid": "eventmgr",
                    "modelid": "applyevent",
                    "page_no": $scope.page.CURRPAGE,
                    "page_size": $scope.page.PAGESIZE,
                    "event_type": $scope.status.eventType
                };

            }

            function initData() {
                getcount();
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
             * [voiceLight description计算声量]
             * @return {[type]} [description]
             */
            $scope.voiceLight = function(item) {
                return {
                    width: (parseInt(item.EVENTTENDENCY) / parseInt(item.TOTALEVENTTENDENCY) * 100) + "%"
                };
            };
            /**
             * 将日期字符串转换为时间戳
             */
            $scope.timeStamp = function(item) {
                return $filter("date")(item.STARTTIME, "yyyy-MM-dd").toString();
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
            /**
             * [deleteEvent description 点击：驳回]
             * @param  {[type]} event [description]
             * @return {[type]}       [description]
             */
            $scope.overRule = function(event) {
                var alertContent = "是否确认驳回该事件";
                trsconfirm.confirmModel("驳回事件", alertContent, function() {
                    var params = {
                        "typeid": "event",
                        "eventid": event.ID,
                        "serviceid": "eventanalysis",
                        "modelid": "overrule"
                    };

                    trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), params, "get").then(function(data) {
                        trsconfirm.alertType("操作成功", "", "success", false, function() {
                            requestData();
                        });
                    });
                });
            };
            /**
             * [applypass description点击：通过]
             * @param  {[type]} event [description]
             * @return {[type]}       [description]
             */
            $scope.applypass = function(event) {
                var alertContent = "是否确认通过该事件";
                trsconfirm.confirmModel("通过事件", alertContent, function() {
                    var params = {
                        "typeid": "event",
                        "eventid": event.ID,
                        "serviceid": "eventanalysis",
                        "modelid": "applypass"
                    };

                    trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), params, "get").then(function(data) {
                        trsconfirm.alertType("操作成功", "", "success", false, function() {
                            getcount();
                            requestData();
                        });
                    });
                });
            };
            /**
             * [recommend description点击：热门推荐]
             * @param  {[type]} item [description]
             * @return {[type]}      [description]
             */
            $scope.recommend = function(item) {
                var params = {
                    typeid: "event",
                    eventid: item.ID,
                    serviceid: "eventanalysis",
                    modelid: "recommend"
                };
                trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), params, "get")
                    .then(function(data) {
                        if (data.replace(/\n/g, "") === "true") {
                            trsconfirm.alertType("推荐成功", "", "success", false);
                            item.RECOMMEND = true;
                        }
                    });
            };

            /**
             * [applypass description部门每天还可分析通过的事件次数]
             * @param  {[type]} event [description]
             * @return {[type]}       [description]
             */
            function getcount() {
                var params = {
                    "typeid": "event",
                    "eventid": 0,
                    "serviceid": "eventanalysis",
                    "modelid": "getcount",
                    "event_id": 0
                };

                trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), params, "get").then(function(data) {;
                    $scope.data.totalCount = data.TOTALCOUNT;
                });
            };

            /**
             * [dealImg description处理图片]
             * @return {[type]} [description]
             */
            /*$scope.dealImg = function(item) {
                var img = new Image();
                if (item.IMAGEURL === "") {
                    item.IMAGEURL = "./planningCenter/selectedTopicEvent/eventAnalysis/images/imgnotfound.jpg";
                    return;
                }
                img.src = item.IMAGEURL;
                img.onload = function() {
                    item.IMAGEURL = item.IMAGEURL;
                };
                img.error = function() {
                    item.IMAGEURL = "./planningCenter/selectedTopicEvent/eventAnalysis/images/imgnotfound.jpg";
                };
            };*/
            /**
             * [dealImg description单独接口获取图片]
             * @param  {[type]} item [description]
             * @return {[type]}      [description]
             */
            $scope.dealImg = function(item) {
                var params = {
                    "typeid": "event",
                    "eventid": item.ID,
                    "serviceid": "eventmgr",
                    "modelid": "image",
                    /*"evnet_id": item.ID*/
                };
                trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), params, "get").then(function(data) {
                    item.IMAGEURL = data.IMAGEURL;
                    var img = new Image();
                    if (item.IMAGEURL === "") {
                        item.IMAGEURL = "./planningCenter/selectedTopicEvent/eventAnalysis/images/imgnotfound.jpg";
                        return;
                    }
                    img.src = item.IMAGEURL;
                    img.onload = function() {
                        item.IMAGEURL = item.IMAGEURL;
                    };
                    img.error = function() {
                        item.IMAGEURL = "./planningCenter/selectedTopicEvent/eventAnalysis/images/imgnotfound.jpg";
                    };
                });
            };

        }
    ]);
