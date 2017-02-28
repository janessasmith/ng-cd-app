/*
    Create by CC 16-12-07 多分类选择
*/
'use strict';
angular.module("resourceCenterPictureClassifyModule", [])
    .controller("resourceCenterPictureClassify", ["$scope", "$filter", "$timeout", "$modalInstance", "$state", "trsHttpService", "trsspliceString", "trsconfirm", "title", 'params', 'selectedClassifys', 'resourceCenterMaterialService', function($scope, $filter, $timeout, $modalInstance, $state, trsHttpService, trsspliceString, trsconfirm, title, params, selectedClassifys, resourceCenterMaterialService) {
        initStatus();
        initData();

        function initStatus() {
            $scope.status = {
                treeOptions: {
                    nodeChildren: "CHILDREN",
                    dirSelectable: true,
                    allowDeselect: false,
                    injectClasses: {
                        ul: "copyDraftTree-ul",
                        li: "copyDraftTree-li",
                        liSelected: "a7",
                        iExpanded: "a3",
                        iCollapsed: "a4",
                        iLeaf: "a5",
                        label: "copyDraftTree-label",
                        labelSelected: "rolegrouplabselected"
                    },
                    isLeaf: function(node) {
                        return node.HASCHILDREN === "false";
                    }
                },
                ifExpand: true
            };
            $scope.data = {
                selectedClassifys: selectedClassifys, //被选择栏目集合
                modalTitle: title ? title : "分类选择", //标题
                dataForTheTree: "", //树结构赋值
                selectedArray: [],
            };
        }

        function initData() {
            getDefaultClassify();
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function(data) {
                $scope.data.classifyName = data.TITLE;
                $scope.data.dataForTheTree = [data];
                $scope.expandedTest.push(data); //展开一级节点
                if (data.HASCHILDREN == 'true') {
                    for (var i = 0; i < data.CHILDREN.length; i++) {
                        $scope.expandedTest.push(data.CHILDREN[i]); //展开二级节点
                    }
                }
            });
        }
        /**
         * [getDefaultClassify description]获得默认分类信息，新建时使用
         * @return {[type]} [description]
         */
        function getDefaultClassify() {
            if (selectedClassifys.length > 0) return;
            resourceCenterMaterialService.queryClassifyDetail($state.params.materialtypeid).then(function(data) {
                if (data.HASCHILDREN == 'false') {
                    $scope.data.selectedClassifys = [data];
                }
            });
        }
        $scope.cancel = function() {
            $modalInstance.dismiss();
        };
        // var promise;
        // $scope.getSuggestionsSc = function(viewValue) {
        //     if (promise) {
        //         $timeout.cancel(promise);
        //         promise = null;
        //     }
        //     promise = $timeout(function() {
        //         var searchParams = {
        //             "serviceid": "mlf_mediasite",
        //             "methodname": "queryClassifyByName",
        //             "ChannelName": viewValue,
        //             "SiteId": chnlParams.siteid
        //         };
        //         return trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), searchParams, "post")
        //             .then(function(data) {
        //                 return data;
        //             });
        //     }, 10);
        //     return promise;
        // };
        // //监控SUGGESTION
        // $scope.$watch("searchChannel", function(newValue, oldValue) {
        //     if (angular.isObject(newValue)) {
        //         chongFPush($scope.selectedClassifys, newValue);
        //         $scope.searchChannel = "";
        //     }
        // });
        /**
         * [ifSelected description]节点是否被选中
         * @param  {[obj]} node       [description]节点信息
         * @param  {[str]} attribute  [description]属性
         * @return {[type]}           [description]
         */
        $scope.ifSelected = function(node, attribute) {
            var flag = false;
            for (var i = 0; i < $scope.data.selectedClassifys.length; i++) {
                if (angular.isDefined($scope.data[attribute][i])) {
                    if (node.MATERIALTYPEID === $scope.data[attribute][i].MATERIALTYPEID && node.HASCHILDREN == 'false') {
                        flag = true;
                        break;
                    }
                }
            }
            return flag;
        };
        /**
         * [chooseClassify description]分类选择
         * @param  {[obj]} node  [description]分类信息
         * @return {[type]}      [description]
         */
        $scope.chooseClassify = function(node) {
            var temp = $filter('filterBy')($scope.data.selectedClassifys, ['MATERIALTYPEID'], node.MATERIALTYPEID);
            if (temp.length < 1) {
                $scope.data.selectedClassifys.push(node);
                $scope.data.selectedArray.push(node);
                $scope.data.selectedClassifys = $filter('unique')($scope.data.selectedClassifys, 'MATERIALTYPEID');
            } else {
                cancelClassify(node);
            }
        };
        /**
         * [cancelChannel description]取消分类
         * @param  {[obj]} classify  [description]分类信息
         * @return {[type]}          [description]
         */
        $scope.cancelClassify = function(classify) {
            cancelClassify(classify);
        };
        /**
         * [cancelClassify description]取消选择分类
         * @param  {[obj]} classify  [description]分类信息
         * @return {[type]}          [description]
         */
        function cancelClassify(classify) {
            angular.forEach($scope.data.selectedClassifys, function(data, index, array) {
                if (data.MATERIALTYPEID === classify.MATERIALTYPEID) {
                    $scope.data.selectedClassifys[index].selected = false;
                    $scope.data.selectedClassifys.splice(index, 1);
                    $scope.data.selectedArray.splice(index, 1);
                }
            });
        }
        $scope.confirm = function() {
            if ($scope.data.selectedClassifys.length === 0) {
                trsconfirm.alertType("请选择分类", "", "warning", false);
                return;
            }
            $modalInstance.close($scope.data.selectedClassifys);
        };
        //防止重复推送开始
        // function chongFPush(array, data) {
        //     var flagR = true;
        //     angular.forEach(array, function(dataC, index, array) {
        //         if (dataC.CHANNELID == data.CHANNELID) {
        //             flagR = false;
        //             return;
        //         }
        //     });
        //     if (flagR === true) {
        //         array.push(data);
        //     }
        // }
    }]);
