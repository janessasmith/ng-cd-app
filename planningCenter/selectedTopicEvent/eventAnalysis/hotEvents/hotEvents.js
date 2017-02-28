"use strict";
/**
 *  hotEventsModule Module
 *
 * Description 策划中心 选题事件 事件分析 热门事件
 * rebuild: flj 2016-7-6
 */
angular.module('hotEventsModule', [])
    .controller('hotEventsController', ["$scope", "$filter", "trsHttpService",
        function($scope, $filter, trsHttpService) {
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
                $scope.params = {
                    "typeid": "event",
                    "eventid": 0,
                    "serviceid": "eventmgr",
                    "modelid": "publicevent",
                    "page_no": $scope.page.CURRPAGE,
                    "page_size": $scope.page.PAGESIZE,
                    "event_type": "public" //热门事件
                };
                $scope.status = {
                    jumpToPageNum: 1,
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
                });
            }
            /**
             * 将日期字符串转换为时间戳
             */
            $scope.timeStamp = function(item) {
                //var date = new Date();
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
             * [voiceLight description计算声量]
             * @return {[type]} [description]
             */
            $scope.voiceLight = function(item) {
                return {
                    width: (parseInt(item.EVENTTENDENCY) / parseInt(item.TOTALEVENTTENDENCY) * 100) + "%"
                };
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
            /**
             * [gotoEventDetail description点击进入详细页]
             * @param  {[type]} eventtype [description]
             * @param  {[type]} eventid   [description]
             * @return {[type]}           [description]
             */
            $scope.gotoEventDetail = function(eventtype, event) {
                if (event.TENDENCY_FLAG == true) {
                    var url = '#/eventdetail/eventanalyisbasicinfo?eventtype=' + eventtype + '&eventid=' + event.ID;
                    window.open(url, "_blank");
                }
            };
        }
    ]);
