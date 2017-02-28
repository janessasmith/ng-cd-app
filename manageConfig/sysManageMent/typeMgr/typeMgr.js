/* create by ma.rongqin 2016.11.29 */
'use strict';
angular.module('manageSysManageTypeMgrModule', [
        'newTypeMgrModule',
        'manageSysManageTypeMgrRouterModule',
        'manageSysManageCategoryMgrModule'
    ])
    .controller('manageSysManageTypeMgrCtrl', ['$scope', '$modal', '$state', 'trsHttpService', 'globleParamsSet', 'trsconfirm', 'trsspliceString', function($scope, $modal, $state, trsHttpService, globleParamsSet, trsconfirm, trsspliceString) {
        initStatus();
        initData();
        /**
         * [initStatus description] 默认状态
         * @return {[type]} [description]
         */
        function initStatus() {
            $scope.page = {
                "CURRPAGE": 1,
                "PAGESIZE": 20,
                "ITEMCOUNT": 0,
                "PAGECOUNT": 1
            };
            $scope.status = {
                params: {
                    serviceid: "mlf_sharedoc",
                    methodname: "queryShareCategorysOfOneWithOutRight",
                    IsCore: "",
                    IsAll: true,
                    CURRPAGE: $scope.page.CURRPAGE,
                    PAGESIZE: $scope.page.PAGESIZE,
                },
                copyCurrPage: 1,
            };
            $scope.data = {
                items: [],
                selectedArray: []
            };
            $scope.$parent.titleName = '稿库类型管理';
        }
        /**
         * [initData description] 默认数据
         * @return {[type]} [description]
         */
        function initData() {
            requestData();
        }
        /**
         * [requestData description]请求数据
         * @return {[type]} [description]
         */
        function requestData() {
            $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), $scope.status.params, 'get').then(function(data) {
                $scope.data.items = data.DATA;
                $scope.page.ITEMCOUNT = data.PAGER.ITEMCOUNT;
                $scope.page.PAGESIZE = data.PAGER.PAGESIZE;
                $scope.data.selectedArray = [];
            });
        }

        /**
         * [new description]新建
         * @return {[type]} [description]
         */
        $scope.new = function() {
            createOrEdit({ SHARECATEGORYID: 0, MODALID: 37, CORDER: -1 }, "新建");
        };
        /**
         * [xiugai 修改]
         * @return {[type]} [description]
         */
        $scope.xiugai = function(item) {
            createOrEdit(item, "修改");
        };
        /**
         * [createOrEdit 新建或修改]
         * @param  {[object]} item [description] 修改对象
         * @param  {[string]} type [description] 类型
         * @return {[type]} [description]
         */
        function createOrEdit(item, type) {
            windowOpen(item, function(result) {
                var params = {
                    serviceid: "mlf_sharedoc",
                    methodname: "saveCategory",
                    ObjectId: item.SHARECATEGORYID,
                    CategoryName: result.CATEGORYNAME,
                    Status: result.STATUS,
                    IsCore: result.ISCORE,
                    ModalId: result.MODALID,
                    Corder: result.CORDER,
                    VisibleCategorys: result.VISIBLECATEGORYS,
                    ParentId:0
                };
                $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function(data) {
                    trsconfirm.alertType(type + '稿库类型成功', "", "success", false, function() {
                        requestData();
                    });
                });
            });
        }
        /**
         * [windowOpen description] 新建修改弹窗
         * @return {[type]} [description]
         */
        function windowOpen(item, success) {
            var modalInstance = $modal.open({
                templateUrl: "./manageConfig/sysManageMent/typeMgr/newTypeMgr/newTypeMgr_tpl.html",
                scope: $scope,
                windowClass: 'new-managesys-manage-type-mgr',
                backdrop: true,
                controller: "newTypeMgrCtrl",
                resolve: {
                    Params: function() {
                        return item;
                    }
                },
            });
            modalInstance.result.then(function(result) {
                success(result);
            });
        }
        /**
         * [shareDraft description]删除
         * @return {[type]} [description]
         */
        $scope.shareDraft = function(item) {
            var OBJECTIDS = angular.isDefined(item) ? item.SHARECATEGORYID : trsspliceString.spliceString($scope.data.selectedArray, "SHARECATEGORYID", ",");
            trsconfirm.confirmModel('删除', '确定删除所选稿件', function() {
                var params = {
                    serviceid: "mlf_sharedoc",
                    methodname: "deleteCategorys",
                    CatIds: OBJECTIDS
                };
                $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, 'get').then(function(data) {
                    requestData();
                    $scope.data.selectedArray = [];
                });
            });
        };
        /**
         * [selectAll description] 列表全选按钮
         * @return {[type]} [description]
         */
        $scope.selectAll = function() {
            $scope.data.selectedArray = $scope.data.selectedArray.length == $scope.data.items.length ? [] : [].concat($scope.data.items);
        };
        /**
         * [selectDoc description] 列表单选按钮
         * @param  {[type]} item [description]
         * @return {[type]}      [description]
         */
        $scope.selectDoc = function(item) {
            var index = $scope.data.selectedArray.indexOf(item);
            if (index < 0) {
                $scope.data.selectedArray.push(item);
            } else {
                $scope.data.selectedArray.splice(index, 1);
            }
        };
        /** [selectPageNum description] 每页显示的数据数量
         */
        $scope.selectPageNum = function() {
            $scope.status.copyCurrPage = 1;
            $scope.status.params.PageSize = $scope.page.PAGESIZE;
            $scope.status.params.CURRPAGE = $scope.page.CURRPAGE;
            requestData();
        };
        /**
         * [selectPageNum description] 选择一页要显示的数据量
         * @return {[type]} [description]
         */
        $scope.selectPageNum = function() {
            $scope.status.copyCurrPage = 1;
            $scope.status.params.PageSize = $scope.page.PAGESIZE;
            $scope.status.params.CURRPAGE = $scope.page.CURRPAGE;
            requestData();
        };
        /**
         * [pageChanged description] 下一页 页面改变调取数据
         * @return {[type]} [description]
         */
        $scope.pageChanged = function() {
            $scope.status.params.CURRPAGE = $scope.page.CURRPAGE;
            $scope.status.copyCurrPage = $scope.page.CURRPAGE;
            requestData();
        };
        /**
         * [jumpToPage description] 跳转页
         * @return {[type]} [description]
         */
        $scope.jumpToPage = function() {
            if ($scope.status.copyCurrPage > $scope.page.PAGESIZE) {
                $scope.status.CURRPAGE = $scope.page.PAGESIZE;
            }
            $scope.status.params.CURRPAGE = $scope.status.copyCurrPage;
            $scope.page.CURRPAGE = $scope.status.params.CURRPAGE;
            requestData();
        };
        /**
         * [goCategoryMgr description] 跳转到稿件类别管理页面
         * @return {[type]} [description]
         */
        $scope.goCategoryMgr = function(item) {
            $scope.$parent.titleName = item.CATEGORYNAME+' >> 稿库类别管理';
            $state.go('manageconfig.sysmanage.typemgr.categorymgr', {
                sharecategoryid: item.SHARECATEGORYID,
                categoryname:item.CATEGORYNAME
            });
        };
    }]);
