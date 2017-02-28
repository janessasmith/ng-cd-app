/*
    Create by BaiZhiming 2015-12-28
*/
'use strict';
angular.module("trsSelectDocumentModule", ["trsSelectDocumentForSTModule", "copyIdsModule"])
    .factory("trsSelectDocumentService", ["$modal", function($modal) {
        return {
            trsSelectDocument: function(params, success, officer) {
                var modalInstance = $modal.open({
                    templateUrl: "./components/service/selectDocument/selectDocument_tpl.html",
                    windowClass: 'mutildocsDlg',
                    backdrop: false,
                    controller: "trsSelectDocumentCtrl",
                    resolve: {
                        params: function() {
                            return params;
                        },
                        officer: function() {
                            return officer;
                        }
                    }
                });
                modalInstance.result.then(function(result) {
                    success(result);
                });
            },
            trsSelectDocumentForST: function(params, success) {
                var modalInstance = $modal.open({
                    templateUrl: "./components/service/selectDocument/selectDocument_tpl.html",
                    windowClass: 'mutildocsDlg',
                    backdrop: false,
                    controller: "trsSelectDocumentForSTCtrl",
                    resolve: {
                        params: function() {
                            return params;
                        }
                    }
                });
            },
            copyIds: function(ids, success) {
                var modalInstance = $modal.open({
                    templateUrl: "./components/service/selectDocument/copyIds_tpl.html",
                    windowClass: 'toBeCompiled-review-window',
                    backdrop: false,
                    controller: "copyIdsCtrl",
                    resolve: {
                        copyParams: function() {
                            return {
                                ids: ids
                            };
                        }
                    }
                });
                modalInstance.result.then(function(result) {
                    success(result);
                });
            }
        };
    }])
    .controller("trsSelectDocumentCtrl", ["$scope", "$q", "$modalInstance", "$state", "params", "trsHttpService", "initSingleSelecet", "trsspliceString", "trsconfirm", "officer",
        function($scope, $q, $modalInstance, $state, params, trsHttpService, initSingleSelecet, trsspliceString, trsconfirm, officer) {
            initStatus();
            initData();
            $scope.showSelected = function(node) {
                $scope.status.isChooseSite = false;
                $scope.params.SearchDocId = "";
                $scope.params.SearchTitle = "";
                $scope.page = {
                    "CURRPAGE": 1,
                    "PAGESIZE": 10
                };
                $scope.params.PageSize = $scope.page.PAGESIZE;
                $scope.params.CurrPage = $scope.page.CURRPAGE; //重置分页
                $scope.params.ChannelId = node.CHANNELID;
                if (officer) {
                    officer.CHANNELID = node.CHANNELID;
                }
                siteOrChannel();
                var params = officer ? officer : $scope.params;
                trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get")
                    .then(function(data) {
                        $scope.items = data.DATA;
                        !!data.PAGER ? $scope.page = data.PAGER : $scope.page.ITEMCOUNT = "0";
                    });
            };
            $scope.showToggle = function(node) {
                if (angular.isDefined(node.CHILDREN) && node.CHILDREN.length === 0 && node.HASCHILDREN === "true") {
                    var childrenTreeParam = {
                        serviceid: "mlf_mediasite",
                        methodname: "queryClassifyByChnl",
                        ChannelId: node.CHANNELID
                    };
                    trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), childrenTreeParam, "get")
                        .then(function(data) {
                            node.CHILDREN = data.CHILDREN;
                        });
                }
            };
            $scope.pageChanged = function() {
                $scope.params.CurrPage = $scope.page.CURRPAGE;
                if (officer) officer.CurrPage = $scope.page.CURRPAGE; //处理官员库的下一页不触发情况
                requestDataPromise(true);
            };
            //全选
            $scope.selectAll = function() {
                if (checkSelectedAll()) {
                    $scope.selectedArray = [];
                } else {
                    $scope.selectedArray = $scope.items.concat($scope.selectedArray);
                }
                if ($scope.selectedArray.length > 10) $scope.selectedArray.length = 10;
            };
            //复选选
            $scope.selectDoc = function(item) {
                if (!duplChecking([item], $scope.selectedArray)) {
                    //只允许选择一个官员
                    /*if (officer && $scope.selectedArray.length >= 1) {
                        trsconfirm.alertType('绑定失败', '每篇文章只可绑定一个相关官员', "warning", false);
                        return;
                    }*/
                    $scope.selectedArray.splice(0, 0, angular.copy(item));
                } else {
                    deleteElement([item], $scope.selectedArray);
                }
                if ($scope.selectedArray.length > 10) {
                    $scope.selectedArray.length = 10;
                }
            };
            /**
             * { selectRadioDoc_description }单选
             * @param      {<type>}  item    The item
             */
            $scope.selectRadioDoc = function(item) {
                $scope.selectedArray = [];
                $scope.selectedArray = [item];
            };
            //检测选中情况
            $scope.checkChecked = function(item) {
                var flag = false;
                angular.forEach($scope.selectedArray, function(data, index, array) {
                    if (item.METADATAID === data.METADATAID || item.RECID === data.RECID) {
                        flag = true;
                    }
                });
                return flag;
            };
            $scope.checkSelectedAll = function() {
                return checkSelectedAll();
            };

            function checkSelectedAll() {
                var flag = true;
                if ($scope.selectedArray.length == 0 || !angular.isDefined($scope.items)) return false;
                var itemMetadaids = trsspliceString.spliceString($scope.items, "METADATAID", ",").split(",");
                var selectedMetadaids = trsspliceString.spliceString($scope.selectedArray, "METADATAID", ",").split(",");
                for (var i = 0; i < itemMetadaids.length; i++) {
                    if (selectedMetadaids.indexOf(itemMetadaids[i]) < 0) {
                        flag = false;
                        break;
                    }
                }
                return flag;
            }
            $scope.delSelected = function(item) {
                deleteElement([item], $scope.selectedArray);
            };

            $scope.sureChked = function() {
                var docData = [];
                angular.forEach($scope.selectedArray, function(data, index, array) {
                    docData.push({
                        title: data.TITLE,
                        subtitle: data.HOMETITLE,
                        url: data.DOCPUBURL,
                        titlecolor: data.TITLECOLOR,
                        abstract: data.ABSTRACT,
                        isRelNews: true,
                        recid: data.RECID,
                        reltime: data.RELTIME,
                        metadataId: data.METADATAID,
                        source: data.source,
                        author: data.author,
                        name: data.NAME, //官员库名称
                    });
                    //if (angular.isDefined(params.IsPicDoc)) {
                    if (angular.isDefined(data.OUTLINEPICS) && data.OUTLINEPICS !== "" && angular.isDefined(data.OUTLINEPICS.PICSLOGO)) {
                        docData[index].imgsrc = data.OUTLINEPICS.PICSLOGO.split(",")[data.OUTLINEPICS.PICSLOGO.split(",").length - 1];
                        docData[index].imgName = docData[index].imgsrc.split("=")[docData[index].imgsrc.split("=").length - 1];
                    } else if (angular.isDefined(data.METALOGOURL) && data.METALOGOURL !== "" && angular.isDefined(data.METALOGOURL.PICSLOGO)) {
                        docData[index].imgsrc = data.METALOGOURL.PICSLOGO.split(",")[data.METALOGOURL.PICSLOGO.split(",").length - 1];
                        docData[index].imgName = docData[index].imgsrc.split("=")[docData[index].imgsrc.split("=").length - 1];
                    } else {
                        docData[index].imgsrc = "";
                        docData[index].imgName = "";
                    }
                    //}
                });
                $modalInstance.close(docData);
            };
            $scope.cancel = function() {
                $modalInstance.dismiss();
            };

            function initData() {
                $scope.items = [];
                $scope.treeOptions = {
                    nodeChildren: "CHILDREN",
                    dirSelectable: true,
                    allowDeselect: false,
                    injectClasses: {
                        ul: "a1",
                        li: "a2",
                        liSelected: "a7",
                        iExpanded: "a3",
                        iCollapsed: "a4",
                        iLeaf: "a5",
                        label: "a6",
                        labelSelected: ""
                    },
                    isLeaf: function(node) {
                        return node.HASCHILDREN === "false" || !node.CHILDREN; //解决官员问题
                    }
                };
                officer ? initOfficerChannel() : initChannelTree();
                //初始化下拉框
                initDropList();

            }
            /**
             * [initOfficer description]初始化官员栏目
             * @return {[type]} [description]
             */
            function initOfficerChannel() {
                var params = {
                    serviceid: "nb_appofficer",
                    methodname: "queryAppOfficerChannels",
                    siteid: $state.params.siteid,
                };
                trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function(data) {
                    if (data.length < 1) return; //没有官员栏目时候返回
                    $scope.treeData = data;
                    $scope.siteDesc = data[0].SITEDESC;
                    officer.ChannelId = data[0].CHANNELID;
                    $scope.selectedNode = $scope.treeData[0];
                    requestDataPromise(true);
                });
            }
            /**
             * [initChannelTree description]初始化栏目树
             * @return {[type]} [description]
             */
            function initChannelTree() {
                var treeParam = {
                    serviceid: "mlf_mediasite",
                    methodname: "queryClassifyBySite",
                    SiteId: params.siteid
                };
                trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), treeParam, "get")
                    .then(function(data) {
                        $scope.siteDesc = data.SITEDESC;
                        $scope.treeData = data.CHILDREN;
                        var index = 0;
                        for (var i = 0; i < $scope.treeData.length; i++) {
                            if ($scope.treeData[i].CHANNELID === params.channelid) {
                                index = i;
                                break;
                            }
                        }
                        $scope.selectedNode = $scope.treeData[index];
                        $scope.params.ChannelId = $scope.treeData[index].CHANNELID;
                        requestDataPromise(true);
                    });
            }

            function initStatus() {
                $scope.page = {
                    "CURRPAGE": 1,
                    "PAGESIZE": 10
                };
                $scope.params = {
                    "serviceid": "mlf_metadata",
                    "methodname": "queryMetaByChannel",
                    "IsPicDoc": false,
                    "PageSize": $scope.page.PAGESIZE,
                    "CurrPage": $scope.page.CURRPAGE,
                    "ChannelId": "",
                    "IsCurrentChnl": false,
                    "SearchDocId": "",
                    "SearchRecId": "",
                    "SearchTitle": ""
                };
                $scope.status = {
                    fromFragment: params.position ? false : true,
                    isChooseSite: false,
                    searchAll: [{
                        name: "标题",
                        value: "0",
                        placeholder: "请输入标题"
                    }, {
                        name: "ID",
                        value: "1",
                        placeholder: "请输入稿件ID"
                    }],
                    searchOfficer: [{
                        name: "姓名",
                        value: "0",
                        placeholder: "请输入标题"
                    }, {
                        name: "ID",
                        value: "1",
                        placeholder: "请输入稿件ID"
                    }],
                    searchPosition: {
                        0: "SiteId",
                        1: "ChannelId"
                    },
                    SearchValue: "",
                    isOfficer: officer ? true : false,
                };
                $scope.data = {
                    dropDown: {
                        'searchAllType': !officer ? $scope.status.searchAll : $scope.status.searchOfficer,
                        'searchAllSelected': !officer ? $scope.status.searchAll[0] : $scope.status.searchOfficer[0],
                    },
                    titleName: officer ? "姓名" : "标题",
                };
                $scope.selectedArray = params.relNewsData;
                //$scope.hasMeta = false;
                /*
                  判断使用metaDataId还是recId  
                 */
                $scope.status.showMetadaId = (angular.isDefined(params.showMetadaId) && params.showMetadaId === true) ? true : false;
                /*if (params.showMetadaId == 0) {
                    $scope.hasMeta = angular.isDefined(params.relNewsData[0].METADATAID) ? true : false;
                }*/
            }

            function requestDataPromise() {
                var deferred = $q.defer();
                siteOrChannel();
                var params = officer ? officer : $scope.params; //区分相关新闻和相关官员
                trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, 'get').then(function(data) {
                    $scope.items = data.DATA;
                    !!data.PAGER ? $scope.page = data.PAGER : $scope.page.ITEMCOUNT = 0;
                    deferred.resolve();
                });
                return deferred.promise;
            }
            /**
             * [initDropList description] 初始化下拉框
             */
            function initDropList() {
                //ES条件
                $scope.data.dropDown.esAll = initSingleSelecet.iWoEntire();
                $scope.data.dropDown.esSelected = angular.copy($scope.data.dropDown.esAll[0]);
            }
            //查重复
            function duplChecking(items, array) {
                var flag = false;
                angular.forEach(array, function(data, index, array) {
                    var attribute = angular.isDefined(data.RECID) ? 'RECID' : 'METADATAID';
                    angular.forEach(items, function(_data, _index, _array) {
                        if (_data[attribute] === data[attribute]) {
                            flag = true;
                        }
                    });
                });
                return flag;
            }
            //去重复
            function unique(arr1, arr2) {
                var allArr = arr1.concat(arr2),
                    result = [],
                    flag = {};
                angular.forEach(allArr, function(data, key) {
                    var id = angular.isDefined(data.METADATAID) ? data.METADATAID : data.RECID;
                    if (!flag[id]) {
                        result.push(data);
                        flag[id] = true;
                    }
                });
                return result;
            }

            function deleteElement(items, array) {
                angular.forEach(items, function(_data, _index, _array) {
                    var attribute = angular.isDefined(array[0].RECID) ? 'RECID' : 'METADATAID';
                    var j = 0;
                    while (j < array.length) {
                        if (array[j][attribute] === _data[attribute]) {
                            array.splice(j, 1);
                        } else {
                            j++;
                        }
                    }
                });
            }
            /**
             * [chooseSite description;选择整个站点（仅用于检索）]
             */
            $scope.chooseSite = function() {
                $scope.status.isChooseSite = true;
                $scope.params.SearchDocId = "";
                $scope.params.SearchRecId = "";
                $scope.params.SearchTitle = "";
                requestDataPromise(true);
            };
            /**
             * [fullTextSearch description;全文检索]
             * @param  {[type]} ev [description:按下空格也能提交]
             */
            $scope.fullTextSearch = function(ev) {
                if ((angular.isDefined(ev) && ev.keyCode == 13) || angular.isUndefined(ev)) {
                    if (!checkSearchValue()) return;
                    $scope.page.CURRPAGE = 1;
                    requestDataPromise(true);
                }
            };
            // $scope.status.isChooseSite ? params.siteid : $scope.params.channelId
            // 区分是站点还是栏目的搜索
            function siteOrChannel() {
                if (!$scope.status.isChooseSite) {
                    // $scope.params.ChannelId = node.CHANNELID;
                    if (angular.isDefined($scope.params.SiteId)) delete $scope.params.SiteId;
                } else {
                    $scope.params.SiteId = params.siteid;
                    if (angular.isDefined($scope.params.ChannelId)) delete $scope.params.ChannelId;
                }
            }
            //检查输入的关键字是否正确
            function checkSearchValue() {
                var flag = true;
                if ($scope.data.dropDown.searchAllSelected.value == 1) {
                    if ($scope.status.showMetadaId) {
                        officer.SearchDocId = $scope.params.SearchDocId = angular.copy($scope.status.SearchValue);
                    } else {
                        $scope.params.SearchRecId = angular.copy($scope.status.SearchValue);
                    }
                    if (angular.isDefined($scope.params.SearchTitle)) delete $scope.params.SearchTitle;
                    if (!Number($scope.params.SearchDocId) && !Number($scope.params.SearchRecId)) {
                        trsconfirm.alertType("请输入ID数字", "", "warning", false);
                        flag = false;
                    }
                } else {
                    officer.SearchName = $scope.params.SearchTitle = angular.copy($scope.status.SearchValue);
                    if (angular.isDefined($scope.params.SearchDocId)) delete $scope.params.SearchDocId;
                    if (angular.isDefined($scope.params.SearchRecId)) delete $scope.params.SearchRecId;
                }
                return flag;
            }
        }
    ]);
