"use strict";
/*
    created by cc 2016-07-18
 */
angular.module('editingCenterPendingModule', [
        'editingCenterPendingRouterModule',
        'trsNavLocationModule',
    ]).controller("editingCenterPendingappCtrl", ["$scope", "$q", "$stateParams", "$filter", "$window", "trsHttpService", "trsconfirm", "$document", "$popover", "$state", "initVersionService", "$modal", "trsspliceString", "$timeout", "trsResponseHandle", "initSingleSelecet", "editingCenterService", "globleParamsSet", "storageListenerService", "editingCenterAppService", "trsPrintService", "editcenterRightsService", "editIsLock", function($scope, $q, $stateParams, $filter, $window, trsHttpService, trsconfirm, $document, $popover, $state, initVersionService, $modal, trsspliceString, $timeout, trsResponseHandle, initSingleSelecet, editingCenterService, globleParamsSet, storageListenerService, editingCenterAppService, trsPrintService, editcenterRightsService, editIsLock) {
        initStatus();
        initData();
        /**
         * 重构开始
         */
        /**
         * [initStatus description]初始化状态
         * @return {[type]} [description]
         */
        function initStatus() {
            $scope.page = {
                "CURRPAGE": 1,
                "PAGESIZE": globleParamsSet.getPageSize(),
            };
            $scope.params = {
                "serviceid": "mlf_appmetadata",
                "methodname": "queryReviewDoc",
                "PageSize": $scope.page.PAGESIZE,
                "ChannelId": $stateParams.channelid,
                "CurrPage": $scope.page.CURRPAGE,
                "SiteId": $stateParams.siteid
            };
            $scope.status = {
                siteId: $stateParams.siteid,
                channelId: $stateParams.channelid,
                batchOperateBtn: {
                    hoverStatus: "",
                    clickStatus: "",
                },
                detailMethodname: {
                    1: 'getNewsDoc',
                    2: 'getPicsDoc',
                    3: 'getSpecialDoc',
                    4: 'getLinkDoc'
                },
                onlyMine: false,
                isESSearch: false,
                isShowMorebtnLength: 4, //大于4个按钮则更多显示
            };
            $scope.data = {
                selectedArray: [],
                copyCurrPage: 1,
                items: [],
                editPath: editingCenterAppService.initEditPath(),
                printResult: [],
            };
        }
        /**
         * [initData description]初始化数据
         * @return {[type]} [description]
         */
        function initData() {
            requestData();
            initDropDown();
            listenStorage();
            editcenterRightsService.initAppListBtn('app.daishen', $stateParams.channelid).then(function(rights) {
                $scope.status.btnRights = rights;
                getObjLength($scope.status.btnRights);
            });
        }
        /** 
         * [getObjLength description]计算对象长度
         * @return {[type]} [description]
         */
        function getObjLength(obj) {
            var size = 0,
                key;
            for (key in obj) {
                if (obj.hasOwnProperty(key)) size++;
            }
            $scope.status.btnLength = size;
        }
        /**
         * [requestData description]数据请求
         * @return {[type]} [description]
         */
        function requestData() {
            var params = $scope.status.isESSearch ? getESSearchParams() : $scope.params;
            $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function(data) {
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
         * [getESSearchParams description]设置ES检索参数
         * @return {[json]} [description] 参数对象
         */
        function getESSearchParams() {
            var esParams = {
                serviceid: "mlf_essearch",
                methodname: "queryForAppToBeReviewDoc",
                searchParams: {
                    PAGESIZE: $scope.page.PAGESIZE + "",
                    PAGEINDEX: $scope.page.CURRPAGE + "",
                    searchFields: [{
                        searchField: $scope.data.selectedClassify.value,
                        keywords: $scope.keywords ? $scope.keywords : ""
                    }, {
                        searchField: "docType",
                        keywords: $scope.data.selectedDocType.value
                    }, {
                        searchField: "timeType",
                        keywords: $scope.data.selectedTimeType.value
                    }, {
                        searchField: "isOnlyMine",
                        keywords: $scope.status.onlyMine
                    }, {
                        searchField: "channelid",
                        keywords: $stateParams.channelid
                    }, {
                        searchField: "_sort",
                        keywords: $scope.data.sortType.value
                    }]
                }
            };
            esParams.searchParams = JSON.stringify(esParams.searchParams);
            return esParams;
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
         * [initDropDown description]初始化下拉框
         * @return {[type]} [description]
         */
        function initDropDown() {
            $scope.data.timeTypeJsons = initSingleSelecet.timeType();
            $scope.data.selectedTimeType = angular.copy($scope.data.timeTypeJsons[0]);

            $scope.data.docTypeJsons = initSingleSelecet.appDocType();
            $scope.data.selectedDocType = angular.copy($scope.data.docTypeJsons[0]);

            $scope.data.sortTypeJsons = initSingleSelecet.sortType();
            $scope.data.sortType = angular.copy($scope.data.sortTypeJsons[1]);

            $scope.data.classifyJsons = initSingleSelecet.iWoEntire();
            $scope.data.selectedClassify = angular.copy($scope.data.classifyJsons[0]);
        }
        /**
         * [listenStorage description]监听本地缓存
         * @return {[promise]} [description] promise
         */
        function listenStorage() {
            storageListenerService.listenApp(function() {
                $scope.status.isESSearch = false;
                requestData();
                storageListenerService.removeListener("app");
            });
        }
        /**
         * [pageChanged description]跳转到下一页
         * @return {[type]} [description]
         */
        $scope.pageChanged = function() {
            $scope.params.CurrPage = $scope.page.CURRPAGE;
            $scope.data.copyCurrPage = $scope.page.CURRPAGE;
            requestData();
        };
        /**
         * [jumpToPage description]跳转到指定页
         * @return {[type]} [description]
         */
        $scope.jumpToPage = function() {
            if ($scope.data.copyCurrPage > $scope.page.PAGECOUNT) {
                $scope.data.copyCurrPage = $scope.page.PAGECOUNT;
            }
            $scope.params.CurrPage = $scope.data.copyCurrPage;
            requestData();
        };
        /**
         * [selectPageNum description]选择分页条数
         * @return {[type]} [description]
         */
        $scope.selectPageNum = function() {
            $scope.params.CurrPage = $scope.page.CURRPAGE;
            $scope.params.PageSize = $scope.page.PAGESIZE;
            $scope.data.copyCurrPage = 1;
            requestData();
        };
        /**
         * [selectAll description]稿件全选
         * @return {[type]} [description]
         */
        $scope.selectAll = function() {
            $scope.data.selectedArray = $scope.data.selectedArray.length == $scope.data.items.length ? [] : []
                .concat($scope.data.items);
        };
        /**
         * [selectDoc description]稿件单选
         * @param  {[obj]} item [description]稿件具体信息
         * @return {[type]}      [description]
         */
        $scope.selectDoc = function(item) {
            if ($scope.data.selectedArray.indexOf(item) < 0) {
                $scope.data.selectedArray.push(item);
            } else {
                $scope.data.selectedArray.splice($scope.data.selectedArray.indexOf(item), 1);
            }
        };
        /**
         * [isOnlyMine description]只看我的
         * @return {Boolean} [description] null
         */
        $scope.isOnlyMine = function() {
            $scope.data.copyCurrPage = $scope.params.CurrPage = $scope.page.CURRPAGE = "1";
            $scope.status.onlyMine = !$scope.status.onlyMine;
            $scope.params.isOnlyMine = $scope.status.onlyMine;
            requestData();
        };
        /**
         * [fullTextSearch description;全文检索]
         * @param  {[type]} ev [description:按下回车也能提交]
         */
        $scope.fullTextSearch = function(ev) {
            if ((angular.isDefined(ev) && ev.keyCode == 13) || angular.isUndefined(ev)) {
                if ($scope.data.selectedClassify.value == "DocID") {
                    $scope.status.isESSearch = false;
                    $scope.params.DocId = $scope.keywords;
                } else {
                    $scope.status.isESSearch = true;
                }
                $scope.page.CURRPAGE = 1;
                requestData();
            }
        };
        /**
         * [revoke description]撤稿
         * @return {[type]} [description]
         */
        $scope.revoke = function() {
            $scope.status.isESSearch = false;
            trsconfirm.inputModel("撤稿", "请输入撤稿意见", function(content) {
                rejection(content);
            });
        };
        /**
         * [rejection description]退稿函数
         * @return {[type]} [description]
         */
        function rejection(content) {
            var params = {
                serviceid: "mlf_appoper",
                methodname: "rejectionMetaDatas",
                ChnlDocIds: trsspliceString.spliceString($scope.data.selectedArray, 'CHNLDOCID', ","),
                MetaDataIds: trsspliceString.spliceString($scope.data.selectedArray, 'METADATAID', ","),
                Opinion: content,
                ChannelId: $stateParams.channelid
            };
            $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function() {
                trsconfirm.alertType("撤稿成功", "", "success", false, function() {
                    requestData();
                });
            });
        }
        /**
         * [directSigned description]直接签发
         * @param  {[obj]} item [description]稿件信息
         * @return {[type]}      [description]
         */
        $scope.directSigned = function(item) {
            $scope.status.isESSearch = false;
            trsconfirm.confirmModel("签发", "确认发布稿件", function() {
                sign(item);
            });
        };
        /**
         * [sign description]稿件直接签发
         * @param  {[obj]} item [description]稿件信息
         * @return {[type]}      [description]
         */
        function sign(item) {
            var array = !!item ? [item] : $scope.data.selectedArray;
            var params = {
                serviceid: "mlf_appoper",
                methodname: "appDaiShenPublish",
                ObjectIds: trsspliceString.spliceString(array, "CHNLDOCID", ","),
                ChnlDocIds: trsspliceString.spliceString(array, "CHNLDOCID", ","),
                MetaDataIds: trsspliceString.spliceString(array, "METADATAID", ","),
            };
            $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function(data) {
                trsconfirm.alertType("直接签发成功", "", "success", false, function() {
                    requestData();
                });
            });
        }
        /**
         * [timeSinged description]稿件定时签发
         * @param  {[obj]} item [description]稿件具体信息
         * @return {[type]}      [description]
         */
        $scope.timeSinged = function(item) {
            $scope.status.isESSearch = false;
            timeSingedDraft(item);
        };
        /**
         * [timeSingedDraft description]定时签发函数
         * @param  {[obj]} item [description]稿件具体信息
         * @return {[type]}      [description]
         */
        function timeSingedDraft(item) {
            var array = angular.isDefined(item) ? [item] : $scope.data.selectedArray;
            var params = {
                selectedArray: array,
                isNewDraft: false,
                serviceid: "mlf_appoper",
                methodname: "appDaiShenTimingPublish"
            };
            editingCenterService.draftTimeSinged(params).then(function(data) {
                trsconfirm.alertType("定时签发成功", "", "success", false, function() {
                    requestData();
                });
            }, function() {
                requestData();
            });
        }
        /**
         * [draftlist description]修改发稿单
         * @return {[type]} [description]
         */
        $scope.draftlist = function() {
            $scope.status.isESSearch = false;
            editingCenterService.draftList($scope.data.selectedArray, {
                "serviceid": "mlf_appfgd",
                "methodname": "appDaiShenbatchUpdateFgdUsers"
            }, function() {
                trsconfirm.alertType("发稿单修改成功", "", "success", false, function() {
                    $scope.data.selectedArray = [];
                });
            });
        };
        /**
         * [queryDropDown description]根据下拉条件查询列表
         * @param  {[string]} type [description]下拉条件
         * @param {[string]} [varname] [description]下拉值
         * @return {[type]}      [description]
         */
        $scope.queryDropDown = function(type, value) {
            $scope.params[type] = value;
            $scope.params.CurrPage = $scope.page.CURRPAGE = $scope.status.copyCurrPage = 1;
            if (type == 'timeType') {
                if (value.length < 10) {
                    $scope.params.OperTimeStart = null;
                    $scope.params.OperTimeEnd = null;
                } else {
                    $scope.params.OperTimeStart = $scope.data.fromdate;
                    $scope.params.OperTimeEnd = $scope.data.untildate;
                    $scope.params[type] = null;
                }
            }
            requestData();
        };
        /**
         * [showVersionTime description]查看流程版本操作日志
         * @param  {[obj]} item [description]稿件具体信息
         * @return {[type]}      [description]
         */
        $scope.showVersionTime = function(item) {
            editingCenterService.getVersionTime(item, false);
        };
        /**
         * [collect description]稿件收藏
         * @param  {[obj]} item [description]稿件具体信息
         * @return {[type]}      [description]
         */
        $scope.collect = function(item) {
            $scope.status.isESSearch = false;
            var temp = $filter('pick')($scope.data.selectedArray, $scope.examDraftType);
            if (temp.length < 1) {
                trsconfirm.confirmModel("稿件收藏", "确认收藏稿件", function() {
                    collectDraft(item);
                });
            } else {
                trsconfirm.alertType("只能收藏新闻稿或图集稿", '', "error", false);
            }
        };
        /**
         * [collectDraft description]收藏稿件函数
         * @param  {[obj]} item [description]稿件具体信息
         * @return {[type]}      [description]
         */
        function collectDraft(item) {
            var array = !!item ? item : $scope.data.selectedArray;
            var params = {
                serviceid: "mlf_appoper",
                methodname: "collectionMetaDatas",
                MetaDataIds: trsspliceString.spliceString(array, "METADATAID", ","),
                ChnlDocIds: trsspliceString.spliceString(array, "CHNLDOCID", ","),
                ChannelId: $stateParams.channelid,
            };
            $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function() {
                trsconfirm.alertType('收藏成功', "", "success", false);
                $scope.data.selectedArray = [];
            });
        }
        /**
         * [exportDraft description]稿件导出
         * @return {[type]} [description]
         */
        $scope.exportDraft = function() {
            $scope.status.isESSearch = false;
            var temp = $filter('pick')($scope.data.selectedArray, $scope.examDraftType);
            if (temp.length < 1) {
                var params = {
                    serviceid: 'mlf_exportword',
                    methodname: 'exportWordFile',
                    MetaDataIds: trsspliceString.spliceString($scope.data.selectedArray, 'METADATAID', ','),
                };
                $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "post").then(function(data) {
                    $window.open("/wcm/app/file/read_file.jsp?FileName=" + data.REPORTS[0].DETAIL);
                    $scope.data.selectedArray = [];
                }, function(data) {
                    if (data.REPORTS[0].ISSUCCESS == 'true') {
                        $window.open("/wcm/app/file/read_file.jsp?FileName=" + data.REPORTS[0].DETAIL);
                        $scope.data.selectedArray = [];
                    }
                });
            } else {
                trsconfirm.alertType("只能导出新闻稿或图集稿", '', "error", false);
            }
        };
        /**
         * [outSending description]邮件外发
         * @return {[type]} [description]
         */
        $scope.outSending = function() {
            $scope.status.isESSearch = false;
            var temp = $filter('pick')($scope.data.selectedArray, $scope.examDraftType);
            if (temp.length < 1) {
                editingCenterService.outSending("", function(result) {
                    outSendingDraft(result.selectItems);
                });
            } else {
                trsconfirm.alertType("只能外发新闻稿或图集稿", '', "error", false);
            }
        };
        /**
         * [outSendingDraft description]外发函数
         * @param  {[array]} items [description]外发服务的返回值
         * @return {[type]}       [description]
         */
        function outSendingDraft(items) {
            var userids = trsspliceString.spliceString(items, 'EMAIL', ",");
            var draftids = trsspliceString.spliceString($scope.data.selectedArray, 'METADATAID', ",");
            var params = {
                serviceid: "mlf_mailoutgoingOper",
                methodname: "appDaiBianSendEmail",
                Emails: userids,
                MetaDataIds: draftids
            };
            $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function(data) {
                trsconfirm.alertType("邮件外发成功", "", "success", false, function() {
                    requestData();
                });
            }, function() {
                $scope.data.selectedArray = [];
            });
        }
        $scope.print = function() {
            $scope.status.isESSearch = false;
            var temp = $filter('pick')($scope.data.selectedArray, $scope.examSubjectDraft);
            if (temp.length < 1) {
                angular.forEach($scope.data.selectedArray, function(value, key) {
                    requestPrintVersion(value).then(function(data) {
                        requestPrintData(value, data);
                    });
                });
            } else {
                trsconfirm.alertType("所选稿件中有专题稿，无法打印", '', "error", false);
            }
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
        }
        /**
         * [requestPrintVersion description：打印请求详情]
         */
        function requestPrintData(item, version) {
            var params = {
                "serviceid": "mlf_appmetadata",
                "methodname": $scope.status.detailMethodname[item.DOCTYPEID],
                "ChnlDocId": item.CHNLDOCID
            };
            $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "post").then(function(data) {
                var result = data;
                data.VERSION = version;
                data.HANGCOUNT = Math.ceil(data.DOCWORDSCOUNT / 27);
                $scope.data.printResult.push(result);
                if ($scope.data.printResult.length == $scope.data.selectedArray.length) {
                    trsPrintService.trsAppPrintDocument($scope.data.printResult);
                    $scope.data.printResult = [];
                }
            });
        }
        /**
         * [move description]稿件移动
         * @return {[type]} [description]
         */
        $scope.move = function() {
            $scope.status.isESSearch = false;
            editingCenterAppService.moveDraft('移动稿件', $stateParams.siteid, $stateParams.channelid, 5, function(result) {
                var params = {
                    serviceid: "mlf_appoper",
                    methodname: "moveDaiShenMetaDatas",
                    ChnlDocIds: trsspliceString.spliceString($scope.data.selectedArray, "CHNLDOCID", ","),
                    MetaDataIds: trsspliceString.spliceString($scope.data.selectedArray, "METADATAID", ","),
                    ToChannelId: result.channelid,
                    SrcChannelId: $stateParams.channelid
                };
                $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function(data) {
                    trsconfirm.alertType('稿件移动成功', "", "success", false);
                    requestData();
                });
            });
        };
        /**
         * [examDraftType description]检验稿件类型
         * @param  {[obj]} elm [description]稿件的具体信息
         * @return {[type]}     [description]
         */
        $scope.examDraftType = function(elm) {
            if (angular.isDefined(elm)) {
                return elm.DOCTYPEID == 3 || elm.DOCTYPEID == 4;
            }
        };
        /**
         * [examSubjectDraft description]专门用来检验专题稿
         * @param  {[obj]} elm [description]稿件信息
         * @return {[type]}     [description]
         */
        $scope.examSubjectDraft = function(elm) {
            if (angular.isDefined(elm)) {
                return elm.DOCTYPEID == 3;
            }
        };
        /**
         * [isLockEdit description:编辑前请求解锁]
         * @param  {[type]} item [description:稿件对象]
         */
        $scope.isLockEdit = function(item) {
            $scope.status.isESSearch = false;
            editIsLock.isLock(item).then(function(data) {
                var editPath = $scope.data.editPath[item.DOCTYPEID];
                var editParams = {
                    channelid: $stateParams.channelid,
                    chnldocid: item.CHNLDOCID,
                    metadataid: item.METADATAID,
                    siteid: $stateParams.siteid,
                    platform: 1,
                    doctype: item.DOCTYPEID - 1
                };
                var editUrl = $state.href(editPath, editParams);
                if (data.ISLOCK == "false") {
                    $window.open(editUrl);
                } else {
                    trsconfirm.alertType("稿件已经被【" + data.LOCKUSER + "】锁定,是否强制解锁", "", "warning", true, function() {
                        editIsLock.forceDeblocking(item).then(function(data) {
                            $window.open(editUrl);
                        });
                    }, function() {});
                }
            });
        };
        /**
         * [copyDraft description]稿件复制功能
         * @return {[type]} [description]
         */
        $scope.copyDraft = function() {
            $scope.status.isESSearch = false;
            copyDraft();
        };
        /**
         * [copyDraft description]稿件复制功能
         * @return {[type]} [description]
         */
        function copyDraft() {
            editingCenterService.batChooseChnl("复制稿件", $stateParams.siteid, function(data) {
                var params = {
                    "serviceid": "mlf_appoper",
                    "methodname": "copyDAISHENDoc",
                    "ChannelId": $state.params.channelid,
                    "MetaDataIds": trsspliceString.spliceString($scope.data.selectedArray, "METADATAID", ","),
                    "ChannelIds": data.ChannelIds
                };
                $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "post")
                    .then(function(data) {
                        trsconfirm.alertType("复制稿件成功", "", "success", false, function() {
                            requestData();
                        });
                    });
            });
        }
    }])
    /**
     * created by zss in 2016/12/22
     * 资源中心app待审官员列表
     */
    .controller('editingCenterPendingofficerCtrl', ['$scope', '$state', '$stateParams', 'trsHttpService', 'globleParamsSet', 'trsspliceString', 'trsconfirm', 'storageListenerService', 'initSingleSelecet', 'editingCenterService', 'editcenterRightsService',
        function($scope, $state, $stateParams, trsHttpService, globleParamsSet, trsspliceString, trsconfirm, storageListenerService, initSingleSelecet, editingCenterService, editcenterRightsService) {
            initStatus();
            initData();
            /**
             * [initStatus description] 初始化状态
             * @return {[type]} [description] null
             */
            function initStatus() {
                $scope.data = {
                    page: {
                        'CURRPAGE': 1,
                        'PAGESIZE': globleParamsSet.setResourceCenterPageSize,
                        'ITEMCOUNT': 0,
                        'PAGECOUNT': '',
                    },
                    copyCurrPage: 1,
                    selectedArray: [], //存放选中的官员
                };
                $scope.status = {
                    batchOperateBtn: {
                        "hoverStatus": "",
                        "clickStatus": ""
                    },
                    params: {
                        'serviceid': 'nb_appofficer',
                        'methodname': 'queryReviewOfficer',
                        'ChannelId': $state.params.channelid,
                        'CURRPAGE': $scope.data.page.CURRPAGE,
                        'PAGESIZE': $scope.data.page.PAGESIZE,
                    },
                    officerstatus: 'pending', //待审状态下的官员库
                };
            }
            /**
             * [initData description] 初始化数据
             * @return {[type]} [description] null
             */
            function initData() {
                requestData();
                listenStorage();
                initDropDown();
                editcenterRightsService.initAppListBtn('app.daishen', $stateParams.channelid).then(function(rights) {
                    $scope.status.btnRights = rights;
                });
            }
            /**
             * [requestData description] 数据请求
             * @return {[type]} [description] null
             */
            function requestData() {
                trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), $scope.status.params, "post").then(function(data) {
                    !!data.PAGER ? $scope.data.page = data.PAGER : $scope.data.page.PAGECOUNT = '0';
                    $scope.data.officers = data.DATA;
                    $scope.data.selectedArray = [];
                });
            }
            /**
             * [listenStorage description]监听本地缓存
             * @return {[promise]} [description] promise
             */
            function listenStorage() {
                storageListenerService.listenApp(function() {
                    requestData();
                    storageListenerService.removeListener("app");
                });
            }
            /**
             * [initDropDown description] 初始化下拉列表
             * @return {[type]} [description] null
             */
            function initDropDown() {
                //初始化搜索条件
                $scope.officerSearchJsons = initSingleSelecet.officerSearchCondition();
                $scope.officerSearchSelected = angular.copy($scope.officerSearchJsons[0]);
            }
            /**
             * [officerSearch description] 官员搜索
             * @param  {[type]} ev [description] 按下回车搜索
             * @return {[type]}    [description] null 
             */
            $scope.officerSearch = function(ev) {
                if (angular.isDefined(ev) && ev.keyCode == 13 || angular.isUndefined(ev)) {
                    $scope.data.page.CURRPAGE = 1;
                    if ($scope.officerSearchSelected.value == 'Name') {
                        $scope.status.params.SearchName = $scope.keywords;
                        $scope.status.params.SearchPost = null;
                    } else {
                        $scope.status.params.SearchPost = $scope.keywords;
                        $scope.status.params.SearchName = null;
                    }
                    requestData();
                }
            };
            /**
             * [clickedOfficer description] 点击选中官员
             * @param  {[obj]} officer [description] 官员
             * @return {[type]}     [description] null
             */
            $scope.clickedOfficer = function(officer) {
                if ($scope.data.selectedArray.indexOf(officer) < 0) {
                    $scope.data.selectedArray.push(officer);
                } else {
                    $scope.data.selectedArray.splice($scope.data.selectedArray.indexOf(officer), 1);
                }
            };
            /**
             * [directSigned description] 直接签发
             * @return {[type]} [description] null
             */
            $scope.directSigned = function() {
                trsconfirm.confirmModel('签发', '是否确定签发官员', function() {
                    var params = {
                        serviceid: "mlf_appoper",
                        methodname: "appDaiShenPublish",
                        ObjectIds: trsspliceString.spliceString($scope.data.selectedArray, "CHNLDOCID", ","),
                        ChnlDocIds: trsspliceString.spliceString($scope.data.selectedArray, "CHNLDOCID", ","),
                        MetaDataIds: trsspliceString.spliceString($scope.data.selectedArray, "METADATAID", ","),
                    };
                    $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, 'post').then(function(data) {
                        trsconfirm.alertType('签发成功', '', 'success', false, function() {
                            requestData();
                        });
                    });
                });
            };
            /**
             * [revoke description] 撤销
             * @return {[type]} [description] null
             */
            $scope.revoke = function() {
                trsconfirm.inputModel('撤销待审', '请输入撤销待审原因', function(content) {
                    var params = {
                        'serviceid': "mlf_appoper",
                        'methodname': "rejectionMetaDatas",
                        'ChnlDocIds': trsspliceString.spliceString($scope.data.selectedArray, 'CHNLDOCID', ","),
                        'MetaDataIds': trsspliceString.spliceString($scope.data.selectedArray, 'METADATAID', ","),
                        'ChannelId': $state.params.channelid,
                        'Opinion': content,
                    };
                    trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, 'post').then(function(data) {
                        trsconfirm.alertType('撤销待审成功', '', 'success', false, function() {
                            requestData();
                        });
                    });
                });
            };
            /**
             * [batchDelete description] 批量删除官员
             * @param  {[array]} array [description] 官员数组
             * @return {[type]}       [description] null
             */
            $scope.batchDelete = function(array) {
                var params = {
                    'serviceid': 'nb_appofficer',
                    'methodname': 'deleteOfficer',
                    'MetaDataIds': trsspliceString.spliceString(array, "METADATAID", ","),
                };
                trsconfirm.confirmModel('删除官员', '是否确定删除？', function() {
                    trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, 'post').then(function(data) {
                        requestData();
                        trsconfirm.saveModel("删除成功", "", "success");
                    });
                });
            };
            /**
             * [separateDelete description] 单独删除官员
             * @param  {[obj]} item [description] 官员
             * @return {[type]}      [description] null
             */
            $scope.separateDelete = function(item) {
                $scope.batchDelete([item]);
            };
            /**
             * [selectPageNum description] 选择单页显示条数
             * @return {[type]} [description] null
             */
            $scope.selectPageNum = function() {
                $scope.status.params.CURRPAGE = $scope.data.page.CURRPAGE;
                $scope.status.params.PAGESIZE = $scope.data.page.PAGESIZE;
                $scope.data.copyCurrPage = $scope.data.page.CURRPAGE;
                requestData();
            };
            /**
             * [pageChanged description] 选择第几页
             * @return {[type]} [description] null
             */
            $scope.pageChanged = function() {
                $scope.status.params.CURRPAGE = $scope.data.page.CURRPAGE;
                $scope.data.copyCurrPage = $scope.data.page.CURRPAGE;
                requestData();
            };
            /**
             * [jumpToPage description] 页面跳转
             * @return {[type]} [description] null
             */
            $scope.jumpToPage = function() {
                if ($scope.data.copyCurrPage > $scope.data.page.PAGECOUNT) {
                    $scope.data.copyCurrPage = $scope.data.page.PAGECOUNT;
                }
                $scope.status.params.CURRPAGE = $scope.data.copyCurrPage;
                $scope.data.page.CURRPAGE = $scope.data.copyCurrPage;
                requestData();
            };
        }
    ]);
