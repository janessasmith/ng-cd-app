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
            $scope.cur = {
                medias: subscribeService.initSubscribeMedia(),
                curMedia: {},
                curSite: {},
                curChannel: {}
            };
            $scope.data = {
                website: {
                    selectedItem: "" ,  // website被选中值
                    siteLists: [],      // 网站列表
                    channelLists: []     // 叠次列表
                },
                app: {
                    selectedItem: "" ,  // app被选中值
                },
                weixin: {
                    selectedItem: "" ,  // weixin被选中值
                },
                weibo: {
                    selectedItem: "" ,  // weibo被选中值
                }
            };
            $scope.status = {
                // 分渠道保存
                selectedArray: {
                    website: {},
                    app: {},
                    weixin: {},
                    weibo: {}
                }
            };

            $scope.cur.curMedia = $scope.cur.medias[0];


            $scope.path = {
                pathArray: []
            };
        }

        /**
         * [initData description] 初始化数据
         * @return {[type]} [description]
         */
        function initData() {
            queryWebsite();
            // var params = {
            //     "serviceid": "gov_site",
            //     "methodname": "querySitesOnSubscribeCenter",
            //     "MediaType": $scope.cur.curMedia.mediaType
            // };
            // trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, 'get').then(function(data) {
            //     if (data.length === 0) return;
            //     var temp = $scope.cur.curMedia.type.replace(/(\w)/, function(v) {
            //         return v.toUpperCase();
            //     }); // 首字母大写
            //     eval("query" + temp + "()");
            // });
        }


        /**
         * [setMediaTab description] 切换弹窗渠道
         * @param {[type]} item  [description] 渠道
         * @param {[type]} index [description] 序列号
         */
        $scope.setMediaTab = function(item) {
            // $scope.cur.curMedia = item;
            // var temp = item.type.replace(/(\w)/, function(v) {
            //     return v.toUpperCase();
            // }); // 首字母大写
            // eval("query" + temp + "()");
            querySitesOnSubscribeCenter(item);
        };

        /**
         * [querySitesOnSubscribeCenter description] 获取各个渠道的一级站点
         * @param  {[type]} item  [description] 站点信息
         * @return {[type]}       [description]
         */
        function querySitesOnSubscribeCenter(item) {
            $scope.cur.curMedia = item;
            var temp = item.type.replace(/(\w)/, function(v) {
                return v.toUpperCase();
            }); // 首字母大写
            eval("query" + temp + "()");

            // queryChannelsOnSubscribeCenter(item, index);
        }

        /*function querySitesOnSubscribeCenter() {
             var params = {
                "serviceid": "gov_site",
                "methodname": "querySitesOnSubscribeCenter",
                "MediaType": $scope.cur.curMedia.mediaType
            };
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function(data) {
            // trsHttpService.httpServer('./editingCenter/data/subscribe-media.json', params, "get").then(function(data) {

            });
        }*/

        /**
         * [getSitelist description] 一级站点切换
         * @param  {[type]} site  [description] 网站一级站点信息
         * @param  {[type]} index [description] 序列号
         * @return {[type]}       [description]
         */
        $scope.getSitelist = function(site, index) {
            $scope.data.website.selectedItem = site;
        };

        /**
         * [queryWebsite description] 获取网站一级站点信息
         * @return {[type]} [description]
         */
        function queryWebsite() {
            var params = {
                "serviceid": "gov_site",
                "methodname": "querySitesOnSubscribeCenter",
                "MediaType": 1
            };
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function(data) {
            // trsHttpService.httpServer('./editingCenter/data/subscribe-media.json', params, "get").then(function(data) {
                $scope.data.website.siteLists = data;
                $scope.data.website.selectedItem = data[0];

                // queryChannelsOnSubscribeCenter(data[0]);
                queryChannelsOnSubscribeCenter();
            });
        }

        /**
         * [queryWebsite description] 获取app一级站点信息
         * @return {[type]} [description]
         */
        function queryApp() {
            var params = {
                "serviceid": "gov_site",
                "methodname": "querySitesOnSubscribeCenter",
                "MediaType": 2
            };
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function(data) {
            // trsHttpService.httpServer('./editingCenter/data/subscribe-media.json', params, "get").then(function(data) {
                $scope.data.app.siteLists = data;
                $scope.data.app.selectedItem = data[0];
            });
        }

        /**
         * [queryWebsite description] 获取微信一级站点信息
         * @return {[type]} [description]
         */
        function queryWeixin() {
            var params = {
                "serviceid": "gov_site",
                "methodname": "querySitesOnSubscribeCenter",
                "MediaType": 3
            };
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function(data) {
            // trsHttpService.httpServer('./editingCenter/data/subscribe-media.json', params, "get").then(function(data) {
                $scope.data.weixin.siteLists = data;
                $scope.data.weixin.selectedItem = data[0];
            });
        }

        /**
         * [queryWebsite description] 获取微博一级站点信息
         * @return {[type]} [description]
         */
        function queryWeibo() {
            var params = {
                "serviceid": "gov_site",
                "methodname": "querySitesOnSubscribeCenter",
                "MediaType": 4
            };
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function(data) {
            // trsHttpService.httpServer('./editingCenter/data/subscribe-media.json', params, "get").then(function(data) {
                $scope.data.weibo.siteLists = data;
                $scope.data.weibo.selectedItem = data[0];
            });
        }

        /**
         * [queryChannelsOnSubscribeCenter description] 网站渠道获取二级列表
         * @return {[type]}      [description]
         */
        function queryChannelsOnSubscribeCenter() {
            var params = {
                "serviceid": "gov_site",
                "methodname": "queryChannelsOnSubscribeCenter",
                "SiteId": $scope.data.website.selectedItem.SITEID
            };
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function(data) {
                $scope.data.website.channelLists = data;
                $scope.cur.curChannel = data[0];
            });
        }

        /**
         * [getChannellist description] 二级栏目切换
         * @param  {[type]} channel [description] 二级栏目信息
         * @param  {[type]} index   [description] 序列号
         * @return {[type]}         [description]
         */
        $scope.getChannellist = function(channel, index) {
            $scope.cur.curChannel = channel;
        };

        /**
         * [cancel description] 弹窗 关闭取消按钮
         * @return {[type]} [description]
         */
        $scope.close = function() {
            $modalInstance.dismiss();
        };
}]);