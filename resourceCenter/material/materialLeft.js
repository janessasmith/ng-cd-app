"use strict";
/**
 * created By cc 16-11-28 图片库左侧模块
 */
angular.module('resourceCenterMaterialLeftModule', []).
controller('resourceCenterMaterialLeftCtrl', ["$scope", "$location", "$q", '$state', '$filter', "trsHttpService", "resourceCenterService", "resourceCenterMaterialService", "storageListenerService",
    function($scope, $location, $q, $state, $filter, trsHttpService, resourceCenterService, resourceCenterMaterialService, storageListenerService) {
        initStatus();
        initData();
        /**
         * [initStatus description]初始化状态
         * @return {[type]} [description]
         */
        function initStatus() {
            $scope.status = {
                isdataLoaded: true, //是否显示加载中
                path:$location.path().split('/')[2],//通过路由获得素材是图片库还是视频库
                materialType:{
                    picture:1,
                    video:2
                },//素材分类类型
            };
            $scope.data = {
                items: [],
                selectedItem: "", //被选中的分类
                MATERIALTYPE: $scope.status.materialType[$scope.status.path],//素材分类类型ID
            };
        }
        /**
         * [initData description]初始化数据
         * @return {[type]} [description]
         */
        function initData() {
            $scope.$on('queryPicLeftClassify', function(event, msg) {
                queryPicLeftClassify(msg); //查询左侧分类
            });
        }
        /**
         * [classifyFilter description]一级分类过滤器
         * @param  {[obj]} elm  [description]分类信息
         * @return {[type]}     [description]
         */
        $scope.classifyFilter = function(elm) {
            if (elm) {
                return elm.MATERIALTYPEID == $scope.status.classifyId;
            }
        };
        /**
         * [subClassifyFilter description]子分类过滤器
         * @param  {[obj]} elm  [description]子分类信息
         * @return {[type]}     [description]
         */
        $scope.subClassifyFilter = function(elm) {
            if (elm) {
                return elm.MATERIALTYPEID == $state.params.materialtypeid;
            }
        };
        /**
         * [queryPicLeftClassify description]查询左侧一级分类
         * @param  {[str]} materialtypeid  [description]分类父id
         * @return {[type]}                [description]
         */
        function queryPicLeftClassify(materialtypeid) {
            var temp = ""; //被选中的二级分类
            resourceCenterMaterialService.queryClassify($scope.data.MATERIALTYPE, materialtypeid).then(function(data) {
                $scope.status.isdataLoaded = false;
                $scope.status.classifyId = $state.params.parentid ? $state.params.parentid : $state.params.materialtypeid; //区分一级分类和二级分类
                if (!data) return;
                $scope.data.items = data;
                temp = $filter('pick')($scope.data.items, $scope.classifyFilter)[0];
                if (!temp) return;
                $scope.data.selectedItem = temp;
                if (temp.HASCHILDREN == 'true') {
                    temp.isOpen = true;
                    return resourceCenterMaterialService.queryClassify($scope.data.MATERIALTYPE, temp.MATERIALTYPEID);
                }
                // dealClassify(data,temp);
            }).then(function(data) {
                if (!data) return;
                temp.CHILDREN = data.DATA ? data.DATA : data;
                if ($state.params.parentid) {
                    $scope.data.selectedItem = $filter('pick')(temp.CHILDREN, $scope.subClassifyFilter)[0];
                }
            }); //语法糖
        }
        /**
         * [dealClassify description]分类处理函数
         * @param  {[array]} data [description]二级分类集合
         * @param  {[obj]} temp   [description]被选中的二级分类
         * @return {[type]}       [description]
         */
        function dealClassify(data, temp) {
            $scope.status.isdataLoaded = false;
            $scope.status.classifyId = $state.params.parentid ? $state.params.parentid : $state.params.materialtypeid; //区分一级分类和二级分类
            if (!data) return;
            $scope.data.items = data;
            temp = $filter('pick')($scope.data.items, $scope.classifyFilter)[0];
            if (!temp) return;
            $scope.data.selectedItem = temp;
            if (temp.HASCHILDREN == 'true') {
                temp.isOpen = true;
                return resourceCenterMaterialService.queryClassify($scope.data.MATERIALTYPE, temp.MATERIALTYPEID);
            }
        }
        /**
         * [loadSubItem description]加载子分类
         * @param  {[obj]} item   [description]分类信息
         * @param  {[obj]} event  [description]事件信息
         * @return {[type]}       [description]
         */
        $scope.loadSubItem = function(item, event) {
            $scope.data.selectedItem = item;
            $state.go("resourcectrl."+$scope.status.path+".resource", {
                "materialtypeid": item.MATERIALTYPEID,
                "parentid": null,
            });
            if (!item.HASCHILDREN || item.CHILDREN) return; //没有子的时候返回
            loadSubClassify(item);
        };
        /**
         * [loadSubClassify description]查询子分类
         * @param  {[obj]} temp  [description]父分类信息
         * @return {[type]}      [description]
         */
        function loadSubClassify(temp) {
            resourceCenterMaterialService.queryClassify($scope.data.MATERIALTYPE, temp.MATERIALTYPEID).then(function(data) {
                temp.CHILDREN = data.DATA ? data.DATA : data;
                if ($state.params.parentid) {
                    $scope.data.selectedItem = $filter('pick')(temp.CHILDREN, $scope.subClassifyFilter)[0];
                }
            });
        }
        /**
         * [getDraft description]获得子分类下的稿件
         * @param  {[obj]} item   [description]子分类信息
         * @param  {[obj]} event  [description]事件信息
         * @return {[type]}       [description]
         */
        $scope.getDraft = function(item, event) {
            $scope.data.selectedItem = item;
            $state.go("resourcectrl."+$scope.status.path+".resource", {
                "materialtypeid": item.MATERIALTYPEID,
                "parentid": item.PARENTID
            });
            event.stopPropagation();
        };
    }
]);
