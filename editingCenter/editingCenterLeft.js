'use strict';
angular.module('editingCenterLeftModule', ["ui.bootstrap", "treeControl"]).controller('editingCenterNavController', ['$q', "$timeout", '$stateParams', '$window', '$templateCache', "$filter", "$state", "$scope", "$rootScope",
    "trsHttpService", '$location', 'SweetAlert', "globleParamsSet", "trsconfirm", "editingCenterService", "websiteService",
    function($q, $timeout, $stateParams, $window, $templateCache, $filter, $state, $scope, $rootScope, trsHttpService, $location, SweetAlert, globleParamsSet, trsconfirm, editingCenterService, websiteService) {
        initStatus();
        initData();

        function initStatus() {
            $scope.test = {};
            $scope.test.cc = "cc";
            $scope.pathes = $location.path().split('/');
            $scope.status = {
                mediaType: {
                    "1": "app",
                    '2': 'website',
                    '3': 'newspaper',
                    '4': 'weixin',
                    '5': 'weibo'
                },
                order: ["newspaper", "website", "app", "weixin", "weibo"], //APP：1，网站：2，报纸：3，微信：4，微博：5
                //authority: {}, //权限
                tab: {
                    app: {
                        isTabSelect: false,
                    },
                    website: {
                        isTabSelect: false,
                    },
                    iWo: {
                        isTabSelect: false,
                    },
                    newspaper: {
                        isTabSelect: false,
                    },
                    weixin: {
                        isTabSelect: false,
                    },
                    weibo: {
                        isTabSelect: false,
                    }
                },
                more: {
                    moreTabList: [{
                        'name': 'APP',
                        'id': "app"
                    }, {
                        name: '网站',
                        id: 'website'
                    }, {
                        'name': '微博',
                        'id': "weibo"
                    }, {
                        'name': '微信',
                        'id': "weixin"
                    }],
                    moreTabListItem: {
                        'name': '网站',
                        'id': "website"
                    },
                    isMoreTabListShow: false,
                },
            };
            $scope.status.tab[$scope.pathes[2]].isTabSelect = true;
        }

        function initData() {
            // queryAllSites();   // 暂时注销
        }
        $scope.setTabSelected = function(param) {
            $scope.status.tab[param].isTabSelect = true;
            var willgo = 'editctr.' + param;
            if ($state.current.name.indexOf(willgo) >= 0) {
                $state.go($state.current.name, $stateParams, { reload: $state.current.name });
            } else {
                $state.go(willgo);
            }
        };
        /**
         * [queryAllSites description]查询可见产品
         */
        function queryAllSites() {
            var deffered = $q.defer();
            var params = {
                serviceid: "mlf_mediasite",
                methodname: "queryAllSites"
            };
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "post")
                .then(function(data) {
                    $scope.status.authority = {};
                    angular.forEach(data, function(_data, index, array) {
                        $scope.status.authority[$scope.status.mediaType[_data.MEDIATYPE]] = _data;
                    });
                    //给对象排序
                    var i = 0;
                    angular.forEach($scope.status.order, function(__data, __index, __array) {
                        if (angular.isDefined($scope.status.authority[__data])) {
                            $scope.status.authority[__data].index = i;
                            i++;
                        }
                    });
                    exchangePosition();
                    deffered.resolve();
                });
            return deffered.promise;
        }
        /*$scope.hasRight = function(product) {
            return $filter('filterBy')($scope.status.authority, ['MEDIATYPE'], $scope.status.mediaType[product]).length > 0 ? true : false;
        };*/
        //左侧导航箭头内的导航
        $scope.setMoreTabRouter = function(position) {
            //$scope.status.isThisTabShow = position;
            for (var i in $scope.status.authority) {
                if ($scope.status.authority[i].index === 1) {
                    var tempIndex = $scope.status.authority[position].index;
                    $scope.status.authority[position].index = 1;
                    $scope.status.authority[i].index = tempIndex;
                }
            }
            $scope.setTabSelected(position);
        };

        function exchangePosition() {
            var isThisTabShow = $state.current.name.split(".")[1];
            if (isThisTabShow !== "iWo" && $scope.status.authority[isThisTabShow].index >= 2) {
                $scope.setMoreTabRouter(isThisTabShow);
            }
        }

        $scope.showMore = function() {
            var index = 0;
            if (angular.isUndefined($scope.status.authority)) return;
            for (var i in $scope.status.authority) {
                index++;
            }
            var flag = true;
            if (index > 2) flag = true;
            else flag = false;
            return flag;
        };
        /**
         * [subscribeModal description] 获取可订阅的站点列表-弹窗
         * @return {[type]} [description]
         */
        $scope.querySitesOnSubscribeCenter = function() {
            editingCenterService.subscribeModal('标题', function(result) {
                console.log(result);
            });
        };
    }
]);
