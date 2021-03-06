"use strict";
/**
 *  timeCueModule Module
 *
 * Description 策划中心 信息监控 实时线索 爆料监控
 * rebuild: SMG 2016-5-24
 */
angular.module('timeCueBrokeMonitorModule', [])
    .controller('timeCueBrokeMonitorController', ["$scope", '$window', '$q', '$filter', '$stateParams', 'trsHttpService', 'trsspliceString', 'trsconfirm',
        function($scope, $window, $q, $filter, $stateParams, trsHttpService, trsspliceString, trsconfirm) {
            initStatus();
            initData();

            function initStatus() {
                $scope.page = {
                    "CURRPAGE": 0,
                    "PAGESIZE": 10
                };
                $scope.data = {
                    items: "",
                    weiboCliques: "",
                    keywords: "",
                    selectedCliques: [],
                    start_pos: 0,
                    lastpage_no: 0
                };
                $scope.params = {
                    "serviceid": "weibobomb",
                    "modelid": "content",
                    "page_no": $scope.page.CURRPAGE,
                    "page_size": $scope.page.PAGESIZE,
                    /*
                                        "start_pos":,
                                        "lastpage_no":$scope.*/
                };
                $scope.status = {
                    jumpToPageNum: 1,
                    showWeiboCliques: true,
                    showKeywords: ""
                };
            }
            /**
             * [initData description]初始化数据
             * @return {[type]} [description]
             */
            function initData() {
                getWeiboCliques();
                requestData();
            }
            /**
             * [getWeiboCliques description]初始化右侧微博集团
             * @return {[obj]} [description]
             */
            function getWeiboCliques() {
                var params = {
                    "serviceid": "weibobomb",
                    "modelid": "config"
                }
                trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), params, "get").then(function(data) {
                    $scope.data.weiboCliques = data;
                    for (var i = $scope.data.weiboCliques.length - 1; i >= 0; i--) {
                        if ($scope.data.weiboCliques[i].SELECTED == 1) {
                            $scope.data.selectedCliques.push($scope.data.weiboCliques[i]);
                        }
                    }
                });
            }
            /**
             * [initBigPicsStatus description设置大图默认不展示]
             * @return {[type]} [description]
             */
            function initBigPicsStatus() {
                angular.forEach($scope.data.items, function(data, index, array) {
                    data.showBigPic = false;
                });
            }
            /**
             * [requestData description]数据请求函数(微博爆料数据分页获取)
             * @return {[obj]} [description]
             */
            function requestData() {
                $scope.params.start_pos = $scope.data.start_pos;
                $scope.params.lastpage_no = $scope.data.lastpage_no;
                $scope.params.search_word = angular.isDefined($scope.data.keywords) ? $scope.data.keywords : "";
                $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), $scope.params, "get").then(function(data) {
                    $scope.data.items = data.PAGEITEMS;
                    if ($scope.data.items.length > 0) {
                        initBigPicsStatus();
                        $scope.data.start_pos = $scope.data.items[$scope.data.items.length - 1].CURRENTPOS;
                    }
                    $scope.page = {
                        CURRPAGE: data.PAGEINDEX + 1,
                        PAGESIZE: data.PAGESIZE,
                        ITEMCOUNT: data.TOTALITEMCOUNT,
                        PAGECOUNT: data.PAGETOTAL
                    };
                    $scope.data.lastpage_no = $scope.page.CURRPAGE;
                });
            }

            /**
             * [hideBigPics description隐藏幻灯片大图]
             * @return {[type]} [description]
             */
            /*$scope.hideBigPics = function(item) {
                item.showBigPic = false;
            };*/
            /**
             * [brokeMonitorSearch description;根据关键词检索(包含检索的分页列表信息)]
             * @param  {[type]} ev [description:按下空格也能提交]
             */
            $scope.queryListBySearchWord = function(ev) {
                if ((angular.isDefined(ev) && ev.keyCode == 13) || angular.isUndefined(ev)) {
                    $scope.params.page_no = 0;
                    $scope.status.jumpToPageNum = 1;
                    $scope.data.start_pos = 0;
                    $scope.data.lastpage_no = 0;
                    $scope.status.showKeywords = $scope.data.keywords;
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
                gotoTop();
            };

            $scope.jumpToPage = function() {
                if ($scope.status.jumpToPageNum > $scope.page.PAGECOUNT) {
                    $scope.status.jumpToPageNum = $scope.page.PAGECOUNT;
                }
                $scope.params.page_no = $scope.status.jumpToPageNum - 1;
                requestData();
                gotoTop();
            };
            /**
             * [gotoTop description点击分页后，回到头部]
             * @return {[type]} [description]
             */
            function gotoTop() {
                $('html, body').animate({ scrollTop: 0 }, 'nomal');
            }
            /**
             * [selectedWeiboCliques description 选择微博集团:选中/未选中]
             * @param  {[type]} group [description]
             * @return {[type]}       [description]
             */
            $scope.selectedWeiboCliques = function(clique) {
                if ($scope.data.selectedCliques.indexOf(clique) < 0) {
                    $scope.data.selectedCliques.push(clique);
                    clique.SELECTED = 1;
                } else {
                    $scope.data.selectedCliques.splice($scope.data.selectedCliques.indexOf(clique), 1);
                    clique.SELECTED = 0;
                }
            };
            /**
             * 将日期字符串转换为时间戳
             */
            $scope.timeStamp = function(item) {
                var date = new Date(Date.parse(item.CREATEDAT));
                return $filter("date")(date, "yyyy-MM-dd HH:mm:ss").toString();
            };
            /**
             * [saveAndWatch description 保存并查看]
             * @return {[type]} [description]
             */
            $scope.saveAndWatch = function() {
                $scope.data.keywords = ""; //清空检索词
                if ($scope.data.selectedCliques.length == 0) {
                    trsconfirm.alertType('请选择集团微博', "", "warning", false);
                    return;
                }
                var params = {
                    "serviceid": "weibobomb",
                    "modelid": "saveconfig",
                    "page_no": 0,
                    "page_size": $scope.page.PAGESIZE,
                    "accounts": trsspliceString.spliceString($scope.data.selectedCliques, "ACCOUNT", ",")
                };
                $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), params, "get").then(function(data) {
                    $scope.data.items = data.PAGEITEMS;
                    $scope.page = {
                        CURRPAGE: data.PAGEINDEX + 1,
                        PAGESIZE: data.PAGESIZE,
                        ITEMCOUNT: data.TOTALITEMCOUNT,
                        PAGECOUNT: data.PAGETOTAL
                    };
                });
            };
            /**
             * [clearKeywords description清除检索条件]
             * @return {[type]} [description]
             */
            $scope.clearKeywords = function() {
                $scope.status.showKeywords = $scope.data.keywords = "";
                requestData();
            };
            /**
             * [showLargeImgs description点击展示大图]
             * @param  {[type]} item [description]
             * @return {[type]}      [description]
             */
            /*$scope.showBigPics = function(item) {
                initBigPicsStatus();
                item.showBigPic = true;
            };*/
            //监听鼠标点击事件
            /*$window.addEventListener("storage", function(e) {
                angular.forEach($scope.data.items, function(data, index, array) {
                    if(data.showBigPic==true){
                        data.showBigPic= false;
                    }
                });
            });*/
        }
    ]);
