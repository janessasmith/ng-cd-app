"use strict";
/**
 *  personalEventsModule Module
 *
 * Description 策划中心 选题事件 事件分析 个人事件库
 * rebuild: flj 2016-7-6
 */
angular.module('personalEventsModule', [])
    .controller('personalEventsController', ["$scope", "$filter", "trsconfirm", "trsHttpService",
        function($scope, $filter, trsconfirm, trsHttpService) {
            initStatus();
            initData();

            function initStatus() {
                $scope.page = {
                    "CURRPAGE": 0,
                    "PAGESIZE": 10
                };
                $scope.data = {
                    items: "",
                    keywords: ""
                };

                $scope.status = {
                    jumpToPageNum: 1,
                    isShowTips: false,
                    eventState: {
                        0: "--",
                        1: "等待审核",
                        2: "分析完成",
                        3: "申请驳回"
                    },
                    eventType: 'personal', //个人事件库
                    createType: 'manual'
                };
                $scope.params = {
                    "typeid": "event",
                    "eventid": 0,
                    "serviceid": "eventmgr",
                    "modelid": "personalevent",
                    "page_no": $scope.page.CURRPAGE,
                    "page_size": $scope.page.PAGESIZE,
                    "event_type": $scope.status.eventType
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
                $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), $scope.params, "get").then(function(data) {
                    $scope.data.items = data.CONTENT;
                    $scope.params.page_no = data.NUMBER;
                    $scope.params.page_size = data.SIZE;
                    $scope.page = {
                        CURRPAGE: data.NUMBER + 1,
                        PAGESIZE: data.SIZE,
                        ITEMCOUNT: data.TOTALELEMENTS,
                        PAGECOUNT: data.TOTALPAGES
                    };
                    /*$scope.page = {
                        CURRPAGE: data.NUMBER + 1,
                        PAGESIZE: data.size,
                        ITEMCOUNT: data.totalElements,
                        PAGECOUNT: data.totalPages
                    };*/
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
             * [showTitle description]鼠标移入显示标题详情
             * @param {[event]} event [description] 事件
             */
            $scope.showTips = function(item) {
                if (item.TENDENCY_FLAG === true && item.EVENTSTATE != '1') {
                    item.ISSHOWTIPS = true;
                }
            };
            /**
             * [applicationAnalysis description]申请分析
             * @param {[event]} event [description] 事件
             */
            $scope.applicationAnalysis = function(item) {
                var params = {
                    typeid: "event",
                    eventid: item.ID,
                    serviceid: "eventanalysis",
                    modelid: "analysis"
                };
                trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), params, "get")
                    .then(function(data) {
                        if (data.replace(/\n/g, "") === "true") {
                            trsconfirm.alertType("申请提交成功", "", "success", false);
                            item.EVENTSTATE = "1";
                            item.ISSHOWTIPS = false;
                        }
                    });
            };
            /**
             * [deleteUsers description]删除用事件
             * weiweiwei
             */
            $scope.deleteEvent = function(event) {
                trsconfirm.confirmModel("删除事件", "是否确认删除该事件", function() {
                    var params = {
                        "typeid": "event",
                        "eventid": event.ID,
                        "serviceid": "eventmgr",
                        "modelid": "delete"
                    };

                    trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), params, "get").then(function(data) {
                        if (data.replace(/\n/g, "") === "true")
                            trsconfirm.alertType("删除成功", "", "success", false, function() {
                                requestData();
                            });
                    });
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
                },function(data){
                    console.log("图片请求失败！"+data);
                });
            };
        }
    ]);
