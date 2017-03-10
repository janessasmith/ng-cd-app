'use strict';
/**
    Create by zheng.lu 2017-03-08
*/
angular.module("subscribeModalMudule",['subscribeServiceModule'])
    .controller("subscribeModalCtrl", ["$scope", "$modalInstance", "subscribeService", "trsHttpService", "trsconfirm", function($scope, $modalInstance, subscribeService, trsHttpService, trsconfirm) {
        initStatus();
        initData();

        /**
         * [initStatus description: 初始化状态]
         * @return {[type]} [description]
         */
        function initStatus() {
            $scope.data = {
                subscribeMedias: subscribeService.initSubscribeMedia(),
                subscribeMediasCur: {
                    mediaType: 1
                },
                subscribeSiteidCur: {},
                sitesChannels: [],
                website: {
                    selectedItem: ""   // website被选中的
                },
                app: {
                    selectedItem: ""   // app被选中的
                },
                weixin: {
                    selectedItem: ""   // weixin被选中的
                },
                weibo: {
                    selectedItem: ""   // weibo被选中的
                }
            };
            $scope.path = {
                pathArray: []
            };
        }

        function initData() {
            queryWebsite();
            // querySitesOnSubcribeCenter();
        }

        /**
         * [cancel description: 弹窗 取消按钮]
         * @return {[type]} [description]
         */
        $scope.cancel = function() {
            $modalInstance.dismiss('111');
        };

        /**
         * [setCurMedia description] 点击渠道切换
         * @param {[type]} media [description] 渠道
         * @param {[type]} index [description]  序列号
         */
        $scope.setCurMedia = function(media, index) {
            $scope.data.subscribeMediasCur = media;
            if ($scope.data[$scope.data.subscribeMediasCur.type].lists) return; //请求过后退出
            var temp = media.type.replace(/(\w)/, function(v) {
                return v.toUpperCase();
            }); //首字母大写
            eval("query" + temp + "()");
        };

        /**
         * [querySitesOnSubcribeCenter description] 根据MediaType订阅一级站点信息
         * @return {[type]} [description]
         */
        function querySitesOnSubcribeCenter() {
            var params = {
                "serviceid": "gov_site",
                "methodname": "querySitesOnSubscribeCenter",
                "MediaType": $scope.data.subscribeMediasCur.mediaType
            };
            // trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, 'get').then(function(data) {
            trsHttpService.httpServer('./editingCenter/data/subscribe-media.json', params, 'get').then(function(data) {
                if (data.length === 0) return;
                var temp = $scope.data.subscribeMediasCur.type.replace(/(\w)/, function(v) {
                    return v.toUpperCase();
                }); //首字母大写
                eval("query" + temp + "()");
            });
        }

        /**
         * [queryWebsite description] 订阅网站
         * @return {[type]} [description]
         */
        function queryWebsite() {
            var params = {
                "serviceid": "gov_site",
                "methodname": "querySitesOnSubscribeCenter",
                "MediaType": 1,
            };
            // trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function(data) {
            trsHttpService.httpServer('./editingCenter/data/subscribe-media.json', params, "get").then(function(data) {
                $scope.data.website.lists = data;
                $scope.data.website.selectedItem = data[0];
                querySubscribeBySiteid();
            });
        }

        /**
         * [queryWebsite description] 订阅APP
         * @return {[type]} [description]
         */
        function queryApp() {
            var params = {
                "serviceid": "gov_site",
                "methodname": "querySitesOnSubscribeCenter",
                "MediaType": 2,
            };
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function(data) {
                $scope.data.app.lists = data;
                $scope.data.app.selectedItem = data[0];
            });
        }

        /**
         * [queryWebsite description] 订阅微信
         * @return {[type]} [description]
         */
        function queryWeixin() {
            var params = {
                "serviceid": "gov_site",
                "methodname": "querySitesOnSubscribeCenter",
                "MediaType": 3,
            };
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function(data) {
                $scope.data.weixin.lists = data;
                $scope.data.weixin.selectedItem = data[0];
            });
        }

        /**
         * [queryWebsite description] 订阅微博
         * @return {[type]} [description]
         */
        function queryWeibo() {
            var params = {
                "serviceid": "gov_site",
                "methodname": "querySitesOnSubscribeCenter",
                "MediaType": 4,
            };
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function(data) {
                $scope.data.weibo.lists = data;
                $scope.data.weibo.selectedItem = data[0];
            });
        }

        /**
         * [querySubscribeBySiteid description] 根据siteid获得网站叠次列表
         * @param  {[type]} website [description] 网站站点信息
         * @return {[type]}         [description]
         */
        function querySubscribeBySiteid() {
            var params = {
                "serviceid": "gov_site",
                "methodname": "queryChannelsOnSubscribeCenter",
                "SITEID": $scope.data.website.selectedItem.SITEID
            };
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function(data) {
                $scope.data.website.listids = data;
                $scope.data.website.subscribeSiteidCur = data[0];
            });
        }

        /**
         * [getSubMedia description]
         * @param  {[type]} site [description]
         * @return {[type]}      [description]
         */
        $scope.getSubMedia = function(site) {
            $scope.data.website.selectedItem = site;
        };

        /**
         * [getSubsSiteid description]
         * @param  {[type]} siteid [description]
         * @return {[type]}        [description]
         */
        $scope.getSubsSiteid = function(channel) {
            $scope.data.website.subscribeSiteidCur = channel;
            // querySubscribeBySiteid();
        };


        $scope.confirm = function() {
            $scope.data.test = $scope.data.website.selectedItem;
            var params = {
                "Serviceid": "gov_site",
                "methodname": "addSubscribeChannel",
                "ChannelId": $scope.data.website.subscribeSiteidCur.CHANNELID
            };
            $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function(data) {
                $scope.data.sitesChannels = data;
                trsconfirm.alertType("订阅栏目成功", "", "success", false, function() {
                    $modalInstance.close($scope.data.sitesChannels);
                });
            }, function() {
                $modalInstance.close('not');
            });
        };
}]);