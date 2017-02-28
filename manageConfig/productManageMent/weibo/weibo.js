"use strict";
angular.module("productManageMentWeiboModule", ['productManageMentWeiboServiceModule']).
controller('productManageMentWeiboCtrl', ['$scope', '$modal', '$stateParams', 'trsHttpService', 'trsconfirm', 'productManageMentWeiboService', 'globleParamsSet', 'permissionService',
    function($scope, $modal, $stateParams, trsHttpService, trsconfirm, productManageMentWeiboService, globleParamsSet, permissionService) {
        initStatus();
        initData();
        /**
         * [initStatus description] 初始化状态
         * @return {[type]} [description]
         */
        function initStatus() {
            /**
             * [page description:分页信息]
             */
            $scope.page = {
                "CURRPAGE": 1,
                "PAGESIZE": 12,
                "ITEMCOUNT": 0,
                "PAGECOUNT": 1
            };
            $scope.status = {
                copyCurrPage: 1,
                params: {
                    "serviceid": "wcm61_scmaccount",
                    "methodname": "findAccountsOfManagerToJson",
                    "AccountName": "",
                    "PageSize": $scope.page.PAGESIZE,
                    "CurrPage": $scope.page.CURRPAGE
                },
                isAdministrator: false,
            };
            $scope.data = {
                items: []
            };
            $scope.searchWord = "";
            /**
             * 判断是否是管理员
             */
            permissionService.isAdministrator().then(function(data) {
                $scope.status.isAdministrator = data;
            });
        }

        /**
         * [initData description] 初始化数据
         * @return {[type]} [description]
         */
        function initData() {
            requestData();
        }

        /**
         * [requestData description] 请求数据
         * @return {[type]} [description]
         */
        function requestData() {
            $scope.loadingPromise = trsHttpService.httpServer('/wcm/rbcenter.do', $scope.status.params, 'post').then(function(data) {
                $scope.data.items = data.DATA;
                !!data.PAGER ? $scope.page = data.PAGER : $scope.page.ITEMCOUNT = "0";
            });
        }

        /**
         * [search description] 搜索
         * @return {[type]} [description]
         */
        $scope.produWeiboSearch = function(ev) {
            if ((angular.isDefined(ev) && ev.keyCode == 13) || angular.isUndefined(ev)) {
                $scope.status.params.AccountName = $scope.searchWord;
                requestData();
            }
        };

        /**
         * [bangdingAccount description] 账号延期
         * @return {[type]} [description]
         */
        $scope.bangdingAccount = function() {
            productManageMentWeiboService.bangdingWeibo();
        };

        /**
         * [AccountExtension description] 绑定微博账号
         * @return {[type]} [description]
         */
        $scope.AccountExtension = function() {
            productManageMentWeiboService.AccountExtension(function() {
                if(angular.isDefined(localStorage.getItem("weibo.refresh"))) {
                    var refresh = JSON.parse(localStorage.getItem("weibo.refresh"));
                    if(refresh.refresh === "true") {
                        requestData();
                    }
                    localStorage.removeItem("weibo.refresh");
                }
                
            });
        };

        /**
         * [deleteWeiboAccount description] 删除账号
         * @return {[type]} [description]
         */
        $scope.deleteWeiboAccount = function(item) {
            trsconfirm.confirmModel('提示信息', "您确定要删除此微博账号", function() {
                deleteWeiboAccountMethod(item);
            });
        };

        /**
         * [deleteWeiboAccount description] 删除账号方法
         * @return {[type]} [description]
         */
        function deleteWeiboAccountMethod(item) {
            $scope.params = {
                serviceid: "wcm61_scmaccount",
                methodname: "deleteAccountToJson",
                ObjectIds: item.ACCOUNTID
            };
            trsHttpService.httpServer('/wcm/rbcenter.do', $scope.params, 'get').then(function(data) {
                trsconfirm.alertType("删除成功", "", "success", false);
                requestData();
            });
        }

         /**
         * [pageChanged description:下一页]
         */
        $scope.pageChanged = function() {
            $scope.status.params.CurrPage = $scope.page.CURRPAGE;
            $scope.status.copyCurrPage = $scope.page.CURRPAGE;
            requestData();
        };

        /**
         * [jumpToPage description:跳转指定页面]
         */
        $scope.jumpToPage = function() {
            if ($scope.status.copyCurrPage > $scope.page.PAGECOUNT) {
                $scope.status.copyCurrPage = $scope.page.PAGECOUNT;
            }
            $scope.status.params.CurrPage = $scope.status.copyCurrPage;
            $scope.page.CURRPAGE = $scope.status.copyCurrPage;
            requestData();
        };

        /**
         * [getChnlRights description]获取微博权限
         * @return {[type]} [description] null
         */
        $scope.getWeiboRights = function(item) {
            productManageMentWeiboService.getRight(item.ACCOUNTID, "microblogset.blog").then(function(data) {
                item.right = data;
            });
        };
    }
]);
