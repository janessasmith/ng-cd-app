'use strict';
angular.module("resourceCenterLeftModule", []).
controller("resourceCenterLeftCtrl",["$scope","$state","$timeout","resourceCenterService","trsHttpService","leftService","trsconfirm","localStorageService",
    function($scope, $state, $timeout, resourceCenterService, trsHttpService, leftService, trsconfirm,localStorageService) {
    var applyType = leftService.getCurChannel(),
        channelName = leftService.resNavValue[applyType];
    var typeName = leftService.getParamValue('typename');
    var modalid = leftService.getParamValue('modalid');
    var nodeid = leftService.getParamValue("nodeid");
    var nodename = leftService.getParamValue("nodename");
    var contentType;
    var currHref = window.location.href;
    initStatus();
    /** [initStatus 初始化状态] */
    function initStatus() {
        $scope.curdictNum = nodeid;
        $scope.setUsual = false;
        $scope.leftList = [];
        $scope.isdataLoaded = false;
        $scope.isShowPreview = currHref.indexOf('digital/preview') < 0 ? false : true;
        $scope.isArea = typeName == "area" ? true : false;
        $scope.isSzb = typeName == 'szb' ? true : false;
        contentType = {
            "73": 1,
            "37": 2,
            "38": 3,
            "39": 4
        };
        $scope.shareNode = ""; //记录共享稿库被选中的父节点
        setCurLeftTemplate();
        loadData();
        resourceCenterService.urlMemory($scope);
    }
    /** [loadData 加载数据] */
    function loadData() {
        if (channelName == "gxgk") {
            queryMyCustoms(function(data) {
                $scope.customList = data && data.DATA;
                $scope.extraShow = modalid == 37 ? true : false;
                loadWCMData();
            });
        } else {
            $scope.extraShow = false;
            loadBigData();
        }
    }
    /** 加载父级列表 */
    function loadWCMData() {
        $scope.isdataLoaded = false;
        if (typeName) {
            loadBigData();
        } else {
            if (modalid && modalid != '37') {
                var params = {
                    serviceid: "mlf_releaseSource",
                    methodname: "queryMetaCategorysByModalId",
                    Modalid: modalid
                };
                trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "post")
                    .then(function(data) {
                        $scope.leftList = data;
                        $scope.isdataLoaded = true;
                        if (data.length && angular.isArray(data)) {
                            if (localStorageService.get("Nav.gxgk") !== null) {
                                var shareNode = getShareNode(data);
                                $scope.leftList[shareNode].isOpen = true;
                                loadWCMSubData(data[shareNode], true);
                            } else {
                                $scope.leftList[0].isOpen = true;
                                loadWCMSubData(data[0], true);
                            }
                        }
                    });
            } else if (modalid && modalid == '37') {
                getShareSourceLeft();
            }
        }
        /**
         * [getShareSourceLeft description] 获取共享稿库目标来源左侧列表
         */
        function getShareSourceLeft() {
            var params = {
                serviceid: "mlf_sharedoc",
                methodname: "queryCategorysWithRight",
            };
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "post")
                .then(function(data) {
                    angular.forEach(data, function(value1, key) {
                        value1.CHILDREN = angular.isDefined(value1.CHILDLIST) ? angular.copy(value1.CHILDLIST) : [];
                        value1.METACATEGORYID = angular.copy(value1.ID);
                        angular.forEach(value1.CHILDREN, function(value2, key) {
                            value2.METACATEGORYID = angular.copy(value2.ID);
                        });
                    });
                    $scope.leftList = data;
                    $scope.isdataLoaded = true;
                    if (data.length && angular.isArray(data)) {
                        if (localStorageService.get("Nav.gxgk") !== null && localStorageService.get("Nav.gxgk") !== '' && existShareNode(localStorageService.get("Nav.gxgk"), $scope.leftList, false)) {
                            var shareNode = getShareNode(data);
                            $scope.leftList[shareNode].isOpen = true;
                            var item = data[shareNode];
                        } else {
                            var item;
                            for (var i = 0; i < $scope.leftList.length; i++) {
                                if ($scope.leftList[i].CHILDREN.length > 0) {
                                    $scope.leftList[i].isOpen = true;
                                    item = $scope.leftList[i];
                                    break;
                                }
                            }
                            // $scope.leftList[0].isOpen = true;
                            // var item=data[0];
                        }
                        var existNode = !!nodeid && !!nodename && existShareNode(nodeid, $scope.leftList, true);
                        var rd = Math.random(0, 1) * 100;
                        $scope.curdictNum = existNode ? nodeid : item.CHILDREN[0].METACATEGORYID;
                        localStorageService.set("Nav.gxgk", item.METACATEGORYID);
                        $state.go($state.current.name, {
                            typename: typeName,
                            modalid: modalid,
                            nodeid: existNode ? nodeid : item.CHILDREN[0].METACATEGORYID,
                            nodename: existNode ? nodename : item.CHILDREN[0].CATEGORYNAME
                        });
                    }
                });
        }
        /**
         * [getShareNode description] 记忆共享稿库当前选中的父节点
         * @param  {[type]} data [description]
         * @return {[type]}      [description]
         */
        function getShareNode(data) {
            for (var i = 0; i < data.length; i++) {
                if (data[i].METACATEGORYID == localStorageService.get("Nav.gxgk")) {
                    return i;
                }
            }
        }
        /**
         * [existShareNode description] 是否存在目前记忆的共享稿库节点
         */
        function existShareNode(id, list, eachChild) {
            var memoryId = id;
            for (var i = 0; i < list.length; i++) {
                if (list[i].METACATEGORYID == memoryId) return true;
                if (eachChild) {
                    for (var j = 0; j < list[i].CHILDREN.length; j++) {
                        if (list[i].CHILDREN[j].METACATEGORYID == memoryId) return true;
                    }
                }
            }
            return false;
        }
    }
    /**
     * [getShareSourceLeft description] 获取共享稿库目标来源左侧列表
     */
    function getShareSourceLeft() {
        var params = {
            serviceid: "mlf_sharedoc",
            methodname: "queryCategorysWithRight",
        };
        trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "post")
            .then(function(data) {
                angular.forEach(data, function(value1, key) {
                    value1.CHILDREN = angular.isDefined(value1.CHILDLIST) ? angular.copy(value1.CHILDLIST) : [];
                    value1.METACATEGORYID = angular.copy(value1.ID);
                    angular.forEach(value1.CHILDREN, function(value2, key) {
                        value2.METACATEGORYID = angular.copy(value2.ID);
                    });
                });
                $scope.leftList = data;
                $scope.isdataLoaded = true;
                if (data.length && angular.isArray(data)) {
                    if (localStorageService.get("Nav.gxgk") !== null && localStorageService.get("Nav.gxgk") !== '' && existShareNode(localStorageService.get("Nav.gxgk"), $scope.leftList, false)) {
                        var shareNode = getShareNode(data);
                        $scope.leftList[shareNode].isOpen = true;
                        var item = data[shareNode];
                    } else {
                        var item;
                        for (var i = 0; i < $scope.leftList.length; i++) {
                            if ($scope.leftList[i].CHILDREN.length > 0) {
                                $scope.leftList[i].isOpen = true;
                                item = $scope.leftList[i];
                                break;
                            }
                        }
                        // $scope.leftList[0].isOpen = true;
                        // var item=data[0];
                    }
                    var existNode = !!nodeid && !!nodename && existShareNode(nodeid, $scope.leftList, true);
                    var rd = Math.random(0, 1) * 100;
                    $scope.curdictNum = existNode ? nodeid : item.CHILDREN[0].METACATEGORYID;
                    localStorageService.set("Nav.gxgk", item.METACATEGORYID);
                    $state.go($state.current.name, {
                        typename: typeName,
                        modalid: modalid,
                        nodeid: existNode ? nodeid : item.CHILDREN[0].METACATEGORYID,
                        nodename: existNode ? nodename : item.CHILDREN[0].CATEGORYNAME
                    });
                }
            });
    }
    /**
     * [getShareNode description] 记忆共享稿库当前选中的父节点
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */
    function getShareNode(data) {
        for (var i = 0; i < data.length; i++) {
            if (data[i].METACATEGORYID == localStorageService.get("Nav.gxgk")) {
                return i;
            }
        }
    }
    /**
     * [existShareNode description] 是否存在目前记忆的共享稿库节点
     */
    function existShareNode(id, list, eachChild) {
        var memoryId = id;
        for (var i = 0; i < list.length; i++) {
            if (list[i].METACATEGORYID == memoryId) return true;
            if (eachChild) {
                for (var j = 0; j < list[i].CHILDREN.length; j++) {
                    if (list[i].CHILDREN[j].METACATEGORYID == memoryId) return true;
                }
            }
        };
        return false;
    }
    /** 加载子集数据wcm */
    function loadWCMSubData(item, temp) {
        $scope.shareNode = item.METACATEGORYID;
        if (item.CHILDREN) return false;
        var params = {
            serviceid: "mlf_releaseSource",
            methodname: "queryMetaCategorysOfResource",
            MetaCategoryId: item.METACATEGORYID
        };
        trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "post")
            .then(function(data) {
                if (data.length) {
                    item.CHILDREN = data;
                    if (temp) {
                        var rd = Math.random(0, 1) * 100;
                        $state.go($state.current.name, {
                            typename: typeName,
                            modalid: modalid,
                            nodeid: nodeid || data[0].METACATEGORYID,
                            nodename: nodename || data[0].CATEGORYNAME
                        });
                        $scope.curdictNum = nodeid || data[0].METACATEGORYID;
                        localStorage.setItem("Nav.gxgk", item.METACATEGORYID);
                    }
                }
            });
    }
    /** 加载一级数据big data */
    function loadBigData() {
        $scope.isdataLoaded = false;
        if (typeName == "area") {
            loadFormatArea();
        } else {
            resourceCenterService.getBase({
                channelName: channelName,
                typeName: typeName,
                containParent: false,
                level: typeName == 'szb' ? 1 : 2
            }).then(function(data) {
                if (data && angular.isArray(data) && data.length) {
                    var nodeId;
                    angular.forEach(data, function(n, i) {
                        n.CATEGORYNAME = n.dictName;
                        n.isOpen = false;
                        //"全部文字"改为"------【全部文字】------"  且加底色
                        //"全部图片"改为"------【全部图片】------"  且加底色
                        if (n.id == 'navigation_001014' || n.id == 'navigation_001015') {
                            n.CATEGORYNAME = '-------【' + n.CATEGORYNAME + '】-------';
                            n.all_font_color = 'all_font_color';
                        }
                    });
                    $scope.leftList = data;
                    $scope.isdataLoaded = true;
                    $scope.curdictNum = "";

                    if (data[0].hasChildren == "true") {
                        nodeId = angular.isDefined(data[0].CHILDREN) ? data[0].CHILDREN[0].id : data[0].id;
                        var nowNode = getNodePosition(data) || "0";
                        data[nowNode].isOpen = true;
                        if (typeName == "szb") {
                            loadSubBigData(data[nowNode], true);
                        }
                    } else {
                        //新华社稿默认选中【通稿新闻路线】
                        if (data[1] && data[1].id == 'navigation_001011') {
                            nodeId = nodeId || data[1].id;
                            nodename = nodename || data[1].dictName;
                        } else {
                            nodeId = data[0].id;
                        }
                    }

                    var rd = Math.random(0, 1) * 100;
                    var url = $state.current.name == "resourcectrl.digital.preview" ? "resourcectrl.digital.resource" : $state.current.name;
                    $state.go(url, {
                        typename: typeName,
                        modalid: modalid,
                        nodeid: nodeid || nodeId,
                        nodename: nodename || data[0].dictName
                    });
                    $timeout(function() {
                        if (typeName != "szb") {
                            $scope.curdictNum = nodeid || nodeId;
                        }
                    });
                }
            });
        }
        /**
         * [getNodePosition description] 记忆当前选中的父节点
         * @param  {[type]} data [description]
         * @return {[type]}      [description]
         */
        function getNodePosition(data) {
            for (var i = 0; i < data.length; i++) {
                if (angular.isDefined(data[i].CHILDREN) && angular.isDefined(nodeid)) {
                    for (var j = 0; j < data[i].CHILDREN.length; j++) {
                        if (data[i].CHILDREN[j].id == nodeid) {
                            return i;
                        } else if (data[i].id == nodeid) {
                            return i;
                        }
                    }
                } else if (!angular.isDefined(data[i].CHILDREN) && angular.isDefined(nodeid)) {
                    if (data[i].id == nodeid) {
                        return i;
                    } else if (nodeid.indexOf(data[i].id) >= 0) {
                        return i;
                    }
                } else {
                    return;
                }
            }
        }
    }

    /** 加载子集 big data */
    function loadSubBigData(item, getPosition) {
        if (item.hasChildren == "true" && !item.CHILDREN) {
            resourceCenterService.getBase({
                channelName: channelName,
                typeName: typeName,
                containParent: false,
                parentId: item.id
            }).then(function(data) {
                if (angular.isArray(data) && data.length) {
                    item.CHILDREN = data;
                    angular.forEach(data, function(n, i) {
                        n.CATEGORYNAME = n.dictName;
                    });
                    var curItem;
                    if (angular.isDefined(getPosition) && getPosition === true) {
                        var nowSub = getSubPosition(item.CHILDREN) || "0";
                        curItem = item.CHILDREN[nowSub];
                    } else {
                        curItem = item.CHILDREN[0];
                    }
                    var rd = Math.random(0, 1) * 100;
                    $scope.curdictNum = curItem.id;
                    var url = $state.current.name;
                    if ($scope.isShowPreview && url == 'resourcectrl.digital.resource') url = 'resourcectrl.digital.preview';
                    // if (url.split('.').length == 4 && (url.split('.')[3] == 'detail')) url = url.substring(0, url.lastIndexOf('.'));
                    $state.go(url, {
                        typename: typeName,
                        modalid: modalid,
                        nodeid: curItem.id,
                        nodename: curItem.dictName
                    });
                }
            });
        }
        /**
         * [getSubPosition description] 记忆当前选中的子集
         * @return {[type]} [description]
         */
        function getSubPosition(data) {
            for (var i = 0; i < data.length; i++) {
                if (angular.isDefined(nodeid) && data[i].id == nodeid) {
                    return i;
                } else {
                    return;
                }
            }
        }
    }
    /** 加载区域 */
    function loadFormatArea() {
        var zheAreaparams = {
            "typeName": "area",
            // "parentId": "area_001020"
            "parentId": "area_001009"
        };
        var areaparams = {
            "typeName": "area",
            "parentId": "area_001",
            "excludeId": 'area_001020'
        };
        var extraAreaparams = {
            "typeName": "area",
            "excludeId": 'area_001'
        };

        function loadZhe(obj) {
            // obj.containParent = false;
            obj.channelName = channelName;
            resourceCenterService.getBase(obj)
                .then(function(data) {
                    if (data && angular.isArray(data) && data.length) {
                        angular.forEach(data, function(n, i) {
                            n.CATEGORYNAME = n.dictName;
                        });
                        $scope.isdataLoaded = true;
                        $scope.leftList = data;
                        if (channelName == "gxgk") {
                            var ct = contentType[modalid];
                            angular.forEach($scope.customList, function(m, j) {
                                angular.forEach(data[0].CHILDREN, function(value, key) {
                                    if ((m.CUSTOMTYPE == ct) && (value.METACATEGORYID == m.CUSTOMID || value.id == m.CUSTOMID)) {
                                        value.custom = true;
                                    }
                                });
                            });
                        }
                        loadAreaParams(areaparams);
                    }
                });
        }

        function loadAreaParams(obj) {

            obj.channelName = channelName;
            resourceCenterService.getBase(obj)
                .then(function(data) {
                    if (data && angular.isArray(data) && data.length) {
                        data[0].CATEGORYNAME = "全国";
                        $scope.leftList.push(data[0]);
                        loadExtra(extraAreaparams);
                        if (channelName == "gxgk" && data[0].CHILDREN) {
                            var ct = contentType[modalid];
                            angular.forEach($scope.customList, function(m, j) {
                                angular.forEach(data[0].CHILDREN, function(value, key) {
                                    if ((m.CUSTOMTYPE == ct) && (value.METACATEGORYID == m.CUSTOMID || value.id == m.CUSTOMID)) {
                                        value.custom = true;
                                    }
                                });
                            });
                        }
                    }
                });
        }

        function loadExtra(obj) {

            obj.channelName = channelName;
            resourceCenterService.getBase(obj)
                .then(function(data) {
                    if (data && angular.isArray(data) && data.length) {
                        angular.forEach(data, function(n, i) {
                            n.CATEGORYNAME = n.dictName;
                        })
                        $scope.leftList.push({
                            CATEGORYNAME: "海外",
                            CHILDREN: data
                        });
                        if (channelName == "gxgk" && data[0].CHILDREN) {
                            var ct = contentType[modalid];
                            angular.forEach($scope.customList, function(m, j) {
                                angular.forEach(data[0].CHILDREN, function(value, key) {
                                    if ((m.CUSTOMTYPE == ct) && (value.METACATEGORYID == m.CUSTOMID || value.id == m.CUSTOMID)) {
                                        value.custom = true;
                                    }
                                });
                            });
                        }
                    }
                    if ($scope.leftList[0].CHILDREN && !nodeid) {
                        var curItem = $scope.leftList[0].CHILDREN[0];
                        var rd = Math.random(0, 1) * 100;
                        $scope.leftList[0].isOpen = true;
                        $scope.curdictNum = curItem.id;
                        $state.go($state.current.name, {
                            typename: typeName,
                            modalid: modalid,
                            nodeid: curItem.id,
                            nodename: curItem.dictName
                        });
                    } else {
                        var areaType = getAreaPosition($scope.leftList)[2];
                        var nowProvince = getAreaPosition($scope.leftList)[0];
                        var nowCity = getAreaPosition($scope.leftList)[1];
                        if (angular.isDefined(areaType) && areaType === true) {
                            $scope.leftList[nowProvince].isOpen = true;
                            $scope.curdictNum = $scope.leftList[nowProvince].CHILDREN[nowCity].id;
                        } else if (angular.isDefined(areaType) && areaType === false) {
                            $scope.leftList[nowProvince].isOpen = true;
                            $scope.leftList[nowProvince].CHILDREN[nowCity].arrowBtn = 'arrowBtnActive';
                        } else {
                            $scope.leftList[0].isOpen = true;
                            $scope.curdictNum = $scope.leftList[0].CHILDREN[0].id;
                        }
                    }
                });
        }
        /**
         * [getAreaPosition description] 记忆当前选中的区域
         * @return {[type]} [description]
         */
        function getAreaPosition(data) {
            for (var i = 0; i < data.length; i++) {
                for (var j = 0; j < data[i].CHILDREN.length; j++) {
                    if (nodeid == data[i].CHILDREN[j].id) {
                        return [i, j, true];
                    } else if (nodeid.indexOf(data[i].CHILDREN[j].id) >= 0) {
                        return [i, j, false];
                    }
                }

            }
        }
        return function() {
            loadZhe(zheAreaparams);
        }();
    }
    /** 选择当前左侧的模版 */
    function setCurLeftTemplate() {
        var tpl3Array = ['website', 'weixin', 'weibo'];
        $scope.curTpl = channelName == "iwo" ? "tpl1" : tpl3Array.indexOf(typeName) < 0 ? "tpl2" : "tpl3";
        $scope.isdigitaltpl = channelName == "szb" ? true : false;
        $scope.setUsual = (channelName == "gxgk"); //可以设置常用的栏目
    }
    /** [queryMyCustoms 查找已设置常用的] */
    function queryMyCustoms(callback) {
        var ct = contentType[modalid];
        resourceCenterService.queryMyCustoms(ct).then(function(data) {
            typeof callback == "function" && callback(data);
        });
    }
    /** [checkCustom 判断是否常用] */
    function checkCustom(item) {
        var ct = contentType[modalid];
        (channelName == "gxgk") && angular.forEach($scope.customList, function(m, j) {
            if ((m.CUSTOMTYPE == ct) && (item.METACATEGORYID == m.CUSTOMID || item.id == m.CUSTOMID)) {
                item.custom = true;
            }
        });
    };
    $scope.checkPreview = function() {
        var isShowPreview = leftService.getParamValue('isShowPreview');
        return isShowPreview == 1;
    }
    $scope.checkCustom = checkCustom;
    /** 点击选中左侧列表条目 */
    $scope.selectThisPanel = function(id) {
        $scope.curdictNum = id;
    };
    /** 点击item加载右侧列表数据 */
    $scope.getDraft = function(subitem, evt, reset, parentItem) {
        var nodeId, url;
        var rd = Math.random(0, 1) * 100;
        if (channelName == "gxgk" && !typeName) {
            nodeId = subitem.METACATEGORYID;
            localStorage.setItem("Nav.gxgk", $scope.shareNode);
            if (subitem.PARENTID == "55") {
                url = "resourcectrl.share.robotdraft";
            } else if (nodeId == 31) {
                url = "resourcectrl.share.email";
            } else {
                if ($state.current.name.indexOf("email") > -1) {
                    url = $state.current.name.replace(".email", "") + ".resource";
                } else {
                    //url = $state.current.name;
                    url = "resourcectrl.share.resource";
                }
            }
        } else {
            nodeId = subitem.id;
            url = $state.current.name;
        }
        if (url.split('.').length == 4 && (url.split('.')[3] == 'detail')) url = url.substring(0, url.lastIndexOf('.'));
        $state.go(url, {
            typename: typeName,
            modalid: modalid,
            nodeid: nodeId,
            nodename: subitem.dictName || subitem.CATEGORYNAME,
            change: rd
        });
        $scope.curdictNum = nodeId;
        $scope.curSubitem = "";
        resetAll(subitem);
        if (parentItem) {
            parentItem.arrowBtn = 'arrowBtnActive';
        }
        $scope.leftList.chnlid = subitem.id;
        evt.stopPropagation();
    };
    /** [changeIsShowPreview 切换列表tab] */
    $scope.changeIsShowPreview = function(isshowPreview) {
        // $state.go($state.current.name, {
        //     typename: typeName,
        //     nodeid: $scope.curdictNum,
        //     nodename: leftService.getParamValue("nodename"),
        //     isShowPreview: isshowPreview
        // });
        $scope.isShowPreview = isshowPreview == 0 ? false : true;
        var router = isshowPreview == 0 ? 'resourcectrl.digital.resource' : 'resourcectrl.digital.preview';
        if ($scope.curdictNum == 'navigation_005001') {
            loadSubBigData($scope.leftList[0]);
            $scope.leftList[0].isOpen = "true";
        } else {
            $state.go(router, {
                typename: typeName,
                nodeid: $scope.curdictNum,
                nodename: leftService.getParamValue("nodename"),
            });
        }
        // loadSubBigData(item)
    };
    /** 点击节点展开列表 */
    $scope.loadSubItem = function(item, event) {
        var nodeId = item.id || item.METACATEGORYID,
            nodeName = item.dictName || item.CATEGORYNAME;
        var rd = Math.random(0, 1) * 100;
        if (item.hasChildren != "false" && channelName == "gxgk") {
            loadWCMSubData(item);
        }
        if (item.hasChildren == "true" && typeName == 'szb') {
            loadSubBigData(item);
            return;
        }
        if (!nodeId || (channelName == "gxgk" && !typeName)) {
            return false;
        }
        $state.go($state.current.name, {
            typename: typeName,
            modalid: modalid,
            nodeid: nodeId,
            nodename: nodeName,
            change: rd
        });
        $scope.curdictNum = nodeId;
        event.stopPropagation();
    };
    /** [setUsualItem 设置常用] */
    $scope.setUsualItem = function(item, temp, evt) {
        var ct = contentType[modalid],
            custom = item.CATEGORYNAME || item.dictName,
            customId = item.METACATEGORYID || item.id;
        if (temp) {
            resourceCenterService.cancleMyCustom({
                CustomId: customId,
                CustomType: ct
            }).then(function(data) {
                item.custom = false;
            });
        } else {
            resourceCenterService.saveMyCustom({
                Custom: custom,
                CustomId: customId,
                CustomType: ct
            }).then(function(data) {
                if (data) {
                    item.custom = true;
                }
            });
        }
        evt.stopPropagation();
    };
    /** [cancelUsualItem 取消常用设置] */
    // $scope.cancelUsualItem = function(item) {
    //     var ct = contentType[modalid];
    //     resourceCenterService.cancleMyCustom({
    //         CustomId: item.METACATEGORYID || item.id,
    //         CustomType: ct
    //     }).then(function(data) {
    //         item.custom = false;
    //     });
    // };
    /** [loadLeafArea 加载省市县] */
    $scope.loadLeafArea = function(item, evet, type) {

        !$scope.area && ($scope.area = {});
        if (item.children) {
            $scope.area[type] = item.children;
            if (type == "first") {
                $scope.area.second = [];
                $scope.area.third = [];
                $scope.curSubitem = item;
            } else if (type == "second") {
                $scope.third = [];
            }
        } else {
            item.hasChildren && resourceCenterService.getBase({
                channelName: channelName,
                typeName: typeName,
                parentId: item.id,
                level: 1,
                containParent: false
            }).then(function(data) {
                if (angular.isArray(data)) {
                    $scope.area[type] = data;
                    item.children = data;
                } else {
                    item.children = [];
                }
                if (type == "first") {
                    $scope.area.second = [];
                    $scope.area.third = [];
                    $scope.curSubitem = item;
                    var nowLeafArea = getLeafAreaPosition(data);
                    if (angular.isDefined(nowLeafArea)) {
                        $scope.leftList.chnlid = data[nowLeafArea].id;
                    }
                } else if (type == "second") {
                    $scope.third = [];
                }
            });
        }
        reset(item);
        if (item.show == "" || item.show == undefined) {
            //item.arrowBtn = "";
            item.show = "show";
        } else {
            //item.arrowBtn = "arrowBtnActive";
            item.show = "";
        }
        /**
         * [getLeafAreaPosition description] 记忆当前选中的市县
         * @param  {[type]} data [description]
         * @return {[type]}      [description]
         */
        function getLeafAreaPosition(data) {
            for (var i = 0; i < data.length; i++) {
                if (data[i].id == nodeid) {
                    return i;
                }
            }
        }
        //resetAll(item);
        //event.stopPropagation();
        event.stopPropagation();
    };

    function resetAll(item) {
        var leftList = $scope.leftList;
        for (var i = 0; i < leftList.length; i++) {
            var items = leftList[i];
            if (items.CHILDREN) {
                for (var j = 0; j < items.CHILDREN.length; j++) {
                    var chnl = items.CHILDREN[j];
                    if (item.id != chnl.id) {
                        chnl.arrowBtn = "";
                        chnl.show = "";
                    }
                }
            }
        }
    }

    function reset(item) {
        var leftList = $scope.leftList;
        for (var i = 0; i < leftList.length; i++) {
            var items = leftList[i];
            for (var j = 0; j < items.CHILDREN.length; j++) {
                var chnl = items.CHILDREN[j];
                if (item.id != chnl.id) {
                    chnl.show = "";
                }
            }

        }
    }
}]).factory("leftService", function($state, $stateParams) {
    var service = {
        getCurChannel: function() {
            var states = $state.current.name.split(".");
            return states[1];
        },
        resNavValue: {
            iwo: "iwo",
            share: "gxgk",
            xinhua: "xhsg",
            stock: "jtcpg",
            picture: "tpg",
            video: "ypg",
            website: "wz",
            wechat: "wx",
            app: "app",
            weibo: "wb",
            digital: "szb"
        },
        getParamValue: function(name) {
            return $stateParams[name];
        }
    };
    return service;
});
