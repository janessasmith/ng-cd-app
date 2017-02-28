"use strict";
angular.module('appBindTemplateModule', []).
controller('columnChannelOtherViewsCtrl', ['$scope', "$modalInstance", "$stateParams", "trsHttpService", "params", function($scope, $modalInstance, $stateParams, trsHttpService, params) {
        initStatus();
        initData();

        function initStatus() {
            $scope.page = {
                CURRRPAGE: "1",
                PAGESIZE: "10",
            };
            $scope.params = {
                serviceid: "mlf_appconfig",
                methodname: "getOptionalTemplates",
                ObjectType: params.ObjectType,
                ObjectId: params.ObjectId,
                TempName: params.TempName,
                TEMPLATETYPE: params.TEMPLATETYPE,
                CurrPage: $scope.page.CURRRPAGE,
                PageSize: $scope.page.PAGESIZE
            };
            $scope.selectedOverviewTemp = {
                TEMPID: params.TEMPID || "0",
                TEMPNAME: ""
            };
            $scope.status = {
                copyCurrPage: 1,
            };
        }

        function initData() {
            requestData();
        }

        function requestData() {
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), $scope.params, "GET").then(function(data) {
                $scope.overviewTemps = data.DATA;
                $scope.page = data.PAGER;
                if (angular.isDefined(params.selectedTempId) && angular.isDefined(params.selectedTempName)) {
                    $scope.selectedOverviewTemp = {
                        TEMPID: params.selectedTempId,
                        TEMPNAME: params.selectedTempName
                    };
                }
            });
        }
        $scope.pageChanged = function() {
            $scope.params.CurrPage = $scope.page.CURRPAGE;
            $scope.status.copyCurrPage = $scope.params.CurrPage;
            requestData();
        };
        $scope.jumpToPage = function() {
            if ($scope.page.PAGECOUNT < $scope.status.copyCurrPage) {
                $scope.status.copyCurrPage = $scope.page.PAGECOUNT;
            }
            $scope.params.CurrPage = $scope.status.copyCurrPage;
            requestData();
        };
        $scope.cancel = function() {
            $modalInstance.dismiss();
        };
        $scope.confirm = function() {
            $modalInstance.close($scope.selectedOverviewTemp);
        };
        //点击选择模板
        $scope.selectOverviewTempFn = function(overviewTemp) {
            $scope.selectedOverviewTemp = overviewTemp;
        };
        //点击不选择任何模板
        $scope.selectNotemp = function() {
            $scope.selectedOverviewTemp = $scope.selectedOverviewTemp.TEMPID == 0 ? $scope.overviewTemps[0] : {
                TEMPID: "0",
                TEMPNAME: ""
            };
        };

    }])
    .controller('columnChannelBindViewCtrl', ['$scope', '$modalInstance', '$stateParams', 'trsHttpService', 'title', 'params', function($scope, $modalInstance, $stateParams, trsHttpService, title, params) {
        initStatus();
        initData();
        /**
         * [initStatus description] 初始化状态
         * @return {[type]} [description] null
         */
        function initStatus() {
            $scope.status = {
                copyCurrPage: 1,
                curtitle: title || '选择', // 若未传入title，默认为“选择”
                defaultViewInfoId: 0 // 若为新建，默认绑定视图的ID为零
            };
            // 页码初始化
            $scope.page = {
                CURRRPAGE: 1,
                PAGESIZE: 10,
            };
            // 请求参数
            $scope.params = {
                serviceid: "nb_metadatahelper",
                methodname: "queryView",
                CurrPage: $scope.page.CURRRPAGE,
                PageSize: $scope.page.PAGESIZE
            };
            // 选中视图
            $scope.selectedOverviewTemp = {
                VIEWINFOID: params ? params.VIEWINFOID : $scope.status.defaultViewInfoId,
                VIEWDESC: ''
            };
        }
        /**
         * [initData description] 初始化数据
         * @return {[type]} [description] null
         */
        function initData() {
            requestData();
        }
        /**
         * [requestData description] 请求数据
         * @return {[type]} [description] null
         */
        function requestData() {
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), $scope.params, "GET").then(function(data) {
                $scope.overviewTemps = data.DATA;
                $scope.page = data.PAGER;
            });
        }
        /**
         * [pageChanged description] 更换页面
         * @return {[type]} [description] null
         */
        $scope.pageChanged = function() {
            $scope.params.CurrPage = $scope.page.CURRPAGE;
            $scope.status.copyCurrPage = $scope.params.CurrPage;
            requestData();
        };
        /*
         * [jumpToPage description] 跳转页面
         * @return {[type]} [description] null
         */
        $scope.jumpToPage = function() {
            if ($scope.page.PAGECOUNT < $scope.status.copyCurrPage) {
                $scope.status.copyCurrPage = $scope.page.PAGECOUNT;
            }
            $scope.params.CurrPage = $scope.status.copyCurrPage;
            requestData();
        };
        /*
         * [cancel description] 关闭弹窗
         * @return {[type]} [description] null
         */
        $scope.cancel = function() {
            $modalInstance.dismiss();
        };
        /*
         * [confirm description] 确定
         * @return {[object]} [description] 选定的视图数据
         */
        $scope.confirm = function() {
            $modalInstance.close($scope.selectedOverviewTemp);
        };
        /*
         * [selectOverviewTempFn description] 点击选择视图
         * @return {[type]} [description] null
         */
        $scope.selectOverviewTempFn = function(overviewTemp) {
            $scope.selectedOverviewTemp = overviewTemp;
        };
        /*
         * [selectNotemp description] 点击不选择任何视图
         * @return {[type]} [description] null
         */
        $scope.selectNotemp = function() {
            $scope.selectedOverviewTemp = {
                VIEWINFOID: 0,
                VIEWDESC: ''
            };
        };
    }]);
