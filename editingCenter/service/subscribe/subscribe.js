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
                    channelLists: [],     // 叠次列表
                    selectedChannelIdArray: [],//已选中的栏目id的集合
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


            /**
             * [path description]记录选中路径
             * @type {Object}
             */
            $scope.path = {
                newPath: {},
                pathArray: []
            };
        }

        /**
         * [initData description] 初始化数据
         * @return {[type]} [description]
         */
        function initData() {
            queryWebsite();
        }

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

                questSubChannel(data[0], 0);
                querySubscribeChannels();
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


        $scope.confirm = function() {
            queryChannelIds();
            setSubscribeChannels($scope.data.website.selectedChannelIdArray.toString());
            $modalInstance.close();
        };

        /**
         * [questSubChannel description] 获取指定站点下的栏目列表
         * @param  {[type]} siteid [description] 点击后传入的site
         * @param  {[type]} index [description] 
         * @return {[type]}        [description]
         */
        $scope.questSubChannel = function(site, index) {
            questSubChannel(site, index);
        }

        function questSubChannel(site, index) {
            $scope.data.website.selectedItem = index;
            var param = {
                serviceid: "gov_site",
                methodname: "queryChannelsOnSubscribeCenter",
                SITEID: site.SITEID
            };
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), param, 'get').then(function(data) {
                $scope.data.website.channelLists = data;
            });
        }
        /**
         * [selectSubChannel description] 点击可订阅的栏目
         * @param  {[type]} channel [description]可订阅的栏目数据
         * @param  {[type]} index   [description]可订阅的栏目索引
         * @return {[type]}         [description]
         */
        $scope.selectSubChannel = function(channel, index) {
            $scope.status.selectedChannel = channel;
            $scope.cur.curChannel = index;
            $scope.status.submitChnlId = channel.CHANNELID;

            var channelNum = 0;
            $scope.path.newPath = {
                "CHNLNAME" : channel.CHNLNAME,
                "CHNLTYPE" : channel.CHNLTYPE,
                "PARENTID" : channel.PARENTID,
                "CHANNELID" : channel.CHANNELID,
                "SITEDESC" : $scope.data.website.siteLists[$scope.data.website.selectedItem].SITEDESC,
                "CHNLDESC" : channel.CHNLDESC,
                "SITEID" : channel.SITEID
            };
            //循环路径数组元素，如果该栏目已经添加了，便不重复添加
            angular.forEach($scope.path.pathArray, function(value, key){
                value.CHANNELID == channel.CHANNELID ? channelNum++ : '';
            });
            channelNum == 0 ? $scope.path.pathArray.push($scope.path.newPath) : '';
        } 

        /**
         * [setSubscribeChannels description] 设定当前用户订阅的栏目
         * @param {[type]} channelids [description] 当前订阅的栏目id的集合
         */
        function setSubscribeChannels(channelids) {
            var param = {
                serviceid: "gov_site",
                methodname: "setSubscribeChannels",
                ObjectIds: channelids
            };
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), param, 'get').then(function(data) {
            });
        }

        /**
         * [queryChannelIds description] 获取当前用户订阅的栏目id的集合
         * @return {[type]} [description]
         */
        function queryChannelIds(){
            $scope.data.website.selectedChannelIdArray = [];
            angular.forEach($scope.path.pathArray, function(value, key){
                $scope.data.website.selectedChannelIdArray.push(value.CHANNELID);
            })
        }


        /**
         * [querySubscribeChannels description] 弹窗中获取用户已订阅的栏目
         * @return {[type]} [description]
         */
        function querySubscribeChannels() {
            var param = {
                serviceid: "gov_site",
                methodname: "querySubscribeChannels",
            };
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), param, 'get').then(function(data) {
                $scope.path.pathArray = data;
            });
        }

        /**
         * [deletePath description] 删除已订阅的路径
         * @param  {[type]} index [description] 栏目的索引
         * @return {[type]}       [description]
         */
        $scope.deletePath = function(index) {
            $scope.path.pathArray.splice(index, 1);
        }



}]);