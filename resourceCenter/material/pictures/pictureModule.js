"use strict";
/**
 * 图片库
 * Modified by ZSS in 2016/11/28
 * Modified by XueXiaoting in 2016/12/06.
 */
angular.module("resourceCenterPictureModule", [
        "util.waterflow",
        "resourceCenterPictureDetailModule",
        "resourceCenterPictureEditModule"
    ])
    .controller("resourceCenterPictureCtrl", ['$scope', '$q', '$state', '$timeout', '$filter', '$window', 'initComDataService', 'trsHttpService', 'storageListenerService', 'resCtrModalService', 'trsspliceString', 'trsconfirm', 'resourceCenterMaterialService', 'globleParamsSet', 'initSingleSelecet',
        function($scope, $q, $state, $timeout, $filter, $window, initComDataService, trsHttpService, storageListenerService, resCtrModalService, trsspliceString, trsconfirm, resourceCenterMaterialService, globleParamsSet, initSingleSelecet) {
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
                    picture: {
                        'MATERIALID': '',
                        'TYPEID': '',
                        'TITLE': '',
                        'CONTENT': '',
                        'FILEPATH': '',
                        'CRUSER': '',
                        'CRTIME': '',
                    },
                    page: {
                        'CURRPAGE': 1,
                        'PAGESIZE': globleParamsSet.setResourceCenterPageSize,
                        "ITEMCOUNT": 0,
                        'PAGECOUNT': '',
                    },
                    selectedArray: [], //存放选中的图片
                    materialTypeId: $state.params.materialtypeid, //图片素材ID
                    topclassifyid: $state.params.topclassifyid, //顶部分类ID
                };
                $scope.status = {
                    batchOperateBtn: {
                        "hoverStatus": "",
                        "clickStatus": "",
                        "btnRights": "", //按钮权限
                    },
                    params: {
                        'serviceid': 'nb_material',
                        'methodname': 'query',
                        'TypeId': $state.params.materialtypeid,
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
                getBtnRights();
                listenStorage();
                initDropDown();
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
                $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function(data) {
                    !!data.PAGER ? $scope.data.page = data.PAGER : $scope.data.page.PAGECOUNT = '0';
                    $scope.data.pictures = data.DATA;
                    deffer.resolve();
                });
                return deffer.promise;
            }
            /**
             * [queryFlag description] 查询已取稿图片列表
             * @return {[type]} [description] null
             */
            function queryFlag() {
                if ($scope.data.pictures.length < 1) return;
                var params = {
                    'serviceid': 'nb_materialrelease',
                    'methodname': 'queryFlag',
                    'MaterialIds': trsspliceString.spliceString($scope.data.pictures, 'MATERIALID', ','),
                };
                trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, 'get').then(function(data) {
                    angular.forEach($scope.data.pictures, function(value, key) {
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
             * [clickedPic description] 点击选中该图片
             * @param  {[obj]} pic [description] 图片
             * @return {[type]}     [description] null
             */
            $scope.clickedPic = function(pic) {
                if ($scope.data.selectedArray.indexOf(pic) < 0) {
                    $scope.data.selectedArray.push(pic);
                } else {
                    $scope.data.selectedArray.splice($scope.data.selectedArray.indexOf(pic), 1);
                }
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
             * [jumpToPage description] 跳转指定页面
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
             * [takeDraft description] 素材取稿
             * @return {[type]} [description] null
             */
            $scope.takeDraft = function() {
                var params = {
                    serviceid: "nb_materialrelease",
                    methodname: "fetch",
                    MaterialIds: trsspliceString.spliceString($scope.data.selectedArray, "MATERIALID", ","),
                    TypeID: $state.params.materialtypeid,
                };
                var isOnlyOne = $scope.data.selectedArray.length > 1 ? false : true;
                var modalInstance = resCtrModalService.fullTakeDraft(params, isOnlyOne);
                modalInstance.result.then(function() {
                    queryFlag();
                }, function() {});
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
             * [getImgUrl description] 获得并复制图片发布地址
             * @return {[type]} [description] null
             */
            $scope.getImgUrl = function(picId) {
                var params = {
                    serviceid: 'nb_material',
                    methodname: 'createURL',
                    materialId: picId,
                    typeId: $state.params.materialtypeid,
                    size: 600,
                };
                trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, 'get').then(function(data) {
                    var imgUrl = JSON.parse(data);
                    resourceCenterMaterialService.copyImgUrl(imgUrl);
                });
            };
            /**
             * [ConsolidatedDraft description] 合并取稿
             * @return {[type]} [description] null
             */
            $scope.consolidatedDraft = function() {
                if ($scope.data.selectedArray.length < 2) {
                    trsconfirm.alertType("单张图片不允许合并", "", "error", false);
                    return;
                }
                var params = {
                    'serviceid': "nb_materialrelease",
                    'methodname': "mergeFetch",
                    'MaterialIds': trsspliceString.spliceString($scope.data.selectedArray, 'MATERIALID', ','),
                    'TypeID': $state.params.materialtypeid,
                };
                var modalInstance = resCtrModalService.fullTakeDraft(params, false);
                modalInstance.result.then(function() {
                    trsconfirm.alertType("合并图集成功！", "", "success", false, function() {
                        queryFlag();
                    });
                }, function() {});
            };
            /**
             * [addToCreation description] 加入创作轴
             * @return {[type]} [description] null
             */
            $scope.addToCreation = function() {
                if (!$scope.data.selectedArray) return;
                var ids = trsspliceString.spliceString($scope.data.selectedArray, "MATERIALID", ",");
                var params = {
                    serviceid: 'nb_material',
                    methodname: 'creation',
                    MaterialIds: ids,
                    typeId: $state.params.materialtypeid,
                };
                trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, 'get').then(function(data) {
                    trsconfirm.alertType(data.TITLE, data.REPORTS.DETAIL, 'success', false);
                });
            };
            /**
             * [viewInfo description] 查看"取"素材信息
             * @param      {<type>}  ChnlDocId   The channel document identifier
             */
            $scope.viewInfo = function(ChnlDocId) {
                var infoModal = resCtrModalService.materialInfoModal(ChnlDocId);
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
                            keywords: 1 //图片库
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
                    serviceid: "nb_material",
                    methodname: "downLoadMaterialPics",
                    materialTypeId: $state.params.materialtypeid,
                    materialIds: materialIds
                };
                resourceCenterMaterialService.downLoadMaterial(params).then(function(data) {
                    $window.open("/wcm/app/file/read_file.jsp?FileName=" + data.replace(/\"/g, ""));
                    $scope.data.selectedArray = [];
                });
            }
        }
    ]);
