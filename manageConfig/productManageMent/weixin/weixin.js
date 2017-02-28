/**
 * modified by zss in 2017/01/10
 * weChat account list
 */
"use strict";
angular.module('productManageMentWeiXinModule', ["productManagementWeixinServiceModule"]).
controller('productManageMentWeiXinCtrl', ['$scope', '$modal', 'trsHttpService', 'trsconfirm', 'permissionService', 'productManagementWeixinService', 'globleParamsSet',
    function($scope, $modal, trsHttpService, trsconfirm, permissionService, productManagementWeixinService, globleParamsSet) {
        initStatus();
        initData();
        /**
         * [initStatus description]初始化状态
         * @return {[type]} [description] null
         */
        function initStatus() {
            $scope.account = {
                "appId": "",
                "appSecret": "",
                "channelId": "",
                "description": "",
                "id": "", //对应元数据id
                "pubMessageTotal": "", //总发送消息数 
                "todayPubMessage": "", //今日发送消息数        
                "name": "",
                "wxHeadImg": "", //公众号图片
                "wxType": "", //1：服务号，2：订阅号
                "wxid": "" // 公众号原始ID
            };
            $scope.data = {
                page: {
                    'pageIndex': 1,
                    'pageSize': globleParamsSet.setResourceCenterPageSize,
                    'pageCount': '',
                },
                copyCurrPage: 1,
                wxPublicNumType: {
                    '1': '服务号',
                    '2': '订阅号',
                }
            };
            $scope.status = {
                params: {
                    "serviceid": "wcm61_wxaccount",
                    "methodname": "queryAccount",
                    'pageIndex': $scope.data.page.pageIndex,
                    'pageSize': $scope.data.page.pageSize,
                },
            };
        }
        /**
         * [initData description]初始化数据
         * @return {[type]} [description] null
         */
        function initData() {
            requestData();
        }
        /**
         * [requestData description] 数据请求
         * @return {[type]} [description] null
         */
        function requestData() {
            $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), $scope.status.params, 'post').then(function(data) {
                !!data.pageInfo ? $scope.data.page = data.pageInfo : $scope.data.page.PAGECOUNT = '0';
                $scope.accounts = data.result;
            });
        }
        /**
         * [newWxAccount description] 绑定微信账号/编辑微信账号
         * @param  {[type]} account [description] 账号
         * @return {[type]}         [description] null
         */
        $scope.newWxAccount = function(title,account) {
            productManagementWeixinService.createWxAccount(title,account).then(function(data){
                requestData();
            });
        };
        /**
         * [removeAccount description] 删除账号
         * @param  {[type]} id [description] 账号id
         * @return {[type]}         [description] null
         */
        $scope.removeAccount = function(id) {
            var params = {
                'serviceid': 'wcm61_wxaccount',
                'methodname': 'removeAccount',
                'wxChannelId': id,
            };
            trsconfirm.confirmModel('删除账号', '是否确定删除？', function() {
                trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, 'post').then(function(data) {
                    requestData();
                    trsconfirm.saveModel("删除成功", "", "success");
                });
            });
        };
        /**
         * [selectPageNum description] 选择单页显示条数
         * @return {[type]} [description] null
         */
        $scope.selectPageNum = function() {
            $scope.status.params.pageIndex = $scope.data.page.pageIndex;
            $scope.status.params.pageSize = $scope.data.page.pageSize;
            $scope.data.copyCurrPage = $scope.data.page.pageIndex;
            requestData();
        };
        /**
         * [pageChanged description] 选择第几页
         * @return {[type]} [description] null
         */
        $scope.pageChanged = function() {
            $scope.status.params.pageIndex = $scope.data.page.pageIndex;
            $scope.data.copyCurrPage = $scope.data.page.pageIndex;
            requestData();
        };
        /**
         * [jumpToPage description] 页面跳转
         * @return {[type]} [description] null
         */
        $scope.jumpToPage = function() {
            if ($scope.data.copyCurrPage > $scope.data.page.pageCount) {
                $scope.data.copyCurrPage = $scope.data.page.pageCount;
            }
            $scope.status.params.pageIndex = $scope.data.copyCurrPage;
            $scope.data.page.pageIndex = $scope.data.copyCurrPage;
            requestData();
        };
    }
]);
