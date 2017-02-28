/**
 * modify by cc 2017/01/24
 */
"use strict";
angular.module('weixinPendingModule', ['weixinPendingRouter']).controller('WeiXinPendingCtrl', ['$scope', '$filter', '$q', '$modal', '$stateParams', '$state', '$window', 'editIsLock', 'localStorageService', 'trsHttpService', 'SweetAlert', 'initSingleSelecet', 'editingCenterService', 'trsconfirm', 'trsspliceString', 'initVersionService', 'editcenterRightsService', 'signedService', 'storageListenerService', 'globleParamsSet', 'trsPrintService', 'WeiXininitService',
    function($scope, $filter, $q, $modal, $stateParams, $state, $window, editIsLock, localStorageService, trsHttpService, SweetAlert, initSingleSelecet, editingCenterService, trsconfirm, trsspliceString, initVersionService, editcenterRightsService, signedService, storageListenerService, globleParamsSet, trsPrintService, WeiXininitService) {
        initStatus();
        initData();
        /**
         * [initStatus description]初始化状态
         * @return {[type]} [description]
         */
        function initStatus() {
            $scope.page = {
                "pageIndex": 1,
                // "pagesize": globleParamsSet.getpagesize(),
                "pagesize": globleParamsSet.setResourceCenterPageSize,
                "totalNum": 0,
                "pageCount": 0
            };
            $scope.status = {
                onlyMine: false,
                isESSearch: false,
                btnRight: {},
                currChannel: {},
                batchOperateBtn: {
                    "hoverStatus": "",
                    "clickStatus": ""
                },
                params: {
                    "serviceid": "wcm61_wxmessage",
                    "methodname": "query",
                    "pageIndex": $scope.page.pageIndex,
                    "pagesize": $scope.page.pagesize,
                    "Status": 2, //待审状态
                },
                // 要跳转的页面
                copyCurrPage: 1,
                wxStatus: 'pending', //微信状态：待审
            };
            $scope.data = {
                items: [],
                selectedArray: [],
                printResult: []
            };
        }
        /**
         * [initData description]初始化数据
         * @return {[type]} [description]
         */
        function initData() {
            initCurrSite();
            requestData();
            dropList();
            initBtnRights();
            listenStorage();
        }

        /**
         * [initCurrSite description] 获取栏目名称
         * @return {[type]} [description]
         */
        function initCurrSite() {
            WeiXininitService.queryCurrChannel($stateParams.channelid).then(function(data) {
                $scope.status.currChannel = data.replace(/^\"|\"$/g, '').split("《").pop(); //去除引号转为数组取最后一个元素
            });
        }
        /**
         * [requestData description] 初始化请求数据
         * @return {[type]} [description]
         */
        function requestData() {
            WeiXininitService.queryAccountInfo($state.params.channelid).then(function(data) {
                $scope.status.params.WxId = data.wxid;
                var params = $scope.status.isESSearch ? getESSearchParams() : $scope.status.params;
                $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, 'get').then(function(data) {
                    $scope.data.items = data.result;
                    !!data.pageInfo ? $scope.page = data.pageInfo : $scope.page.totalNum = "0";
                    $scope.data.selectedArray = [];
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
                methodname: "queryForWeChatToBeReviewDoc",
                searchParams: {
                    pagesize: $scope.page.pagesize + "",
                    PAGEINDEX: $scope.page.pageIndex + "",
                    searchFields: [{
                        searchField: $scope.data.iWoAllSelected.value,
                        keywords: $scope.keywords ? $scope.keywords : ""
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
         * [initBtnRights description] 初始化权限
         * @return {[type]} [description]
         */
        function initBtnRights() {
            editcenterRightsService.initWeixinListBtn('wechat.daishen', $stateParams.channelid).then(function(rights) {
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
         * [listenStorage description] 监听本地缓存
         * @return {[type]} [description]
         */
        function listenStorage() {
            storageListenerService.listenWeixin(function() {
                $scope.status.isESSearch = false;
                requestData();
                storageListenerService.removeListener("weixin");
            });
        }
        /**
         * [dropList description] 初始化下拉框数据
         * @return {[type]} [description]
         */
        function dropList() {
            //全部时间 下拉框
            $scope.data.timeTypeArray = initSingleSelecet.chooseTimeType();
            $scope.data.selectedTimeType = angular.copy($scope.data.timeTypeArray[0]);
            //全部 下拉框
            $scope.data.iWoAll = initSingleSelecet.weixinEntire();
            $scope.data.iWoAllSelected = angular.copy($scope.data.iWoAll[0]);
            //初始化排序方式
            $scope.data.sortTypeJsons = initSingleSelecet.sortType();
            $scope.data.sortType = angular.copy($scope.data.sortTypeJsons[1]);
        }


        /**
         * [sign description] 签发
         * @param  {[type]} item [description]
         * @return {[type]}      [description]
         */
        $scope.sign = function() {
            $scope.status.isESSearch = false;
            var chnldocIDs = trsspliceString.spliceString($scope.data.selectedArray, "CHNLDOCID", ',');
            trsconfirm.confirmModel('签发', '确认签发', function() {
                sign(chnldocIDs);
            });
        };
        /**
         * [sign description] 签发
         * @param  {[type]} chnldocIDs [description]
         * @return {[type]}            [description]
         */
        function sign(chnldocIDs) {
            var params = {
                serviceid: "mlf_wechatoper",
                methodname: "webDaiShenPublish",
                ObjectIds: chnldocIDs,
                ChnlDocIds: chnldocIDs
            };
            $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "post").then(function(data) {
                trsconfirm.alertType("签发成功", "", "success", false, function() {
                    requestData();
                });
            });
        }
        /**
         * [rejectionDraft description] 撤稿
         */
        $scope.rejectionDraft = function() {
            $scope.status.isESSearch = false;
            trsconfirm.inputModel("是否确认撤稿", "撤稿原因(可选)", function(content) {
                rejection(content);
            });
        };
        /**
         * [rejection description] 退稿方法
         */
        function rejection(Opinion) {
            var params = {
                'serviceid': "mlf_wechatoper",
                'methodname': "rejectionMetaDatas",
                'ChannelId': $stateParams.channelid,
                'Opinion': Opinion,
                'ChnlDocIds': trsspliceString.spliceString($scope.data.selectedArray, "CHNLDOCID", ","),
                'metaDataIds': trsspliceString.spliceString($scope.data.selectedArray, "METADATAID", ","),
            };
            promptRequest(params, '撤稿成功');
        }
        /**
         * [promptRequest description]具体操作数据请求成功后刷新列表
         * @param  {[obj]} params [description]请求参数
         * @param  {[string]} info   [description]提示语
         * @return {[type]}        [description]
         */
        function promptRequest(params, info) {
            $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function(data) {
                trsconfirm.alertType(info, "", "success", false, function() {
                    requestData();
                });
            });
        }
        /**
         * [draftlist description] 发稿单
         * @return {[type]} [description]
         */
        $scope.draftlist = function() {
            $scope.status.isESSearch = false;
            editingCenterService.draftList($scope.data.selectedArray, {
                "serviceid": "mlf_appfgd",
                "methodname": "weChatDaiShenbatchUpdateFgdUsers"
            }, function() {
                requestData();
            });
        };
        /**
         * [outSending description] 邮件外发
         * @param  {[type]} item [description]
         * @return {[type]}      [description]
         */
        $scope.outSending = function() {
            $scope.status.isESSearch = false;
            editingCenterService.outSending("", function(result) {
                outSendingDraft(result.selectItems);
            });
        };
        /**
         * [outsendingDrafe description] 邮件外发 参数配置
         * @param  {[type]} items [description]
         * @param  {[type]} item  [description]
         * @return {[type]}       [description]
         */
        function outSendingDraft(items) {
            var userids = trsspliceString.spliceString(items, 'EMAIL', ",");
            var draftids = trsspliceString.spliceString($scope.data.selectedArray, 'METADATAID', ",");
            var params = {
                serviceid: "mlf_mailoutgoingOper",
                methodname: "wechatYiQianFaSendEmail",
                Emails: userids,
                MetaDataIds: draftids
            };
            $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function(data) {
                trsconfirm.alertType("邮件外发成功", "", "success", false, function() {
                    requestData();
                });
            });
        }
        /**
         * [collect description] 稿件收藏
         * @param  {[type]} item [description]
         * @return {[type]}      [description]
         */
        $scope.collectDraft = function() {
            $scope.status.isESSearch = false;
            trsconfirm.confirmModel("稿件收藏", "确认收藏稿件", function() {
                var chnlDocIds;
                chnlDocIds = trsspliceString.spliceString($scope.data.selectedArray, 'CHNLDOCID', ',');
                collectDraft(chnlDocIds);
            });
        };
        /**
         * [collectDraft description] 稿件收藏 参数配置
         * @param  {[type]} array [description]
         * @return {[type]}       [description]
         */
        function collectDraft(array) {
            var params = {
                serviceid: "mlf_wechatoper",
                methodname: "collectionDAISHENDocs",
                ChannelId: $scope.data.selectedArray[0].CHANNELID,
                ChnlDocIds: array
            };
            $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "post")
                .then(function() {
                    trsconfirm.alertType("收藏成功", "", "success", false, function() {
                        requestData();
                    });
                });
        }
        /**
         * [printBtn description] 稿件打印
         * @return {[type]} [description]
         */
        $scope.printBtn = function() {
            $scope.status.isESSearch = false;
            angular.forEach($scope.data.selectedArray, function(value, key) {
                requestPrintVersion(value).then(function(data) {
                    requestPrintData(value, data);
                });
            });
        };
        /**
         * [requestPrintVersion description] 稿件打印 请求流程
         * @param  {[type]} item [description]
         * @return {[type]}      [description]
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
         * [requestPrintData description]稿件打印 请求详情
         * @param  {[type]} item    [description]
         * @param  {[type]} version [description]
         * @return {[type]}         [description]
         */
        function requestPrintData(item, version) {
            var params = {
                serviceid: "mlf_wechat",
                methodname: "getNewsDoc",
                MetaDataId: item.METADATAID
            };
            $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "post").then(function(data) {
                var result = data;
                data.VERSION = version;
                data.HANGCOUNT = Math.ceil(data.DOCWORDSCOUNT / 27);
                $scope.data.printResult.push(result);
                if ($scope.data.printResult.length == $scope.data.selectedArray.length) {
                    trsPrintService.trsWeixinPrintDocument($scope.data.printResult);
                    $scope.data.printResult = [];
                }
            });
        }
        /**
         * [exportDraft description] 导出搞件
         * @return {[type]} [description]
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
                requestData();
            }, function(data) {
                if (data.REPORTS[0].ISSUCCESS == 'true') {
                    $window.open("/wcm/app/file/read_file.jsp?FileName=" + data.REPORTS[0].DETAIL);
                }
            });
        };

        /**
         * [isOnlyMine description]切换 只看我的 调取数据
         * @return {Boolean} [description]
         */
        $scope.isOnlyMine = function() {
            //刷新数据后，跳转第一页
            $scope.status.copyCurrPage = $scope.status.params.pageIndex = $scope.page.pageIndex = "1";
            $scope.status.onlyMine = !$scope.status.onlyMine;
            $scope.status.params.IsOnlyMine = $scope.status.onlyMine;
            requestData();
        };

        /** [selectPageNum description] 每页显示的数据数量
         */
        $scope.selectPageNum = function() {
            $scope.status.copyCurrPage = 1;
            $scope.status.params.pagesize = $scope.page.pagesize;
            $scope.status.params.pageIndex = $scope.page.pageIndex;
            requestData();
        };
        /**
         * [showVersionTime description] 最后版本时间 显示操作日志与流程控制
         * @param  {[type]} item [description]
         * @return {[type]}      [description]
         */
        $scope.showVersionTime = function(item) {
            editingCenterService.getVersionTime(item, false);
        };
        /**
         * [pageChanged description] 下一页 页面改变调取数据
         * @return {[type]} [description]
         */
        $scope.pageChanged = function() {
            $scope.status.params.pageIndex = $scope.page.pageIndex;
            $scope.status.copyCurrPage = $scope.page.pageIndex;
            requestData();
        };
        /**
         * [jumpToPage description] 跳转页
         * @return {[type]} [description]
         */
        $scope.jumpToPage = function() {
            if ($scope.status.copyCurrPage > $scope.page.pageCount) {
                $scope.status.copyCurrPage = $scope.page.pageCount;
            }
            $scope.status.params.pageIndex = $scope.status.copyCurrPage;
            $scope.page.pageIndex = $scope.status.params.pageIndex;
            requestData();
        };
        /**
         * [selectAll description]列表全选按钮
         * @return {[type]} [description]
         */
        $scope.selectAll = function() {
            $scope.data.selectedArray = $scope.data.selectedArray.length == $scope.data.items.length ? [] : []
                .concat($scope.data.items);
        };
        /**
         * [selectDoc description]列表单选按钮
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
        /**
         * [queryByDropdown description] 根据下拉框类型查询
         * @param  {[type]} key   [description]
         * @param  {[type]} value [description]
         * @return {[type]}       [description]
         */
        $scope.queryByDropdown = function(key, value) {
            $scope.status.params[key] = value;
            $scope.status.copyCurrPage = $scope.status.params.pageIndex = $scope.page.pageIndex = "1";
            if (key == 'timeType') {
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
         * [fullTextSearch description;全文检索]
         * @param  {[type]} ev [description:按下回车也能提交]
         */
        $scope.fullTextSearch = function(ev) {
            if ((angular.isDefined(ev) && ev.keyCode == 13) || angular.isUndefined(ev)) {
                if ($scope.data.iWoAllSelected.value == "DocID") {
                    $scope.status.isESSearch = false;
                    $scope.status.params.DocId = $scope.keywords;
                } else {
                    $scope.status.isESSearch = true;
                }
                $scope.page.pageIndex = 1;
                requestData();
            }
        };
    }
]);
