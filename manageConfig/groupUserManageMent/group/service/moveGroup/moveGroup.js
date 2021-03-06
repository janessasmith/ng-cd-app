/*
    Create by fanglijuan 2016-05-10
*/
'use strict';
angular.module("userMngGroupMngMoveGroupModule", [])
    .controller("userMngGroupMngMoveGroupCtrl", ["$scope", "trsconfirm", "$timeout", "$modalInstance", "trsHttpService", '$http', 'treeService', "$state", "globleParamsSet", "userManageMentService", "moveGroupInfo", function($scope, trsconfirm, $timeout, $modalInstance, trsHttpService, $http, treeService, $state, globleParamsSet, userManageMentService, moveGroupInfo) {
        initStatus();
        initData();
        /**
         * [initStatus description]初始化参数
         */
        function initStatus() {
            $scope.status = {
                ifExpand: true,
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
                }
            };
            $scope.data = {
                modalTitle: moveGroupInfo.modalTitle,
                selectedGroup: "",
                fromGroupId: moveGroupInfo.fromGroupId,
                parentGroupId: moveGroupInfo.parentGroupId
            };
            $scope.params = {
                serviceid: "mlf_groupmanagement",
                methodname: "moveToBaseGroup",
                FromGroupIds: moveGroupInfo.fromGroupId,
                ToGroupId: "",
            };
        }
        /**
         * [showToggle description]树展开方法
         * @param  {[obj]} node [description]父节点
         * @return {[type]}        [description]
         */
        $scope.showToggle = function(node) {
            if (node.HASCHILDREN === "false" || (angular.isDefined(node.CHILDREN) && node.CHILDREN.length !== 0))
                return;
            treeService.queryChildGroupsWithSecondRight(node.GROUPID).then(function(data) {
                node.CHILDREN = data.CHILDREN;
            });
        };
        /**
         * [showSelected description]点击组织树节点
         * @param  {[obj]} node [description]点击的节点
         * @return {[type]}        [description]
         */
        $scope.showSelected = function(node) {
            $scope.GroupId = node.GROUPID;
        };

        /**
         * [initData description]初始化数据
         */
        function initData() {
            getTreeData();
        }
        $scope.chooseGroup = function(node) {
            $scope.data.selectedGroup = node;
        };
        /**
         * [getTreeData description]获取树数据
         * @param  {[obj]} params [description]请求参数
         * @param  {[string]} roleid   [description]角色Id非必传
         * @return {[type]}        [description]
         */
        function getTreeData() {
            treeService.queryGroupTreeWithSecondRight().then(function(data) {
                $scope.data.treeData = [data];
                ExpandedNodes();
                //disableTreeOptions();
            });
        }
        /**
         * [disableTreeOptions description]让需要移动的组织在组织树上失效[radio：disable]
         * @return {[type]} [description]
         */
        /*function disableTreeOptions(){
            for (var i = 0; i <$scope.params.FromGroupIds.length; i++) {
                var fromGroupId = $scope.params.FromGroupIds[i];

            }
        }*/
        //默认展开树开始
        function ExpandedNodes() {
            $scope.expandedTest = [];
            $scope.expandedTest.push($scope.data.treeData[0]);
            if ($scope.data.treeData[0].CHILDREN === 0) {
                $scope.selectedNode = $scope.data.treeData[0];
                getGroupData($scope.selectedNode);
            } else {
                angular.forEach($scope.data.treeData[0].CHILDREN, function(data, index, array) {
                    if (data.ISPATH === "true") {
                        $scope.expandedTest.push(data);
                        if (data.CHILDREN.length !== 0) {
                            selfPath(data);
                        } else {
                            $scope.selectedNode = data;
                            getGroupData($scope.selectedNode);
                        }

                    }
                });
            }
        }
        //默认展开树结束
        function getGroupData(node) {
            $timeout(function() {
                    //此判断如果两次点击同一个树，不重复加载角色列表。
                    if ($scope.oldSelectNode !== undefined && node.GROUPID == $scope.oldSelectNode.GROUPID) {
                        return;
                    }
                    $scope.groupObj = node;
                    $scope.oldSelectNode = node;
                    $scope.roleDatas = [];
                    $scope.roleData = null;
                    var params = {
                        "serviceid": "mlf_extrole",
                        "methodname": "query",
                        "GroupId": $scope.groupObj.GROUPID
                    };
                    $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function(data) {
                        $scope.data.roleDatas = data;
                    }, function(data) {
                        trsconfirm.alertType("错误提示", "获取数据失败", "warning", false);
                    });
                },
                100);
        }
        //点击树回调函数开始
        $scope.showSelected = function(node) {
            getGroupData(node);
        };
        //点击树回调函数结束




        //确定
        $scope.confirm = function() {
            $scope.params.ToGroupId = $scope.data.selectedGroup.GROUPID;
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), $scope.params, "get").then(function(data) {
                trsconfirm.alertType("组织移动成功", "", "success", false, function() {
                    $modalInstance.close('success');
                });
            });
        };
        //取消
        $scope.cancel = function() {
            $modalInstance.dismiss();
        };
    }]);
