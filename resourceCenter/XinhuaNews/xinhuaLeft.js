"use strict";
/**
 * Created By cc 16-11-28
 * Modify By  cc 17-02-21 
 * 新华社稿左侧导航
 */
angular.module('resourceCenterXinhuaLeftModule', []).
controller('resourceCenterXinhuaLeftCtrl', ["$scope", "$state", "$timeout", "$filter", "resourceCenterService", "trsHttpService", "leftService", "trsconfirm",
    function($scope, $state, $timeout, $filter, resourceCenterService, trsHttpService, leftService, trsconfirm) {
        initStatus();
        initData();
        /**
         * [initStatus description]初始化状态
         * @return {[type]} [description]
         */
        function initStatus() {
            $scope.status = {
                isdataLoaded: true, //是否显示载入中
                isArea: leftService.getParamValue('typename') == 'area' ? true : false,
                allWords: 'navigation_001014', //全部文字
                allImages: 'navigation_001015' //全部图片
            };
            $scope.data = {
                items: [],
                selectedItem: {}, //被选中的分类(主要对应的是线路分类跟主题分类)
                channelName: leftService.resNavValue[leftService.getCurChannel()], //栏目名称
                typeName: leftService.getParamValue('typename'), //区分地域分类
                modalid: leftService.getParamValue('modalid'), //上级分类ID
                nodename: leftService.getParamValue("nodename"),
                areaItem: {}, //被选中的地域分类
                areaSubItem: {}, //地域分类的子分类
            };
        }
        /**
         * [initData description]初始化数据
         * @return {[type]} [description]
         */
        function initData() {
            $scope.data.typeName == 'area' ? loadFormatArea() : loadData();
        }
        /**
         * [loadData description]加载列表数据(主题分类和线路分类)
         * @return {[type]} [description]
         */
        function loadData() {
            resourceCenterService.getBase({
                channelName: $scope.data.channelName,
                typeName: $scope.data.typeName,
                containParent: false,
                level: $scope.data.typeName == 'szb' ? 1 : 2
            }).then(function(data) {
                if (data.length < 1 || !angular.isArray(data)) return; //没有数据时跟资源库切入时的路由问题
                $scope.data.items = data;
                $scope.status.isdataLoaded = false;
                if (data[0].hasChildren == 'false') { //区分线路分类跟主题分类(线路分类只有一级，主题分类有两级是一颗同步树)
                    routerToXlfl();
                } else {
                    routerToZtfl();
                    routerToList($scope.data.selectedItem);
                }
            });
        }
        /**
         * [classifyFilter description]分类过滤器
         * @param  {[obj]} elm  [description]分类信息
         * @return {[type]}     [description]
         */
        $scope.classifyFilter = function(elm) {
            if (elm) {
                return elm.id == $state.params.nodeid;
            }
        };
        /**
         * [routerToxlfl description]线路分类路由
         * @return {[type]} [description]
         */
        function routerToXlfl() {
            if ($scope.data.items.length < 1) return; //没有分类的时候返回
            var selectedClassify = ""; //被选中的线路分类
            for (var i = 0; i < $scope.data.items.length; i++) {
                if ($scope.data.items[i].id == $scope.status.allWords || $scope.data.items[i].id == $scope.status.allImages) {
                    $scope.data.items[i].dictName = '-------【' + $scope.data.items[i].dictName + '】-------';
                }
            }
            selectedClassify = $state.params.nodeid ? $filter('pick')($scope.data.items, $scope.classifyFilter)[0] : $scope.data.items[1]; //默认选择通稿新闻路线
            var index = $scope.data.items.indexOf(selectedClassify);
            $scope.data.items[index].isOpen = true;
            routerToList(selectedClassify);
        }
        /**
         * [routerToZtfl description]主题分类路由
         * @return {[type]} [description]
         */
        function routerToZtfl() {
            if ($state.params.nodeid) { //区分第一次进入还是F5刷新
                for (var i = 0; i < $scope.data.items.length; i++) { //由于主题分类是二级同步树，所以需要一个二重循环
                    if ($scope.data.items[i].id == $state.params.nodeid) { //区分上次定位的是一级分类还是二级分类
                        $scope.data.items[i].isOpen = true;
                        $scope.data.selectedItem = $scope.data.items[i];
                        return;
                    }
                    for (var j = 0; j < $scope.data.items[i].CHILDREN.length; j++) {
                        if ($scope.data.items[i].CHILDREN[j].id == $state.params.nodeid) {
                            $scope.data.items[i].isOpen = true;
                            $scope.data.selectedItem = $scope.data.items[i].CHILDREN[j];
                            return;
                        }
                    }
                }
            } else {
                $scope.data.items[0].isOpen = true;
                $scope.data.selectedItem = $scope.data.items[0].CHILDREN[0];
            }
        }
        /**
         * [loadSubItem description]加载子分类
         * @param  {[obj]} item  [description]父分类信息
         * @return {[type]}      [description]
         */
        $scope.loadSubItem = function(item) {
            $scope.data.selectedItem = item;
            routerToList(item);
        };
        /**
         * [getDraft description]跳转到稿件列表页面
         * @param  {[obj]} item   [description]二级分类信息
         * @param  {[obj]} event  [description]事件对象
         * @return {[type]}       [description]
         */
        $scope.routerToList = function(item, event) {
            $scope.data.selectedItem = item;
            routerToList(item);
            event.stopPropagation();
        };
        /**
         * [routerToAreaList description]跳转到地域分类页面
         * @param  {[obj]} item        [description]当前分类信息
         * @param  {[obj]} event       [description]事件对象
         * @param  {[obj]} parentItem  [description]父分类信息
         * @return {[type]}            [description]
         */
        $scope.routerToAreaList = function(item, event, parentItem) {
            reset(item);
            $scope.data.areaItem = "";
            parentItem.arrowBtn = 'arrowBtnActive'; //伸缩的样式
            $scope.data.areaSubItem = item;
            routerToList(item);
            event.stopPropagation();
        };
        /**
         * [loadLeafArea description]加载地域子分类
         * @param  {[obj]} item   [description]当前分类
         * @param  {[obj]} event  [description]时间对象
         * @param  {[str]} type   [description]分类登记
         * @return {[type]}       [description]
         */
        $scope.loadLeafArea = function(item, event, type) {
            !$scope.area && ($scope.area = {});
            $scope.data.areaItem = $scope.data.areaItem == item ? "" : item;//切换左侧三级展开项
            if (item.children) {
                $scope.area[type] = item.children;
                if (type == "first") {
                    $scope.area.second = [];
                    $scope.area.third = [];
                    // $scope.data.areaSubItem = item;
                } else if (type == "second") {
                    $scope.third = [];
                }
            } else {
                item.hasChildren && resourceCenterService.getBase({
                    channelName: "xhsg",
                    typeName: $scope.data.typeName,
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
                        $scope.data.areaItem = item;
                        var nowLeafArea = getLeafAreaPosition(data);
                        if (angular.isDefined(nowLeafArea)) {
                            $scope.data.areaSubItem = data[nowLeafArea];
                        }
                    } else if (type == "second") {
                        $scope.third = [];
                    }
                });
            }
            // reset(item);
            event.stopPropagation();
        };
        /**
         * [routerToList description]跳转到列表页
         * @param  {[obj]} item  [description]分类信息
         * @return {[type]}      [description]
         */
        function routerToList(item) {
            $state.go($state.current.name, {
                typename: $scope.data.typeName,
                modalid: $scope.data.modalid,
                nodeid: item.id,
                nodename: item.dictName,
            });
        }
        /**
         * [loadFormatArea description]地域信息加载
         * @return {[type]} [description]
         */
        function loadFormatArea() {
            var ningXiaAreaparams = {
                "typeName": "area",
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
            /**
             * [loadNingXia description]宁夏省加载
             * @param  {[obj]} obj  [description]请求采纳数
             * @return {[type]}     [description]
             */
            function loadNingXia(obj) {
                resourceCenterService.getBase(obj)
                    .then(function(data) {
                        if (data && data.length) {
                            $scope.status.isdataLoaded = false;
                            $scope.data.items = data;
                            $scope.data.selectedItem = data[0].CHILDREN[0];
                            loadAreaParams(areaparams);
                        }
                    });
            }
            /**
             * [loadAreaParams description]加载国内信息
             * @param  {[obj]} obj  [description]请求信息
             * @return {[type]}     [description]
             */
            function loadAreaParams(obj) {
                resourceCenterService.getBase(obj)
                    .then(function(data) {
                        if (data && data.length) {
                            data[0].dictName = "全国";
                            $scope.data.items.push(data[0]);
                            loadExtra(extraAreaparams);
                        }
                    });
            }
            /**
             * [loadExtra description]加载其他区域
             * @param  {[obj]} obj  [description]请求参数
             * @return {[type]}     [description]
             */
            function loadExtra(obj) {
                resourceCenterService.getBase(obj)
                    .then(function(data) {
                        if (data && data.length) {
                            $scope.data.items.push({
                                dictName: "海外",
                                CHILDREN: data
                            });
                        }
                        if ($scope.data.items[0].CHILDREN && !$state.params.nodeid) {
                            var curItem = $scope.data.items[0].CHILDREN[0];
                            var rd = Math.random(0, 1) * 100;
                            $scope.data.items[0].isOpen = true;
                            $scope.curdictNum = curItem.id;
                            $state.go($state.current.name, {
                                typename: "area",
                                modalid: $state.params.modalid,
                                nodeid: curItem.id,
                                nodename: curItem.dictName
                            });
                        } else {
                            var areaType = getAreaPosition($scope.data.items)[2];
                            var nowProvince = getAreaPosition($scope.data.items)[0];
                            var nowCity = getAreaPosition($scope.data.items)[1];
                            if (angular.isDefined(areaType) && areaType === true) {
                                $scope.data.items[nowProvince].isOpen = true;
                                $scope.data.areaSubItem.id = $scope.data.items[nowProvince].CHILDREN[nowCity].id;
                            } else if (angular.isDefined(areaType) && areaType === false) {
                                $scope.data.items[nowProvince].isOpen = true;
                                $scope.data.items[nowProvince].CHILDREN[nowCity].arrowBtn = 'arrowBtnActive';
                            } else {
                                $scope.data.items[0].isOpen = true;
                                $scope.data.areaSubItem.id = $scope.data.items[0].CHILDREN[0].id;
                            }
                        }
                    });
            }
            return function() {
                loadNingXia(ningXiaAreaparams);
            }();
        }
        /**
         * [getLeafAreaPosition description] 记忆当前选中的市县
         * @param  {[type]} data [description]
         * @return {[type]}      [description]
         */
        function getLeafAreaPosition(data) {
            for (var i = 0; i < data.length; i++) {
                if (data[i].id == $state.params.nodeid) {
                    return i;
                }
            }
        }
        /**
         * [reset description]还原当前
         * @param  {[obj]} item  [description]当前分类信息
         * @return {[type]}      [description]
         */
        function reset(item) {
            var leftList = $scope.data.items;
            for (var i = 0; i < leftList.length; i++) {
                var items = leftList[i];
                for (var j = 0; j < items.CHILDREN.length; j++) {
                    var chnl = items.CHILDREN[j];
                    if (item.id != chnl.id) {
                        chnl.arrowBtn = "";
                        chnl.show = "";
                    }
                }

            }
        }
        /**
         * [getAreaPosition description] 记忆当前选中的区域
         * @return {[type]} [description]
         */
        function getAreaPosition(data) {
            for (var i = 0; i < data.length; i++) {
                for (var j = 0; j < data[i].CHILDREN.length; j++) {
                    if ($state.params.nodeid == data[i].CHILDREN[j].id) {
                        return [i, j, true];
                    } else if ($state.params.nodeid.indexOf(data[i].CHILDREN[j].id) >= 0) {
                        return [i, j, false];
                    }
                }

            }
        }
    }
]);
