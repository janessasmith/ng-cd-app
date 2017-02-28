/**
 *  Module
 *
 * Description: IWO 部门稿库
 * Author:cc 2016-11-04
 */
"use strict";
angular.module('iWoDepartmentModule', []).
controller('iWoDepartmentCtrl', ["$scope", "$state", "$q", '$window', "$modal", "$timeout", '$filter', "trsHttpService", "SweetAlert", "myManuscriptService", "trsconfirm", "initSingleSelecet", "trsResponseHandle", "trsspliceString", "$stateParams", "editingCenterService", "initVersionService", "iWoService", "editcenterRightsService", "trsPrintService", "localStorageService", "storageListenerService", "globleParamsSet", "resCtrModalService",

    function personalManuscriptCtrl($scope, $state, $q, $window, $modal, $timeout, $filter, trsHttpService, SweetAlert, myManuscriptService, trsconfirm, initSingleSelecet, trsResponseHandle, trsspliceString, $stateParams, editingCenterService, initVersionService, iWoService, editcenterRightsService, trsPrintService, localStorageService, storageListenerService, globleParamsSet, resCtrModalService) {

        initStatus();
        initData();
        /**
         * [initStatus description:初始化状态]
         */
        function initStatus() {
            $scope.data = {
                items: [],
                selectedArray: [], //已选
                editPath: iWoService.initEditPath(),
                preview: iWoService.initPreviewPath(),
                printResult: [],
                departmentInfo: localStorageService.get('iWodepartmentInfo'),
            };
            /**
             * [page description:分页信息]
             */
            $scope.page = {
                "CURRPAGE": 1,
                "PAGESIZE": globleParamsSet.getPageSize(),
                "ITEMCOUNT": 0,
                "PAGECOUNT": 1
            };
            $scope.status = {
                batchOperateBtn: {
                    "hoverStatus": "",
                    "clickStatus": ""
                },
                personalEdit: 1,
                copyCurrPage: 1,
                btnRights: [], //权限按钮
                params: {
                    "serviceid": "nb_departmentrelease",
                    "methodname": "queryDepartmentRelease",
                    "PageSize": $scope.page.PAGESIZE,
                    "CurrPage": $scope.page.CURRPAGE,
                    "departmentId": $state.params.departmentid
                },
                methodname: {
                    1: "getNewsDoc",
                    2: "getPicsDoc"
                },
                isESSearch: false, //是否通过ES检索列表
                isDepartment: !!$state.params.parentid, //判断是单位还是部门
                isAll: false, //是否查看全部稿件
            };
        }
        /**
         * [initData description:初始化数据]
         */
        function initData() {
            editcenterRightsService.initDepartmentListBtn($state.params.departmentid).then(function(rights) {
                $scope.status.btnRights = rights;
            });
            requestData();
            initDropDown();
            listenStorage();

        }
        /**
         * [requestData description:数据请求函数]
         */
        function requestData() {
            var params = $scope.status.isESSearch ? getESSearchParams() : $scope.status.params;
            $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, 'post').then(function(data) {
                var ListItems = data.DATA;
                $scope.data.items = ListItems;
                !!data.PAGER ? $scope.page = data.PAGER : $scope.page.ITEMCOUNT = "0";
                $scope.data.selectedArray = [];
                requestListImg(ListItems).then(function(data) {
                    angular.forEach(ListItems, function(value, key) {
                        value.ALLIMG = data[value.METADATAID];
                    });
                });
            });
        }
        /** 
         * [draftImport description]导入文档
         * @return {[type]} [description]
         */
        $scope.draftImport = function() {
            $scope.status.isESSearch = false;
            editingCenterService.draftImport("mlf_extmyrelease", "releaseSourceImportDoc", "", function() {
                requestData();
            });
        };
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
         * [getESSearchParams description]设置ES检索参数
         * @return {[json]} [description] 参数对象
         */
        function getESSearchParams() {
            var esParams = {
                serviceid: "mlf_essearch",
                methodname: "queryForIwoDepartmentDoc",
                searchParams: {
                    PAGESIZE: $scope.page.PAGESIZE + "",
                    PAGEINDEX: $scope.page.CURRPAGE + "",
                    searchFields: [{
                        searchField: $scope.iWoAllSelected.value,
                        keywords: $scope.keywords ? $scope.keywords : ""
                    }, {
                        searchField: "docType",
                        keywords: $scope.iWoDocStatusSelected.value
                    }, {
                        searchField: "timeType",
                        keywords: $scope.timeType.value
                    }, {
                        searchField: "_sort",
                        keywords: $scope.sortType.value
                    }, {
                        searchField: "DepartmentId",
                        keywords: $state.params.departmentid
                    }, {
                        searchField: "isAll",
                        keywords: $scope.status.isAll
                    }]
                }
            };
            esParams.searchParams = JSON.stringify(esParams.searchParams);
            return esParams;
        }
        /**
         * [draft description]稿件传递
         * @return {[type]} [description]
         */
        $scope.draft = function() {
            myManuscriptService.draftToDepartment("稿件传递", $scope.data.selectedArray).then(function(result) {
                var basicParams = {
                    serviceid: "nb_departmentRelease",
                    methodname: "transferToDepartment",
                    srcDepartmentId: $state.params.departmentid,
                    trgDepartmentId: result.DEPARTMENTID,
                    metaDataIds: trsspliceString.spliceString($scope.data.selectedArray, 'METADATAID', ','),
                };
                trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), basicParams, "post").then(function(data) {
                    trsconfirm.alertType("传递成功！", "稿件已成功传递", "success", false, function() {
                        requestData();
                    });
                });
            });
        };
        /**
         * [copyBuildDraft description:复制建新稿]
         */
        $scope.copyBuildDraft = function() {
            $scope.status.isESSearch = false;
            if ($scope.data.selectedArray.length === 0) {
                trsconfirm.alertType("请选择稿件", "请选择稿件", "info", false, function() {});
            } else {
                myManuscriptService.copyBuildDraft($scope.data.selectedArray, "personalCopyBuildDraft", function() {
                    requestData();
                });
            }
        };
        //
        /**
         * [draftlist description:发稿单]
         */
        $scope.draftlist = function() {
            $scope.status.isESSearch = false;
            $scope.status.batchOperateBtn.clickStatus = "draftlist";
            editingCenterService.draftList($scope.data.selectedArray, {
                "serviceid": "nb_departmentrelease",
                "methodname": "departmentBatchUpdateFgdUsers"
            }, function() {
                trsconfirm.alertType("操作成功", "发稿单已成功修改", "success", false);
                requestData();
            });
        };
        /**
         * [exportDraft description:导出稿件]
         */
        $scope.exportDraft = function() {
            $scope.status.isESSearch = false;
            var params = {
                serviceid: 'mlf_exportword',
                methodname: 'exportWordFile',
                MetaDataIds: trsspliceString.spliceString($scope.data.selectedArray, 'METADATAID', ','),
            };
            $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "post").then(function(data) {
                $window.open("/wcm/app/file/read_file.jsp?FileName=" + data.REPORTS[0].DETAIL);
            }, function(data) {
                if (data.REPORTS[0].ISSUCCESS == 'true') {
                    $window.open("/wcm/app/file/read_file.jsp?FileName=" + data.REPORTS[0].DETAIL);
                }
            });
        };
        /**
         * [submit description]上栏操作
         * @return {[type]} [description]
         */
        $scope.submit = function() {
            $scope.status.isESSearch = false;
            $scope.status.batchOperateBtn.clickStatus = "submit";
            myManuscriptService.submit(angular.copy($scope.data.selectedArray), function() {
                requestData();
            }, function() {
                requestData();
            }, "submitToMedia");
        };
        //
        /**
         * [singleSubmit description:单个提交]
         * @param  {[type]} item [description:稿件对象]
         */
        $scope.singleSubmit = function(item) {
            $scope.status.isESSearch = false;
            myManuscriptService.submit([item], function() {
                requestData();
            }, "personalSubmitMedia");
        };
        /**
         * [listenStorage description]监听本地缓存
         * @return {[promise]} [description] promise
         */
        function listenStorage() {
            storageListenerService.listenIwo(function() {
                $scope.status.isESSearch = false;
                requestData();
                storageListenerService.removeListener("iwo");
            });
        }
        /**
         * [requestListImg description:查询列表图示]
         */
        function requestListImg(items) {
            var defer = $q.defer();
            if (!items || items.length < 1) defer.resolve([]);
            else {
                var params = {
                    serviceid: "mlf_myrelease",
                    methodname: "queryAllImgLogo",
                    metadataids: trsspliceString.spliceString(items, "METADATAID", ",")
                };
                trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "post").then(function(data) {
                    defer.resolve(data);
                });
            }
            return defer.promise;
        }
        /**
         * [selectAll description:全选]
         */
        $scope.selectAll = function() {
            $scope.data.selectedArray = $scope.data.selectedArray.length == $scope.data.items.length ? [] : [].concat($scope.data.items);
            cancelBatchOperate();
        };
        /**
         * [selectDoc 单选]
         * @param  {[type]} item [description：单个对象] 
         */
        $scope.selectDoc = function(item) {
            if ($scope.data.selectedArray.indexOf(item) < 0) {
                $scope.data.selectedArray.push(item);
            } else {
                $scope.data.selectedArray.splice($scope.data.selectedArray.indexOf(item), 1);
            }
            cancelBatchOperate();
        };

        /**
         * [cancelBatchOperate description：取消批量操作的样式]
         */
        function cancelBatchOperate() {
            if ($scope.data.selectedArray.length === 0) {
                $scope.status.batchOperateBtn = {
                    "hoverStatus": "",
                    "clickStatus": ""
                };
            }
        }
        /**
         * [batchShare description：共享]
         */
        $scope.batchShare = function() {
            $scope.status.isESSearch = false;
            var shareSelectedArray = angular.copy($scope.data.selectedArray);
            var ChnlDocIds = trsspliceString.spliceString(shareSelectedArray, "CHNLDOCID", ",");
            var MetaDataIds = trsspliceString.spliceString(shareSelectedArray, "METADATAID", ",");
            share(ChnlDocIds, MetaDataIds);
        };

        /**
         * [share description：共享方法]
         * @param  {[type]} chnldocids  [description:逗号隔开的ID]
         * @param  {[type]} metadataids [description：逗号隔开的ID]
         * @return {[type]}             [description]
         */
        function share(chnldocids, metadataids) {
            editingCenterService.share(function(data) {
                data.serviceid = 'nb_departmentRelease';
                data.methodname = 'share';
                data.ChnlDocIds = chnldocids;
                data.MetaDataIds = metadataids;
                data.DepartmentId = $state.params.departmentid;
                trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), data, "post")
                    .then(function(data) {
                        trsconfirm.alertType("共享成功", "", "success", false, function() {
                            requestData();
                        });
                    }, function() {
                        requestData();
                    });
            });
        }
        /**
         * [rejection description]退稿
         * @return {[type]} [description]
         */
        $scope.rejection = function() {
            $scope.status.isESSearch = false;
            trsconfirm.inputModel("是否确认退稿", "退稿原因（可选）", function(content) {
                var MetaDataIds = trsspliceString.spliceString($scope.data.selectedArray,
                    'METADATAID', ',');
                rejection(MetaDataIds, content);
            });
        };
        /**
         * [rejection description]退稿
         * @param  {[str]} MetaDataIds  [description]id集合
         * @param  {[str]} content      [description]退稿原因
         * @return {[type]}             [description]
         */
        function rejection(MetaDataIds, content) {
            var params = {
                serviceid: "nb_departmentRelease",
                methodname: "rejectionMetaDatas",
                MetaDataIds: MetaDataIds,
                Opinion: content,
                DepartmentId: $state.params.departmentid

            };
            $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "post").then(function(data) {
                trsconfirm.alertType("退稿成功！", "", "success", false);
                requestData();
            });

        }
        /**
         * [getDraft description：取单传稿件 多选]
         * @param  {[type]} item [description：稿件对象]
         * @return {[type]}      [description]
         */
        $scope.getDraft = function(item) {
            var array = angular.copy($scope.data.selectedArray);
            myManuscriptService.getDraft(array, 'mlf_myrelease', 'queryRecentTransferedDoc', 'personalGetRecentTransferedDoc', function(data) {
                requestData();
            });
        };
        /**
         * [initDropDown description:初始化下拉框]
         */
        function initDropDown() {
            //初始化选择日期
            $scope.timeTypeJsons = initSingleSelecet.iWoOperTime();
            $scope.timeType = angular.copy($scope.timeTypeJsons[0]);
            //初始状态
            $scope.iWoDocStatusName = initSingleSelecet.iWoDocType();
            $scope.iWoDocStatusSelected = angular.copy($scope.iWoDocStatusName[0]);
            //初始化全部
            $scope.iWoAll = initSingleSelecet.iWoEntire();
            $scope.iWoAllSelected = angular.copy($scope.iWoAll[0]);
            // 排序方式
            $scope.sortTypeJsons = initSingleSelecet.sortType();
            $scope.sortType = angular.copy($scope.sortTypeJsons[1]);
        }
        /**
         * [selectPageNum description:选择单页显示个数]
         */
        $scope.selectPageNum = function() {
            $scope.status.params.PageSize = $scope.page.PAGESIZE;
            $scope.status.params.CurrPage = $scope.page.CURRPAGE;
            $scope.status.copyCurrPage = 1;
            requestData();
        };
        /**
         * [queryByDropdown description] 筛选条件触发后请求数据
         * @param  {[type]} key   [description] 请求对象参数key
         * @param  {[type]} value [description] 请求对象值
         * @return {[type]}       [description] null
         */
        $scope.queryByDropdown = function(key, value) {
            $scope.status.params[key] = value;
            $scope.status.params.CurrPage = $scope.status.copyCurrPage = $scope.page.CURRPAGE = "1";
            if (key == 'OperTime') {
                if (value.length < 10) {
                    $scope.status.params.OperTimeStart = null;
                    $scope.status.params.OperTimeEnd = null;
                } else {
                    $scope.status.params.OperTimeStart = $scope.data.fromdate;
                    $scope.status.params.OperTimeEnd = $scope.data.untildate;
                    $scope.status.params[key] = null;
                }
            }
            requestData();
        };
        /**
         * [showVersionTime description:流程版本时间与操作日志]
         * @param  {[type]} item [description:稿件对象]
         */
        $scope.showVersionTime = function(item) {
            editingCenterService.getVersionTime(item, true);
        };
        /**
         * [fullTextSearch description;全文检索]
         * @param  {[type]} ev [description:按下空格也能提交]
         */
        $scope.fullTextSearch = function(ev) {
            if ((angular.isDefined(ev) && ev.keyCode == 13) || angular.isUndefined(ev)) {
                $scope.status.isESSearch = true;
                $scope.page.CURRPAGE = 1;
                trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), getESSearchParams(), "post").then(function(data) {
                    $scope.data.items = data.DATA;
                    $scope.page = data.PAGER;
                });
            }
        };
        /**
         * [mergeToAtlas description] 合并成图集
         * @return {[type]} [description]
         */
        $scope.mergeToAtlas = function() {
            $scope.status.isESSearch = false;
            var hasUnAtlas = $filter('some')($scope.data.selectedArray, "DOCTYPEID!=='2'");
            if (hasUnAtlas) {
                trsconfirm.alertType("您选择的稿件中包含非图集稿", "", "error", false, function() {});
            } else {
                var params = {
                    serviceid: "mlf_myrelease",
                    methodname: "mergePicDocsOfPersonal",
                    MetaDataIds: trsspliceString.spliceString($scope.data.selectedArray, 'METADATAID', ','),
                };
                $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "post").then(function() {
                    trsconfirm.alertType("合并图集成功！", "", "success", false, function() {
                        requestData();
                    });

                });
            }
        };
        /**
         * [takeDraft description]取稿
         * @return {[type]} [description]
         */
        $scope.takeDraft = function() {
            var params = {
                serviceid: "nb_departmentrelease",
                methodname: "fetch",
                DepartmentId: $state.params.departmentid,
                MetaDataIds: trsspliceString.spliceString($scope.data.selectedArray, 'METADATAID', ","),
            };
            var modalInstance = resCtrModalService.fullTakeDraft(params, "", true);
            modalInstance.result.then(function() {
                requestData();
            }, function() {});
        };
        /**
         * [isAll description]是否查看全部稿件
         * @return {Boolean} [description]
         */
        $scope.isCheckall = function() {
            $scope.status.copyCurrPage = $scope.status.params.CurrPage = $scope.page.CURRPAGE = "1";
            $scope.status.isAll = !$scope.status.isAll;
            $scope.status.params.isAll = $scope.status.isAll;
            requestData();
        };
    }
]);
