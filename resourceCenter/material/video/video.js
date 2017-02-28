"use strict";
/**
 * created by cc 16-12-09 视频库列表
 * modified by zss 16-12-12
 */
angular.module("resourceCenterVideoModule", ["resCenterVideoRouterModule", "resourceCenterVideoEditModule", "resourceCenterVideoDetailModule"]).
controller("resourceCenterVideoCtrl", ["$scope", "$location", "$state", "$q", "$filter", "$timeout", "$window", "trsHttpService", "globleParamsSet", "storageListenerService", "trsspliceString", "trsconfirm", "resCtrModalService", "resourceCenterMaterialService", "initSingleSelecet",
    function($scope, $location, $state, $q, $filter, $timeout, $window, trsHttpService, globleParamsSet, storageListenerService, trsspliceString, trsconfirm, resCtrModalService, resourceCenterMaterialService, initSingleSelecet) {
        if ($state.params.materialtypeid) {
            initStatus();
            initData();
        }
        /**
         * [initStatus description] 初始化状态
         * @return {[type]} [description] null
         */
        function initStatus() {
            $scope.data = {
                page: {
                    'CURRPAGE': 1,
                    'PAGESIZE': globleParamsSet.setResourceCenterPageSize,
                    "ITEMCOUNT": 0,
                    'PAGECOUNT': '',
                },
                materialTypeId: $state.params.materialtypeid,
                topclassifyid: $state.params.topclassifyid,
                selectedArray: [], //存放选中的音视频
            };
            $scope.status = {
                batchOperateBtn: {
                    "hoverStatus": "",
                    "clickStatus": "",
                    "btnRights": "", //按钮权限
                },
                params: {
                    'serviceid': 'nb_materialrelease',
                    'methodname': 'queryAllVideoFromMas',
                    'MaterialTypeId': $state.params.materialtypeid,
                    'mediaType': '',
                    'CURRPAGE': $scope.data.page.CURRPAGE,
                    'PAGESIZE': $scope.data.page.PAGESIZE,
                    "OperTime": '',
                },
                copyCurrPage: 1,
                isESSearch: false, //是否通过ES检索列表
            };
        }
        /**
         * [initData description] 初始化数据
         * @return {[type]} [description] null
         */
        function initData() {
            requestData().then(function() {
                queryFlag();
            });
            listenStorage();
            getBtnRights();
            initDropDown();
        }
        /**
         * [getBtnRights description]获得操作按钮权限
         * @return {[type]} [description]
         */
        function getBtnRights() {
            resourceCenterMaterialService.btnRights().then(function(data) {
                $scope.status.btnRights = data;
            });
        }
        /**
         * [requestData description] 数据请求
         * @return {[type]} [description]
         */
        function requestData() {
            var deffer = $q.defer();
            var params = $scope.status.isESSearch ? getESSearchParams() : $scope.status.params;
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, 'post').then(function(data) {
                !!data.PAGER ? $scope.data.page = data.PAGER : $scope.data.page.PAGECOUNT = '0';
                $scope.data.videos = data.DATA;
                deffer.resolve();
            });
            return deffer.promise;
        }
        /**
         * [initDropDown description] 初始化下拉列表
         * @return {[type]} [description] null
         */
        function initDropDown() {
            //初始化选择日期
            $scope.timeTypeJsons = initSingleSelecet.iWoOperTime();
            $scope.timeType = angular.copy($scope.timeTypeJsons[0]);
            //初始化全部
            $scope.meterailAll = initSingleSelecet.meterailESCondition();
            $scope.meterailAllSelected = angular.copy($scope.meterailAll[0]);
            // 排序方式
            $scope.sortTypeJsons = initSingleSelecet.sortType();
            $scope.sortType = angular.copy($scope.sortTypeJsons[1]);
        }
        /**
         * [queryByDropdown description] 筛选条件触发后请求数据
         * @param  {[type]} key   [description] 请求对象参数key
         * @param  {[type]} value [description] 请求对象值
         * @return {[type]}       [description] null
         */
        $scope.queryByDropdown = function(key, value) {
            $scope.status.params[key] = value;
            $scope.data.page.CURRPAGE = $scope.status.params.CURRPAGE = '1';
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
            requestData().then(function() {
                queryFlag();
            });
        };
        /**
         * [queryFlag description] 查询已取稿音视频列表
         * @return {[type]} [description] null
         */
        function queryFlag() {
            if ($scope.data.videos.length < 1) return;
            var params = {
                'serviceid': 'nb_materialrelease',
                'methodname': 'queryFlag',
                'MaterialIds': trsspliceString.spliceString($scope.data.videos, 'MATERIALID', ','),
            };
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, 'get').then(function(data) {
                angular.forEach($scope.data.videos, function(value, key) {
                    $timeout(function() {
                        value.isTakeDraft = data[value.MATERIALID];
                    });
                });
            });
        }
        /**
         * [listenStorage description]监听本地缓存
         * @return {[promise]} [description] promise
         */
        function listenStorage() {
            storageListenerService.listenResource(function() {
                requestData().then(function() {
                    queryFlag();
                });
                storageListenerService.removeListener("resource");
            });
        }
        /**
         * [clickedVideo description] 点击选中该音视频
         * @param  {[obj]} video [description] 音视频
         * @return {[type]}     [description] null
         */
        $scope.clickedVideo = function(video) {
            if ($scope.data.selectedArray.indexOf(video) < 0) {
                $scope.data.selectedArray.push(video);
            } else {
                $scope.data.selectedArray.splice($scope.data.selectedArray.indexOf(video), 1);
            }
        };
        /**
         * [batchDelete description] 批量删除素材
         * @param  {[array]} array [description] 素材数组
         * @return {[type]}       [description] null
         */
        $scope.batchDelete = function(array) {
            var params = {
                'serviceid': 'nb_material',
                'methodname': 'deleteMaterials',
                'materialIds': trsspliceString.spliceString(array, "MATERIALID", ","),
                'TypeID': $state.params.materialtypeid,
                'logicDelete': 1,
            };
            trsconfirm.confirmModel('删除素材', '是否确定删除？', function() {
                trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, 'post').then(function(data) {
                    requestData();
                    trsconfirm.alertType("删除成功", "", "success", false);
                });
            });
        };
        /**
         * [separateDelete description] 单独删除素材
         * @param  {[obj]} item [description] 素材
         * @return {[type]}      [description] null
         */
        $scope.separateDelete = function(item) {
            $scope.batchDelete([item]);
        };
        /**
         * [takeDraft description] 素材取稿
         * @return {[type]} [description] null
         */
        $scope.takeDraft = function() {
            var params = {
                serviceid: "nb_materialrelease",
                methodname: "fetchVideo",
                MaterialIds: trsspliceString.spliceString($scope.data.selectedArray, "MATERIALID", ","),
                TypeID: $state.params.materialtypeid,
            };
            var isOnlyOne = $scope.data.selectedArray.length > 1 ? false : true;
            var isVideoLib = $location.path().indexOf("video") >= 0; //是否是音视频库
            var modalInstance = resCtrModalService.fullTakeDraft(params, isOnlyOne, isVideoLib);
            modalInstance.result.then(function() {
                queryFlag();
            }, function() {});
        };
        /**
         * [viewInfo description] 查看"取"稿信息
         * @param  {[type]} id [description] 素材id
         * @return {[type]}    [description]
         */
        $scope.viewInfo = function(id) {
            var infoModal = resCtrModalService.materialInfoModal(id);
        };
        /**
         * [ConsolidatedDraft description] 合并取稿
         * @return {[type]} [description] null
         */
        $scope.consolidatedDraft = function() {
            if ($scope.data.selectedArray.length < 2) {
                trsconfirm.alertType("单个音视频不允许合并", "", "error", false);
                return;
            }
            var params = {
                'serviceid': "nb_materialrelease",
                'methodname': "mergeFetchVideo",
                'MaterialIds': trsspliceString.spliceString($scope.data.selectedArray, 'MATERIALID', ','),
                'TypeID': $state.params.materialtypeid,
            };
            var isVideoLib = $location.path().indexOf("video") >= 0; //是否是音视频库
            var modalInstance = resCtrModalService.fullTakeDraft(params, false, isVideoLib);
            modalInstance.result.then(function() {
                trsconfirm.alertType("合并音视频成功！", "", "success", false, function() {
                    queryFlag();
                });
            }, function() {});
        };
        /**
         * [selectPageNum description] 选择单页显示个数
         * @return {[type]} [description] null
         */
        $scope.selectPageNum = function() {
            $scope.status.params.PAGESIZE = $scope.data.page.PAGESIZE;
            $scope.status.params.CURRPAGE = $scope.data.page.CURRPAGE;
            $scope.status.copyCurrPage = 1;
            requestData().then(function() {
                queryFlag();
            });
        };
        /**
         * [pageChanged description] 下一页
         * @return {[type]} [description] null
         */
        $scope.pageChanged = function() {
            $scope.status.params.CURRPAGE = $scope.data.page.CURRPAGE;
            $scope.status.copyCurrPage = $scope.data.page.CURRPAGE;
            requestData().then(function() {
                queryFlag();
            });
        };
        /**
         * [jumpToPage description] 跳转指定页面1
         * @return {[type]} [description] null
         */
        $scope.jumpToPage = function() {
            if ($scope.status.copyCurrPage > $scope.data.page.PAGECOUNT) {
                $scope.status.copyCurrPage = $scope.data.page.PAGECOUNT;
            }
            $scope.status.params.CURRPAGE = $scope.status.copyCurrPage;
            $scope.data.page.CURRPAGE = $scope.status.copyCurrPage;
            requestData().then(function() {
                queryFlag();
            });
        };
        /**
         * [getESSearchParams description]设置ES检索参数
         * @return {[json]} [description] 参数对象
         */
        function getESSearchParams() {
            var esParams = {
                serviceid: "mlf_essearch",
                methodname: "QueryForMaterialDoc",
                searchParams: {
                    PAGESIZE: $scope.data.page.PAGESIZE + "",
                    PAGEINDEX: $scope.data.page.CURRPAGE + "",
                    searchFields: [{
                        searchField: $scope.meterailAllSelected.value,
                        keywords: $scope.keywords ? $scope.keywords : ""
                    }, {
                        searchField: "timeType",
                        keywords: $scope.timeType.value
                    }, {
                        searchField: "_sort",
                        keywords: $scope.sortType.value
                    }, {
                        searchField: "MATERIALTYPE",
                        keywords: 2 //音视频
                    }, {
                        searchField: "MATERIALTYPEID",
                        keywords: $state.params.materialtypeid
                    }, {
                        searchField: "MEDIATYPE",
                        keywords: ''
                    }]
                }
            };
            esParams.searchParams = JSON.stringify(esParams.searchParams);
            return esParams;
        }
        /**
         * [fullTextSearch description;全文检索]
         * @param  {[type]} ev [description:按下回车也能提交]
         */
        $scope.fullTextSearch = function(ev) {
            if ((angular.isDefined(ev) && ev.keyCode == 13) || angular.isUndefined(ev)) {
                $scope.status.isESSearch = true;
                $scope.data.page.CURRPAGE = 1;
                requestData().then(function() {
                    queryFlag();
                });
            }
        };
        /**
         * [download description]素材下载
         * @param  {[obj]} item  [description]要下载的单张素材
         * @return {[type]}      [description]
         */
        $scope.download = function(item) {
            var materialIds = !!item ? trsspliceString.spliceString([item], 'MATERIALID', ",") : trsspliceString.spliceString($scope.data.selectedArray, 'MATERIALID', ",");
            downloadMaterial(materialIds);
        };
        /**
         * [downloadMaterial description]素材下载
         * @param  {[str]} materialIds   [description]下载的素材ID串
         * @return {[type]}              [description]
         */
        function downloadMaterial(materialIds) {
            var params = {
                serviceid: "nb_materialrelease",
                methodname: "exportMasAudioVideo",
                TypeId: $state.params.materialtypeid,
                MaterialIds: materialIds
            };
            resourceCenterMaterialService.downLoadMaterial(params).then(function(data) {
                $window.open("/wcm/app/file/read_file.jsp?FileName=" + data.replace(/\"/g, ""));
                $scope.data.selectedArray = [];
            });
        }
    }
]);
