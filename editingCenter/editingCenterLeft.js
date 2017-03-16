'use strict';
angular.module('editingCenterLeftModule', ["ui.bootstrap", "treeControl"]).controller('editingCenterNavController', ['$q', "$timeout", '$stateParams', '$window', '$templateCache', "$filter", "$state", "$scope", "$rootScope",
    "trsHttpService", '$location', 'SweetAlert', "globleParamsSet", "trsconfirm", "editingCenterService", "websiteService",
    function($q, $timeout, $stateParams, $window, $templateCache, $filter, $state, $scope, $rootScope, trsHttpService, $location, SweetAlert, globleParamsSet, trsconfirm, editingCenterService, websiteService) {
        initStatus();
        initData();

        function initStatus() {
            $scope.pathes = $location.path().split('/');
            $scope.status = {
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
            };
            $scope.status.tab[$scope.pathes[2]].isTabSelect = true;

            $scope.data = {
                subsItems: [],
                sitesChannels: []
            };
        }

        function initData() {
            addSubscribeSite(1);
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
         * [subscribeModal description] 获取可订阅的站点列表-弹窗
         * @return {[type]} [description]
         */
        $scope.querySitesOnSubscribeCenter = function() {
            editingCenterService.subscribeModal(function(params) {
                $timeout(function() {
                    addSubscribeSite(1);
                }, 100);
            });
        };

        function addSubscribeSite(site) {
           var param = {
                serviceid: "gov_site",
                methodname: "querySubscribeSitesOnEditorCenter",
                MediaType: site
                // MediaType: site
            };
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), param, 'get').then(function(data) {
                $scope.data.subsItems = data;
            });
        }

        /**
         * 判断对象是否为空
         * @param  {[type]}  e [description]
         * @return {Boolean}   [description]
         */
        function isEmptyObject(e) {
            var t;
            for (t in e)
                return !1;
            return !0;
        }

        $scope.querySubscribeChannels = function(site) {
            var param = {
                "serviceid": "gov_site",
                "methodname": "querySubscribeChannelsOnEditorCenter",
                "SiteId": site.SITEID
            };
            if (!site.subsChannel) {
                trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), param, 'get').then(function(data) {
                    site.subsChannel = data;
                });
            }
        };

        $scope.removeSubscribeChannel = function(channelid, site, index) {
            var param = {
                "serviceid": "gov_site",
                "methodname": "removeSubscribeChannel",
                "ChannelId": channelid
            };
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), param, 'get').then(function(data) {
                site.subsChannel.splice(index, 1);
            });
        };
    }
]);
