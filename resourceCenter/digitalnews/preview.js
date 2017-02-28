angular.module('resCenDigitalPreviewModule', [
        'resCenDigitalPreviewDetailModule',
        'resCenDigitalPreviewOtherDetailModule',
    ])
    .controller('resCenDigitalPreviewCtrl', ['$scope', '$state', '$stateParams', 'resourceCenterService', "trsHttpService", "trsconfirm", 'dateFilter',
        function($scope, $state, $stateParams, resourceCenterService, trsHttpService, trsconfirm, dateFilter) {
            initStatus();
            initData();
            /**
             * [initStatus description]初始化状态函数开始
             * @return {[type]} [description] null
             */
            function initStatus() {
                $scope.page = {
                    CURRPAGE: 1,
                    PAGESIZE: 12,
                    ITEMCOUNT: 0,
                    PAGECOUNT: 1,
                };
                $scope.status = {
                    currModule: "szb",
                };
                $scope.params = {};
                $scope.data = {
                    timeArray: [],
                    selectedTime: [],
                    startTime: '',
                    endTime: '',
                };

                $scope.basicParams = {
                    channelName: $scope.status.currModule,
                    typeName: $stateParams.typename,
                    nodeId: $stateParams.nodeid
                };
                //集团成品库与其他地方使用不同的接口
                classifyParams();
            };
            /**
             * [initStatus description]初始化请求数据函数开始
             * @return {[type]} [description] null
             */
            function initData() {
                initDropDown();
                requestData();
            };
            /**
             * [requestData description]请求数据
             * @return {[type]} [description] null
             */
            function requestData() {
                var params = angular.copy($scope.params);
                params.keyword = JSON.stringify(params.keyword);
                $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), params, "post").then(function(data) {
                    $scope.data.items = data.content;
                    $scope.page = data.summary_info;
                })
            };
            /**
             * [classifyParams description]params分类
             * @return {[type]} [description] null
             */
            function classifyParams() {
                var jtcpgParams = {
                    serviceid: 'jtcpg',
                    typeId: 'zyzx',
                    modelid: 'getBmList',
                    channelName: $scope.status.currModule,
                    typeName: $stateParams.typename,
                    nodeId: $stateParams.nodeid,
                    pageSize: $scope.page.PAGESIZE,
                    pageNum: $scope.page.CURRPAGE,
                    time: "",
                    keyword: {
                        time: '',
                    },
                };
                var otherParams = {
                    serviceid: 'epaper',
                    typeId: 'zyzx',
                    modelid: 'getBmList',
                    nodeId: $stateParams.nodeid,
                    pageSize: $scope.page.PAGESIZE,
                    pageNum: $scope.page.CURRPAGE,
                    // time: "",
                    keyword: {
                        time: '',
                    },
                };
                $scope.params = $stateParams.nodeid.indexOf('005001') > -1 ? jtcpgParams : otherParams;
            };
            /**
             * [initDropDown description]初始化下拉框
             * @return {[type]} [description] null
             */
            function initDropDown() {
                var params = {
                    menuName: "time",
                    modelid: "getSearchMenu",
                    serviceid: $scope.status.currModule,
                };
                params = angular.extend(params, $scope.basicParams);
                resourceCenterService.getListDownData(params, "time", function(data) {
                    $scope.data.timeArray = data;
                    $scope.data.selectedTime = data[0];
                });
            };
            /**
             * [searchWithKeyword description]条件过滤
             */
            $scope.searchWithKeyword = function(key, selected) {
                $scope.params.keyword[key] = selected.value;
                $scope.params.pageNum = '1';
                requestData();
            };
            /**
             * [pageChanged description]分页
             * @return {[type]} [description]
             */
            $scope.pageChanged = function() {
                $scope.params.pageNum = $scope.page.CURRPAGE;
                requestData();
            };
            // $scope.$watch("page.CURRPAGE", function(newValue) {
            //     if (newValue > 0) {
            //         $scope.jumpToPageNum = newValue;
            //     }
            // });
            /*跳转指定页面*/
            // $scope.jumpToPage = function() {
            //     if ($scope.jumpToPageNum > $scope.page.PAGECOUNT) {
            //         $scope.page.CURRPAGE = $scope.page.PAGECOUNT;
            //         $scope.jumpToPageNum = $scope.page.CURRPAGE;
            //     }
            //     $scope.status.CurrPage = $scope.jumpToPageNum;
            //     $scope.params.pageNum = angular.copy($scope.jumpToPageNum);
            //     requestData();
            // };
            /**
             * [toPreviewDetail description]初始化请求数据函数开始
             * @return {[type]} [description] null
             */
            $scope.toPreviewDetail = function(item) {
                if ($stateParams.nodeid.indexOf('005001') > -1) {
                    var router = $state.href('digitaldetailjtcpg', {
                        nodeid: $stateParams.nodeid,
                        bc: item.BC,
                        docpubtime: item.DOCPUBTIME,
                        serviceid: $scope.params.serviceid,
                        papername: item.ZB_SOURCE_SITE
                    });
                } else {
                    var router = $state.href('digitaldetailother', {
                        nodeid: $stateParams.nodeid,
                        bc: item.BC,
                        docpubtime: item.IR_URLTIME,
                        serviceid: $scope.params.serviceid,
                        papername: item.IR_SITENAME
                    });
                }
                window.open(router + "&" + Math.random());
            };
            /**
             * [dealPic description]重新拷贝图片路径并加上随机数，使每次发起不同的请求
             * @return {[type]} [description] null
             */
            $scope.dealPic = function(item) {
                item.JPPATH = item.JPPATH + "?random=" + Math.random();
            };

        }
    ])
