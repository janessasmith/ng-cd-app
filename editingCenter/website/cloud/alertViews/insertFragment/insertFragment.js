'use strict'
/*create by ma.rongqin 2016.7.26*/
angular.module('editCloudWebsiteInsertFragmentModule', [])
    .controller('editCloudWebsiteInsertFragmentCtrl', ['$scope', "$modalInstance", "trsHttpService", "transmission", "trsspliceString", "initManageConSelectedService", function($scope, $modalInstance, trsHttpService, transmission, trsspliceString, initManageConSelectedService) {
        initstatus();
        initData();

        function init() {
            $scope.selectedTEMP = "";
        }
        $scope.selectImportmode = function(item) {
            $scope.selectedTEMP = item;
        };
        //初始化状态
        function initstatus() {
            $scope.page = {
                "CURRPAGE": 1,
                "PAGESIZE": 10
            };
            $scope.copyCurrPage = 1;
            $scope.params = {
                "serviceid": "mlf_widget",
                "methodname": "queryWidgetsBySite",
                "PageSize": $scope.page.PAGESIZE,
                "CurrPage": $scope.page.CURRPAGE,
                "SiteId": transmission.siteid,
                'TEMPDESC': '',
            };
            $scope.batchOperateBtn = {
                "hoverStatus": "",
                "clickStatus": ""
            };
        }

        //初始化数据
        function initData() {
            requestData();
        }

        //数据请求函数
        function requestData(callback) {
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), $scope.params, 'post').then(function(data) {
                // console.log($scope.params);
                if (angular.isFunction(callback)) {
                    callback(data);
                } else {
                    $scope.items = data.DATA;
                    $scope.page = data.PAGER;
                    angular.isDefined($scope.page) ? $scope.page.PAGESIZE =
                        $scope.page.PAGESIZE.toString() : $scope.page = {
                            "PAGESIZE": 0,
                            "ITEMCOUNT": 0,
                            "PAGECOUNT": 0
                        };
                }
                $scope.selectedArray = [];
            });
        }
        //下一页
        $scope.pageChanged = function() {
            $scope.params.CurrPage =
                $scope.copyCurrPage = $scope.page.CURRPAGE;
            requestData();
        };;
        //跳转到
        $scope.jumpToPage = function() {
            if ($scope.copyCurrPage > $scope.page.PAGECOUNT) {
                $scope.copyCurrPage = $scope.page.PAGECOUNT;
            }
            $scope.params.CurrPage = $scope.copyCurrPage;
            requestData();
        };


        //选择单页显示个数
        $scope.selectPageNum = function() {
            $timeout(function() {
                $scope.params.PageSize = $scope.page.PAGESIZE;
                requestData();
            });
        };

        $scope.cancel = function() {
            $modalInstance.dismiss();
        };
        $scope.confirm = function() {
            $scope.params.serviceid = "mlf_widget";
            $scope.params.methodname = "queryWidgetIncludeCode";
            $scope.params.WidgetId = $scope.selectedTEMP.TEMPID;
            $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), $scope.params, 'post').then(function(data) {
                $modalInstance.close(data);
            });
        };
        /**
         * [fullTextSearch description;全文检索]
         * @param  {[type]} ev [description:按下空格也能提交]
         */
        $scope.fullTextSearch = function(ev) {
            if ((angular.isDefined(ev) && ev.keyCode == 13) || angular.isUndefined(ev)) {
                $scope.page.CURRPAGE = 1;
                requestData();
            }
        };
    }])
