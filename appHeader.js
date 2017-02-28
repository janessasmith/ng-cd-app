'use strict';
angular.module('headModule', [])
    .controller('HeaderController', ['$scope', '$q', '$interval', '$filter', '$rootScope', '$state', '$location', '$timeout', 'localStorageService', "trsHttpService", 'trsconfirm', 'loginService', 'versionCtrl',
        function($scope, $q, $interval, $filter, $rootScope, $state, $location, $timeout, localStorageService, trsHttpService, trsconfirm, loginService, versionCtrl) {
            initStatus();
            initData();
            var closeUnreadTip;
            var checktimeout;

            function initStatus() {
                $scope.data = {
                    user: {},
                    unreadListLen: '',
                };
                $scope.status = {
                    isUnreadIconShow: false,
                    isUnreadTipShow: false
                };
                $scope.currModule = $location.path().split("/")[1];
                // console.log($scope.currModule);
                $scope.headTab = {
                    'plan': false,
                    'editctr': false,
                    'manageconfig': false,
                    'resourcectrl': false,
                    'operatecenter': false,
                    'retrieval': false,
                    'visualizationcenter': false
                };
                $scope.headTab[$scope.currModule] = true;
                getResourceCenterAccess();
                $scope.headParams = {
                    serviceid: 'mlf_extuser',
                    methodname: 'getUserHeadPic',
                };
                $scope.headPic = '';
                //初始化一级模块访问权限开始
                /*if (angular.isDefined($rootScope.status) && angular.isDefined($rootScope.status.basicAccess)) {
                    $scope.status.basicAccess = $rootScope.status.basicAccess;
                } else {*/
                getBasicAccess();
                //}
                //获得最后点击已收稿库的时间
                $scope.lastUnreadTime = localStorageService.get('lastUnreadTime') || '';
                //获取最后查询未读稿件详情的时间
                $scope.lastUnreadTipeTime = localStorageService.get('lastUnreadTipeTime') || '';
            }

            function initData() {
                loginService.getCurrLoginUser().then(function(data) {
                    $scope.data.user = data;
                });
                getUnreadCounts();
                $scope.promise = $interval(getUnreadCounts, 180000);
                // $rootScope.$on("isUnreadEvent", function(event, data) {
                //     $scope.status.isUnreadIconShow = data == "0" ? false : true;
                // });
                //trsHttpService.httpServer(trsHttpService.getWCMRootUrl(),{},"post")
                headPortrait();
            }
            $scope.logout = function() {
                loginService.logout().then(function() {
                    localStorageService.remove("currLoginUser");
                    localStorageService.remove("mlfCachedUser");
                    if (versionCtrl.isDev || versionCtrl.isDebug) {
                        $state.go("login", { reload: true });
                    } else {
                        var curUrl = window.location.href;
                        var curUrlArray = curUrl.split("/");
                        window.location.href = "https://" + curUrlArray[2] + "/login/login.html"
                    }
                }, function(data) {
                    trsconfirm.alertType('退出异常！', data.msg, "warning", false);
                });
            };

            function getUnreadCounts() {
                var params = {
                    "serviceid": "mlf_releasesource",
                    "methodname": "queryReceivedReleaseUnreadCount",
                    "OperTime": $scope.lastUnreadTime,
                };
                trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, 'get').then(function(data) {
                    if (data.replace(/\"/g, "") == "0") {
                        $rootScope.isUnreadIconShow = false;
                    } else {
                        $rootScope.isUnreadIconShow = true;
                    }
                    //未读消息浮框
                    getUnreadDetail();
                    //只要这一行
                    // $rootScope.isUnreadIconShow =data.replace(/\"/g, "") == "0" ? false : true;
                    // 只要上一行
                    // $scope.$emit("isUnreadEvent", data.replace(/\"/g, ""));
                });
            }
            //监听
            $rootScope.$on('lastUnreadTime', function(event, data) {
                $scope.lastUnreadTime = $filter('date')(new Date(), "yyyy-MM-dd HH:mm:ss").toString();
                localStorageService.set('lastUnreadTime', $scope.lastUnreadTime);
                $scope.lastUnreadTipeTime = $filter('date')(new Date(), "yyyy-MM-dd HH:mm:ss").toString();
                localStorageService.set('lastUnreadTipeTime', $scope.lastUnreadTipeTime);
                getUnreadCounts();
            });
            //获取头像
            function headPortrait() {
                trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), $scope.headParams, "get").then(function(data) {
                    $scope.headPic = data.USERHEAD[0].PERPICURL == '' ? './editingCenter/app/images/user_icon.jpg' : data.USERHEAD[0].PERPICURL;
                });
            }
            //资源中心访问控制
            function getResourceCenterAccess() {
                var params = {
                    serviceid: "mlf_metadataright",
                    methodname: "queryOperTypesBySourceModal",
                    Classify: "source"
                };
                trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get")
                    .then(function(data) {
                        data.push("iwo");//iwo不需要权限控制
                        var resourceCenterAccesses = {};
                        for (var i = 0; i < data.length; i++) {
                            resourceCenterAccesses[data[i]] = true;
                        }
                        $rootScope.status = angular.isDefined($rootScope.status) ? $rootScope.status : {};
                        $rootScope.status.resourceCenterAccesses = resourceCenterAccesses;
                        $scope.status.resourceCenterAccess = data[0];
                    });
            }
            //进入资源中心
            $scope.goToResourceCenter = function() {
                $state.go("resourcectrl." + $scope.status.resourceCenterAccess, "", { reload: true });
            };
            $rootScope.$on('updateHeadPortrait', function(event, data) {
                headPortrait();
            });
            /**
             * [getBasicAccess description：获取一级模块访问权限
             * @param  {[null]}  [description]
             * @return {[null]}  [description]
             */
            function getBasicAccess() {
                var params = {
                    serviceid: "mlf_metadataright",
                    methodname: "queryMlfChildModalsWithRight",
                };
                trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get")
                    .then(function(data) {
                        var basicAccess = {};
                        for (var i = 0; i < data.length; i++) {
                            basicAccess[data[i]] = true;
                        }
                        if (angular.isDefined($rootScope.status)) {
                            $rootScope.status.basicAccess = basicAccess;
                            $scope.status.basicAccess = basicAccess;
                        } else {
                            $rootScope.status = {
                                basicAccess: basicAccess
                            };
                            $scope.status.basicAccess = basicAccess;
                        }
                    });
            }
            /**
             * [getUnreadDetail description：]获取未读稿件的详情
             */
            function getUnreadDetail() {
                var params = {
                    serviceid: 'mlf_releasesource',
                    methodname: 'remindReceivedReleaseUnread',
                    OperTime: $scope.lastUnreadTipeTime,
                };
                params.OperTime == '' && delete params.OperTime;
                trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, 'get').then(function(data) {
                    $scope.unreadList = data;
                    if (data.length > 0) {
                        $scope.status.isUnreadTipShow = true;
                        closeUnreadTip = $timeout(function() {
                            $scope.lastUnreadTipeTime = $filter('date')(new Date(), "yyyy-MM-dd HH:mm:ss").toString();
                            localStorageService.set("lastUnreadTipeTime", $scope.lastUnreadTipeTime);
                            $scope.status.isUnreadTipShow = false;
                        }, 10000);
                    } else {
                        $scope.status.isUnreadTipShow = false;
                    }
                });
            }
            /**
             * [unreadPreview description：]点击未读稿件进入详情页
             */
            $scope.unreadPreview = function(item) {
                var preview = $state.href('iwopreview', {
                    'chnldocid': item.CHNLDOCID,
                    'metadataid': item.DOCID,
                    'modalname': 'iwo.received',
                    'type': item.DOCTYPE
                });
                window.open(preview);
            };
            /**
             * [closeUnreadTip description：]关掉消息提醒
             */
            $scope.closeUnreadTip = function() {
                $scope.lastUnreadTipeTime = $filter('date')(new Date(), "yyyy-MM-dd HH:mm:ss").toString();
                localStorageService.set("lastUnreadTipeTime", $scope.lastUnreadTipeTime);
                $scope.status.isUnreadTipShow = false;
            };
        }
    ]);
/**
 * html: <media-header></media-header>
 */
