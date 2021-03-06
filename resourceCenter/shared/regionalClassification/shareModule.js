'use strict';
angular.module("oldResourceCenterSharedModule", ["resCenterGXRouterModule", "resourceCenterSharedMailModule"]).
controller("oldResourceCenterSharedCtrl", function($scope, $location, $q, $window, $stateParams, $timeout, $state, initComDataService, trsHttpService, resourceCenterService, leftService, resCtrModalService, trsconfirm, trsspliceString, globleParamsSet, localStorageService, storageListenerService, trsPrintService, groupUserRightsService, editingCenterService) {
    var typeName = $stateParams.typename,
        nodeid = $stateParams.nodeid;
    initStatus();
    initData();

    function initStatus() {
        if (nodeid && nodeid.indexOf("_") > -1) {
            nodeid = nodeid.split("_")[1];
        }
        $scope.status = {
            currModule: "gxgk",
            position: {
                iwo: '0',
                newspaper: '1',
                website: '2'
            },
            batchOperateBtn: {
                "hoverStatus": "",
                "clickStatus": ""
            },
            resource: $location.path(),
            showbutton: false,
            hasphoto: false,
            unloadover: true,
            isMedia: false,
            methodname: {
                1: "getNewsShareDoc",
                2: "getPicsShareDoc"
            },
            esType: {
                "": 0,
                "DocID": 1,
                "Cruser": 2,
                "docTitle": 3,
                "Content": 4
            },
            esTimeType: {
                "0": 0,
                "0d": 1,
                "1d": 2,
                "2d": 3,
                "15d": 4,
                "1m": 5
            },
            esDocType: {
                "": 0,
                "1": 1,
                "2": 2
            }
            // isSortHow: $stateParams.sort,
        };
        $scope.status.isSortShow = angular.isDefined($stateParams.typename) ? false : $stateParams.sort;
        $scope.data = {
            items: [],
            selectedArray: [],
            operFlags: [],
            printResult: []
        };
        $scope.basicParams = {
            channelName: $scope.status.currModule,
            typeName: typeName && typeName.replace("zyzx", ""),
            nodeId: nodeid,
            nodename: $stateParams.nodename
        };
        $scope.page = {
            "CURRPAGE": 1,
            "PAGESIZE": 200,
            "ITEMCOUNT": 0,
            "PAGECOUNT": 0
        };
        $scope.params = {
            "serviceid": "mlf_releaseSource",
            // "methodname": "queryTongYiGongGao",
            "CurrPage": $scope.page.CURRPAGE,
            "PageSize": $scope.page.PAGESIZE,
            "MetaCategoryId": $stateParams.nodeid,
            "DocType": "",
            "ShareTime": "",
            "IsUnit": $scope.status.isMedia
        };
        if (typeName == "area" || typeName == "zyzxfield" || $stateParams.sort == "true") {
            $scope.isESSearch = true; //是否请求es部分服务
            $scope.hideNewsType = false;
        } else {
            $scope.isESSearch = false; //是否请求es部分服务
            $scope.hideNewsType = true;
        }
        $scope.numberOfNewDocs = 0;
        $timeout(loadNewItems, 1000 * 60);
        //路由中的keywords作为检索词
        $scope.keywords = angular.isUndefined($stateParams.keywords) ? "" : decodeURI($stateParams.keywords);
    }
    /** [clearPageData 清楚列表数据] */
    function clearPageData() {
        $scope.params.CurrPage = 1;
        $scope.data.items = [];
        $scope.data.selectedArray = [];
        $scope.status.unloadover = true;
    }
    /** [initData 初始化数据] */
    function initData() {
        if (nodeid) {
            listenStorage();
            initDropDown();
            requestData();
        }
        $scope.$on('$destroy', function() {
            localStorageService.remove("resCtrGxgkDetailMethodnameCache");
            localStorageService.remove("resCtrGxgkDetailIdCache");
            localStorageService.remove("newspaperPreviewCache");
        });
    }
    /**
     * [listenStorage description]监听本地缓存
     * @return {[promise]} [description] promise
     */
    function listenStorage() {
        localStorageService.set('newspaperPreviewSelectArray', []);
        storageListenerService.listenResource(function() {
            requestData();
            storageListenerService.removeListener("resource");
        });
    }
    /** [initDropDown 初始化下拉列表数据] */
    function initDropDown() {
        $scope.time = {
            data: initComDataService.timeRange(),
            //curValue: initComDataService.timeRange()[0]
        };
        $scope.time.curValue = angular.isDefined($stateParams.estimetype) ? initComDataService.timeRange()[$scope.status.esTimeType[$stateParams.estimetype]] : initComDataService.timeRange()[0];
        $scope.docType = {
            data: initComDataService.newsType(),
            //curValue: initComDataService.newsType()[0]
        };
        $scope.docType.curValue = angular.isDefined($stateParams.esdoctype) ? initComDataService.newsType()[$scope.status.esDocType[$stateParams.esdoctype]] : initComDataService.newsType()[0];
        $scope.keyType = {
            data: initComDataService.searchKeyType(),
        };
        $scope.keyType.curValue = angular.isDefined($stateParams.estype) ? initComDataService.searchKeyType()[$scope.status.esType[$stateParams.estype]] : initComDataService.searchKeyType()[0];
        $scope.newsType = {
            data: initComDataService.docType(),
            curValue: initComDataService.docType()[0]
        };
        $scope.shareSort = {
            data: initComDataService.shareSort(),
            curValue: initComDataService.shareSort()[1]
        };
    }
    /** --------- 分页开始 --------- */
    /** 下拉 */
    $scope.selectPageNum = function() {
        $timeout(function() {
            $scope.params.PageSize = $scope.page.PAGESIZE;
            requestData();
        });
    };
    /** 页面切换 */
    $scope.pageChanged = function() {
        $scope.params.CurrPage = $scope.page.CURRPAGE;
        requestData();
    };
    $scope.$watch("page.CURRPAGE", function(newValue) {
        if (newValue > 0) {
            $scope.jumpToPageNum = newValue;
        }
    });
    /** 跳转指定页面 */
    $scope.jumpToPage = function() {
        if ($scope.jumpToPageNum > $scope.page.PAGECOUNT) {
            $scope.page.CURRPAGE = $scope.page.PAGECOUNT;
            $scope.jumpToPageNum = $scope.page.CURRPAGE;
        }
        $scope.params.CurrPage = $scope.jumpToPageNum;
        requestData();
    };
    /** --------- 分页结束 --------- */

    /** --------- 稿件操作开始 --------- */
    /**
     * [openTakeDraftModal description]取稿(by wang.jiang)
     * @return {[type]} [description]
     */
    $scope.openTakeDraftModal = function() {
        if (!determineSelected()) return;
        var ids = trsspliceString.spliceString($scope.data.selectedArray, "METADATAID", ",");
        var params = {
            serviceid: "mlf_releasesource",
            methodname: "fetch",
            MetaDataIds: ids,
            SourceName: "资源中心-共享稿库-" + $scope.basicParams.nodename
        };
        var isOnlyOne = ids.split(",").length > 1 ? false : true;
        var modalInstance = resCtrModalService.fullTakeDraft(params, isOnlyOne);
        modalInstance.result.then(function() {
            requestData();
        }, function() {
            initOperFlag();
            $scope.data.selectedArray = [];
        });
    };
    /** 创作轴 */
    $scope.CreationAxis = function() {
        if (!determineSelected()) return;
        var ids = trsspliceString.spliceString($scope.data.selectedArray, "METADATAID", ",");
        var param = {
            "MetaDataIds": ids,
            "channelName": $scope.basicParams.channelName
        };
        resourceCenterService.setCreation(param).then(function(data) {
            if (data.message) {
                trsconfirm.alertType("", data.message, "error", false, function() {
                    $scope.data.selectedArray = [];
                });
            } else {
                trsconfirm.alertType("该稿件已成功加入创作轴!", "", "success", false, function() {
                    $scope.data.selectedArray = [];
                });
            }
        });
    };
    /**
     * [printBtn description：打印]
     */
    $scope.printBtn = function() {
        if (!determineSelected()) return;
        angular.forEach($scope.data.selectedArray, function(value, key) {
            requestPrintVersion(value).then(function(data) {
                requestPrintData(value, data);
            })
        });
    };
    /**
     * [requestPrintVersion description：打印请求流程]
     */
    function requestPrintVersion(item) {
        var deferred = $q.defer();
        $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), {
            serviceid: "mlf_metadatalog",
            methodname: "query",
            MetaDataId: item.METADATAID
        }, 'get').then(function(data) {
            deferred.resolve(data.DATA);
        });
        return deferred.promise;
    };
    /**
     * [requestPrintVersion description：打印请求详情]
     */
    function requestPrintData(item, version) {
        var params = {
            "serviceid": "mlf_myrelease",
            "methodname": $scope.status.methodname[item.DOCTYPEID],
            "MetaDataId": item.METADATAID
        }
        $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "post").then(function(data) {
            var result = data;
            data.VERSION = version;
            data.HANGCOUNT = Math.ceil(data.DOCWORDSCOUNT / 27);
            $scope.data.printResult.push(result);
            if ($scope.data.printResult.length == $scope.data.selectedArray.length) {
                trsPrintService.trsPrintShare($scope.data.printResult);
                $scope.data.printResult = [];
            }
        });
    }

    /** 收藏 */
    $scope.collect = function() {
        if (!determineSelected()) return;
        var ids = trsspliceString.spliceString($scope.data.selectedArray, "METADATAID", ",");
        var params = {
            channelName: $scope.basicParams.channelName,
            MetaDataIds: ids
        };
        resourceCenterService.collectDocs(params).then(function(data) {
            trsconfirm.alertType("收藏成功!", "", "success", false, "");
        });
    };
    /** 导出 */
    $scope.export = function() {
        if (!determineSelected()) return;
        var params = {
            serviceid: 'mlf_exportword',
            methodname: 'exportWordFile',
            MetaDataIds: trsspliceString.spliceString($scope.data.selectedArray, "METADATAID", ","),
        };
        $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "post").then(function(data) {
            window.open("/wcm/app/file/read_file.jsp?FileName=" + data.REPORTS[0].DETAIL);
        }, function(data) {
            if (data.REPORTS[0].ISSUCCESS == 'true') {
                window.open("/wcm/app/file/read_file.jsp?FileName=" + data.REPORTS[0].DETAIL);
            }
        });
    };
    /** 预留 */
    $scope.openReserveDraftModal = function() {
        if (!determineSelected()) return;
        var resCtrModalServiceModal = resCtrModalService.reserveDraft($scope.data.selectedArray);

        resCtrModalServiceModal.result.then(function(result) {
            var metadataids = "";
            angular.forEach(result.items, function(n, i) {
                metadataids += "," + n.METADATAID;
            });
            result.MetaDataIds = metadataids.substr(1);
            delete result.items;
            result.SourceName = "资源中心-共享稿库-" + $scope.basicParams.nodename;
            resourceCenterService.delayFetch(result).then(function(data) {
                trsconfirm.alertType("预留成功!", "", "success", false, "");
                requestData();
            }, function() {
                initOperFlag();
                $scope.data.selectedArray = [];
            });

        });
    };
    /** [deleteDrafts 删除稿件] */
    $scope.deleteDrafts = function() {
        if (!determineSelected()) return;
        trsconfirm.confirmModel("删除", "是否从共享稿库删除", function() {
            var ids = trsspliceString.spliceString($scope.data.selectedArray, "METADATAID", ",");
            resourceCenterService.deleteRelease(ids).then(function(data) {
                if (data && data.ISSUCCESS == "true") {
                    trsconfirm.alertType("删除成功！", "", "success", false, "");
                    requestData();
                }
            }, function() {
                requestData();
            });
        })
    };
    /**
     * [selectAll description:全选]
     */
    $scope.selectAll = function() {
        $scope.data.selectedArray = $scope.data.selectedArray.length == $scope.data.items.length ? [] : [].concat($scope.data.items);
    };
    /**
     * [selectDoc 单选]
     * @param  {[type]} item [description：单个对象] 
     */
    $scope.selectDoc = function(item) {
        var index = $scope.data.selectedArray.indexOf(item);
        if (index < 0) {
            $scope.data.selectedArray.push(item);
        } else {
            $scope.data.selectedArray.splice(index, 1);
        }
    };
    /** --------- 稿件操作结束 --------- */
    /** 发送请求 */
    function requestData() {
        var serviceName = "",
            params = {};
        if ($scope.isESSearch) {
            if ($scope.basicParams.typeName == "field") {
                serviceName = "queryForShareContentDoc";
                params = getESSearchParams2("topic", $scope.basicParams.nodeId);
            } else if ($scope.basicParams.typeName == "area") {
                serviceName = "queryForShareContentDoc";
                params = getESSearchParams2("area", $scope.basicParams.nodeId);
            } else {
                serviceName = "getEsDataList";
                params = getESSearchParams();
            }
        } else {
            serviceName = "queryTongYiGongGao";
            // serviceName = $scope.status.isMedia === false ? "queryTongYiGongGao" : "queryMediaRelease";
            params = angular.extend($scope.params, {
                DocType: $scope.docType.curValue.value || "",
                ShareTime: $scope.time.curValue.value || "",
                // keywords: $scope.keywords || "",
            });
        }

        $scope.loadingPromise = resourceCenterService[serviceName](params).then(function(data) {
            angular.forEach(data.DATA, function(n, i) {
                n.newsId = $scope.page.PAGESIZE * ($scope.page.CURRPAGE - 1) + i + 1;
            });
            cacheCurPageIds(data.DATA);
            selectedCurrentsArray(data.DATA);

            if (!data.PAGER) {
                $scope.page.ITEMCOUNT = 0;
            } else {
                $scope.page = angular.extend($scope.page, data.PAGER);
            }

            $scope.numberOfNewDocs = 0;
            $scope.data.selectedArray = [];

            if (!$scope.status.hasphoto) {
                $scope.data.items = [];
            }

            //先显示部分数据，页面滚动时，再显示部分数据
            allCacheData = data.DATA;
            render(allCacheData.splice(0, 20));
        });
    }


    var allCacheData = [];

    function loadMore() {
        if (allCacheData.length <= 0) {
            return;
        }

        var scrollHeight = parseInt(document.body.scrollHeight, 10);
        var scrollTop = parseInt(document.body.scrollTop, 10);
        var clientHeight = parseInt(document.body.clientHeight, 10);

        if ((scrollTop + clientHeight + 120) >= scrollHeight) {
            render(allCacheData.splice(0, 20));
        }
    }

    $(document).bind('scroll', loadMore);

    $scope.$on('$destroy', function() {
        $(document).unbind('scroll', loadMore);
    });


    /**
     * 考虑到性能，先显示30条，随后再加载剩余的条数
     * @return {[type]} [description]
     */
    function render(dataList) {
        $scope.data.items = $scope.data.items.concat(dataList);

        if (!$scope.status.hasphoto) {
            initOperFlag();
        } else {
            if ($scope.page.PAGECOUNT == 1) {
                $scope.status.unloadover = false;
            }
        }

        var q1 = requestListImg(dataList).then(function(data2) {
            angular.forEach(dataList, function(value, key) {
                value.ALLIMG = data2[value.METADATAID];
            });
        });

        $scope.data.MetaDataIds = trsspliceString.spliceString(dataList,
            "METADATAID", ',');
        var q2 = getDraftRecord().then(function(data) {
            if (angular.isObject(data)) {
                angular.forEach(dataList, function(value, key) {
                    value.OPERUSER = data[value.METADATAID];
                    if (angular.isDefined(value.OPERUSER)) {
                        for (var i = 0; i < value.OPERUSER.length; i++) {
                            var temp = value.OPERUSER[i].OPERUSER;
                            temp = temp.split('-');
                            value.OPERUSER[i].OPERUSER = temp.length > 1 ? temp[0] + '-' + temp.pop() : temp[0];
                        }
                    }
                });
            }
        });

        return $q.all([q1, q2]);
    }


    $scope.isMedia = function() {
        $scope.status.isMedia = !$scope.status.isMedia;
        $scope.params.IsUnit = $scope.status.isMedia;
        requestData();
    };
    /**
     * [getDraftRecord description]获得取稿件人
     * @return {[type]} [description]
     */
    function getDraftRecord() {
        var deferred = $q.defer();
        var params = {
            serviceid: "mlf_releasesource",
            methodname: "queryQuOpers",
            MetaDataIds: $scope.data.MetaDataIds
        };
        trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "POST").then(function(data) {
            deferred.resolve(data);
        });
        return deferred.promise;
    }
    /** 新添加的数据 */
    function loadNewItems() {
        if ($scope.page.maxId) {
            var params = angular.extend($scope.basicParams, {
                maxId: $scope.page.max,
                serviceid: $scope.basicParams.channelName
            });
            resourceCenterService.getPageInfobyItem(params).then(function(data) {
                $scope.numberOfNewDocs = data.number;
            }, function() {});
        }
    }

    $scope.viewInfo = function(ChnlDocId, showRepeat) {
        var infoModal = resCtrModalService.infoModal(ChnlDocId, showRepeat);
    };
    /** [initOperFlag 取签见撤重] */
    var initOperFlag = function(contents) {
        var docIds = trsspliceString.spliceString($scope.data.items, "METADATAID", ",");
        if (docIds) {
            var params = angular.extend($scope.basicParams, {
                MetaDataIds: docIds
            });
            resourceCenterService.getWcmTags(params).then(function(data) {
                $scope.data.operFlags = [];
                var temp = data;
                for (var i in temp) {
                    if (angular.isDefined(data[i]) && data[i].OPERFLAG.indexOf("1") > -1) {
                        $scope.data.operFlags = $scope.data.operFlags.concat(data[i]);
                    }
                }
            });
        }
    };
    /**
     * [showOperFlag description] 显示取签见撤重标志
     * @param  {[type]} guid      [description]
     * @param  {[type]} flagIndex [description]
     * @return {[type]}           [description]
     */
    $scope.showOperFlag = function(guid, flagIndex) {
        var temp = queryItemBYGUID(guid);
        if (!!temp) {
            return queryItemBYGUID(guid).OPERFLAG.substr(flagIndex, 1) == "1" ? true : false;
        } else {
            return false;
        }
    };
    /**
     * [queryItemBYGUID description] 根据guid获取在WCM内的取签见撤重的二进制数
     * @param  {[type]} guid [description]
     * @return {[type]}      [description]
     */
    function queryItemBYGUID(guid) {
        for (var i in $scope.data.operFlags) {
            if (guid == $scope.data.operFlags[i].METADATAID) {
                return $scope.data.operFlags[i];
            }
        }
    }
    /**
     * [getESSearchParams description]设置ES检索参数
     * @return {[json]} [description] 参数对象
     */
    function getESSearchParams() {
        var esParams = {
            searchParams: {
                PAGESIZE: $scope.page.PAGESIZE + "",
                PAGEINDEX: $scope.page.CURRPAGE + "",
                searchFields: [{
                    searchField: "docType",
                    keywords: $scope.docType.curValue.value
                }, {
                    searchField: "newsType",
                    keywords: $scope.basicParams.nodeId
                }, {
                    searchField: "timeType",
                    keywords: $scope.time.curValue.value
                }, {
                    searchField: $scope.keyType.curValue.value,
                    keywords: $scope.keywords || ""
                }, {
                    searchField: "isOnlyMedia",
                    keywords: $scope.status.isMedia
                }, {
                    searchField: "_sort",
                    keywords: $scope.shareSort.curValue.value
                }]
            }
        };

        esParams.searchParams = JSON.stringify(esParams.searchParams);
        return esParams;
    }
    /**
     * [getESSearchParams description]设置ES检索参数
     * @return {[json]} [description] 参数对象
     */
    function getESSearchParams2(contentType, typeValue) {
        var esParams = {
            searchParams: {
                PAGESIZE: $scope.page.PAGESIZE + "",
                PAGEINDEX: $scope.page.CURRPAGE + "",
                searchFields: [{
                    searchField: "contentType",
                    keywords: contentType
                }, {
                    searchField: "typeValue",
                    keywords: typeValue
                }, {
                    searchField: "newsType",
                    keywords: $scope.newsType.curValue.value
                }, {
                    searchField: "timeType",
                    keywords: $scope.time.curValue.value
                }, {
                    searchField: "docType",
                    keywords: $scope.docType.curValue.value
                }, {
                    searchField: $scope.keyType.curValue.value,
                    keywords: $scope.keywords || ""
                }, {
                    searchField: "_sort",
                    keywords: $scope.shareSort.curValue.value
                }]
            }
        };

        esParams.searchParams = JSON.stringify(esParams.searchParams);
        return esParams;
    }
    /**
     * [determineSelected description] 判断是否有选中稿件
     */
    function determineSelected() {
        if (!$scope.data.selectedArray.length) {
            trsconfirm.alertType("请先选择稿件！", "", "error", false, "");
            return false;

        } else {
            return true;
        }
    }
    /**
     * [fullTextSearch description;全文检索]
     * @param  {[type]} ev [description:按下空格也能提交]
     */
    $scope.fullTextSearch = function(ev) {
        $scope.status.isSortShow = true;
        $scope.isESSearch = true;
        if ((angular.isDefined(ev) && ev.keyCode == 13) || angular.isUndefined(ev)) {
            $scope.page.CURRPAGE = 1;
            requestData();
        }
    };
    $scope.searchWithKeyword = function() {
        if ($scope.docType.curValue.value == "2") {
            $scope.status.showbutton = true;
        } else {
            $scope.status.showbutton = false;
            $scope.status.hasphoto = false;
        }
        clearPageData();
        requestData();
    };
    /** [switchImg 图片轮播] */
    $scope.switchImg = function(item) {
        $scope.curImg = item.METADATAID;
    };

    /**
     * [cacheDate description] 缓存数据以供细览的上下翻页
     * @return {[type]} [description]
     */
    function cacheCurPageIds(data) {
        var copyData = angular.copy(data);
        var methodname = {
            "1": "getNewsShareDoc",
            "2": "getPicsShareDoc"
        };
        var cacheId = [];
        var cacheMethodname = [];
        for (var i in copyData) {
            copyData[i].methodname = methodname[copyData[i].DOCTYPEID];
            cacheId.push(copyData[i].METADATAID);
            cacheMethodname.push(copyData[i].methodname);
        }
        localStorageService.set("resCtrGxgkDetailIdCache", cacheId);
        localStorageService.set("resCtrGxgkDetailMethodnameCache", cacheMethodname);
    }
    /**
     * [cacheDate description] 缓存存储
     * @return {[type]} [description]
     */
    function listItemCache(data) {
        var cacheData = angular.copy(data);
        var cachePreview = [];
        var cachePreviewMetadataid = [];
        for (var i in cacheData) {
            cachePreview.push(cacheData[i]);
        }
        angular.forEach(cachePreview, function(data, index, array) {
            angular.forEach(data, function(_data, _index, _array) {
                cachePreviewMetadataid.push(_data.METADATAID);
            });
        });
        localStorageService.set("newspaperPreviewCache", cachePreviewMetadataid);
    }
    /**
     * [selectedArrayCahe description] 缓存当前选中项
     * @array {[type]} [description]  选中对象
     */
    function selectedArrayCahe(array) {
        var selectedArray = angular.copy(array);
        var selectedArrayMetadaid = [];
        angular.forEach(selectedArray, function(data, index) {
            selectedArrayMetadaid.push(data.METADATAID);
        });
        localStorageService.set("newspaperPreviewSelectArray", selectedArrayMetadaid);
    }

    /**
     * [selectedArrayCahe description] 缓存中item请求选中项
     * @array {[type]} [description]  选中对象
     */
    function selectedCurrentsArray(data) {
        $scope.data.selectedArrat = [];
        var curSelectedArray = [];
        for (var i in data) {
            curSelectedArray.push(data[i]);
        }
        angular.forEach(curSelectedArray, function(data, index) {
            $scope.data.selectedArrat.push(data);
        });
        //监听预览页 按钮点击
        $window.addEventListener("storage", function(e) {
            $scope.data.selectedCurrents = angular.copy(localStorageService.get("newspaperPreviewSelectArray"));
            $scope.$apply(function() {
                forArray($scope.data.selectedCurrents);
            });
        });
    }
    /**
     * [forArray description] 遍历出选择对象
     * @selectedArrat {[type]} [description]  选中 对象
     */
    function forArray(selectedArrat) {
        if (selectedArrat === null) return;
        //var arrays=[];
        $scope.data.selectedArray = [];
        for (var i = 0; i < selectedArrat.length; i++) {
            for (var j = 0; j < $scope.data.selectedArrat.length; j++) {
                if (selectedArrat[i] === $scope.data.selectedArrat[j].METADATAID) {
                    $scope.data.selectedArray.push($scope.data.selectedArrat[j]);
                }
            }
        }
    }
    /*
     * [isChecked description] 点击单选
     * @item {[type]} [description]  当前选择值
     */
    $scope.isChecked = function(item) {
        return getIndex(item) >= 0;
    };
    /*
     * [getIndex description] 单选方法
     * @item {[type]} [description]  当前选择值
     */
    function getIndex(item) {
        var selectedArray = $scope.data.selectedArray;
        for (var index = 0; index < selectedArray.length; index++) {
            if (selectedArray[index].METADATAID == item.METADATAID) {
                return index;
            }
        }
        return -1;
    }
    /**
     * [singleSelect description]单选
     * @param  {[type]} item [description] 单个对象
     * @return {[type]}      [description] null
     */
    $scope.singleSelect = function(item) {
        var index = getIndex(item);
        //var index = $scope.data.selectedArray.indexOf(item);
        index > -1 ? $scope.data.selectedArray.splice(index, 1) : $scope.data.selectedArray.push(item);
        selectedArrayCahe($scope.data.selectedArray);
    };
    /** 切换文字图片列表 */
    $scope.togglehasphoto = function(temp) {
        $scope.status.hasphoto = temp;
        clearPageData();
        requestData();
    };
    /** [loadMore 加载图片分页] */
    $scope.loadMore = function() {
        $scope.params.CurrPage++;
        if ($scope.params.CurrPage > $scope.page.PAGECOUNT) {
            $scope.status.unloadover = false;
            return;
        }
        requestData();
    };
    /**
     * [requestListImg description:查询列表图示]
     */
    function requestListImg(items) {
        var defer = $q.defer();
        if (!items || items.length < 1) defer.reject();
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
    };
    /**
     * [outSending description]外发
     * @return {[type]} [description] null
     */
    $scope.outSending = function() {
        editingCenterService.outSending("", function(result) {
            outSendingDraft(result.selectItems);
        });
    };

    function outSendingDraft(items) {
        var userids = trsspliceString.spliceString(items, 'EMAIL', ",");
        var draftids = trsspliceString.spliceString($scope.data.selectedArray, 'METADATAID', ",");
        var params = {
            serviceid: "mlf_mailoutgoingOper",
            methodname: "iRecordSendEmail",
            Emails: userids,
            MetaDataIds: draftids
        };
        trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function(data) {
            trsconfirm.alertType("邮件外发成功", "", "success", false, function() {
                requestData();
            });
        });
    };


});
