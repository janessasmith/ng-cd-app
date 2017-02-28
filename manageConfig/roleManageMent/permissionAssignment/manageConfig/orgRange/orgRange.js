/*
    create by BaiZhiming 2016-2-25
*/
'use strict';
angular.module("manageCfg.roleManageMent.permissionAssignment.orgRange", ["manageCfg.roleManageMent.permissionAssignment.productAndModule", "manageCfg.roleManageMent.permissionAssignment.SavePerModule"])
    .controller("orgRangeCtrl", ["$scope", "$timeout", "$state", "$modal", "$compile", "$element", "trsHttpService", "SweetAlert", "trsconfirm", "permissionAssignmentService", function($scope, $timeout, $state, $modal, $compile, $element, trsHttpService, SweetAlert, trsconfirm, permissionAssignmentService) {
        //声明将要保存权限的数组对象开始
        var selecetedChanls = {};
        //声明将要保存权限的数组对象结束
        initData();
        $scope.productAndModule = function() {
            var productAndModule = $modal.open({
                templateUrl: "./manageConfig/roleManageMent/permissionAssignment/service/productAndModule/productAndModule_tpl.html",
                scope: $scope,
                windowClass: 'manage-authorityAssignment',
                backdrop: false,
                controller: "productAndModuleCtrl"
            });
        };
        $scope.channelTreeOptions = {
            nodeChildren: "CHILDREN",
            injectClasses: {
                ul: "a1",
                li: "manage-main-rightDiv-leftDiv-treeLi",
                liSelected: "a7",
                iExpanded: "a3", //"manage-main-rightDiv-leftDiv-treeIcon",
                iCollapsed: "a4", //"manage-main-rightDiv-leftDiv-treeIcon",
                iLeaf: "a5",
                label: "a6",
                labelSelected: "a8"
            },
            isLeaf: function(node) {
                return node.HASCHILDREN === 'false';
            },
            isSelectable: function(node) {
                return node.HASRIGHT === "true";
            },
            dirSelectable: true,
            allowDeselect: false
        };
        /**
         * [isAuthorized description]判断是否已赋权，渲染左侧树节点
         * @return boolean [description]
         */
        $scope.isAuthorized = function(node) {
            var flag = false;
            if (angular.isDefined(node.RIGHTINDEX)) {
                var rightIndexs = node.RIGHTINDEX.split(",");
                for (var i = 0; i < rightIndexs.length; i++) {
                    if (node.RIGHTVALUE[parseInt(rightIndexs[i].replace(/\"/g, "")) - 1] === "1") {
                        flag = true;
                    }
                }
            }
            return flag;
        };
        $scope.cTshowSelected = function(sel) {
            permissionAssignmentService.initGroupRight(sel, $scope.roleData.ROLEID).then(function(data) {
                sel.RIGHTID = data;
                delete $scope.rightClassify;
                $scope.authorSelectedNode = sel;
                if (!angular.isArray($scope.authorSelectedNode.RIGHTVALUE)) {
                    $scope.authorSelectedNode.RIGHTVALUE = $scope.authorSelectedNode.RIGHTVALUE.split("");
                    $scope.authorSelectedNode.HASSED = $scope.authorSelectedNode.RIGHTVALUE.indexOf("1") > -1 ? true : false;
                }
                //将要推送的保存权限对象开始
                var tempId = $scope.authorSelectedNode.OBJID;
                var tempObj = {
                    "ID": parseInt($scope.authorSelectedNode.RIGHTID),
                    "OPRTYPE": 203,
                    "OPRID": parseInt($scope.roleData.ROLEID),
                    "OBJTYPE": parseInt($scope.authorSelectedNode.OBJTYPE),
                    "OBJID": parseInt($scope.authorSelectedNode.OBJID),
                    "NEWVALUE": $scope.authorSelectedNode.RIGHTVALUE
                };

                selecetedChanls[tempId] = tempObj;
                //将要推送的保存权限对象结束
                queryRightClassify($scope.classify);
            });
        };
        //展开树操作
        $scope.showToggle = function(node) {
            if (angular.isDefined(node.CHILDREN) && node.HASCHILDREN === "true" && node.CHILDREN.length === 0) {
                var params = {
                    serviceid: "mlf_group",
                    methodname: "queryChildGroupsWithSecondRight",
                    GroupId: node.GROUPID,
                    RoleId: $scope.roleData.ROLEID
                };
                $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "post")
                    .then(function(data) {
                        node.CHILDREN = data.CHILDREN;
                    });
            }
        };
        //处理节点名称，用于应对不同模块类型节点名称显示
        $scope.getNodeDesc = function(node) {
            return node.GNAME || node.GDESC;
        };
        //判断节点是否是根节点
        //参数1：节点 类型：obj
        //返回值：true(是根节点) false:（false）
        $scope.isRootNode = function(node) {
            return false;
        };
        //保存权限开始
        $scope.save = function() {
            if ($scope.status.isToChildren) {
                toChildrenSave();
            } else {
                commonSave();
            }
        };
        //保存权限结束
        //普通保存权限
        function commonSave() {
            var i = 0,
                postRights = [];
            concatPermission();
            for (var key in selecetedChanls) {
                postRights.push(angular.copy(selecetedChanls[key]));
                postRights[i].NEWVALUE = angular.isArray(postRights[i].NEWVALUE) ? postRights[i].NEWVALUE.join("") : postRights[i].NEWVALUE;
                i++;
            }
            var postRightsString = JSON.stringify(postRights);
            /*if ($scope.classify !== "iwo") {
                selecetedChanls = {};
            }*/
            var params = {
                "serviceid": "mlf_extrole",
                "methodname": "saveRight",
                "RoleId": $scope.roleData.ROLEID,
                "rights": postRightsString
            };
            if (postRights.length === 0) {
                trsconfirm.alertType("您尚未设置权限", "您尚未设置权限", "error", false);
                return;
            }
            $scope.loadingPromise = trsHttpService.httpServer("/wcm/mlfcenter.do", params, "post").then(function(data) {
                trsconfirm.alertType("保存权限成功", "", "success", false,
                    function() {
                        trsconfirm.alertType("保存权限成功", "", "success", false);
                        $scope.batSetGroupRightObjs = {};
                        delete $scope.authorSelectedNode;
                        delete $scope.rightClassify;
                        getChannelTree($scope.roleData.ROLEID);
                    });
            });
        }
        //递归保存权限
        function toChildrenSave() {
            trsconfirm.alertType("此操作较危险，执行后选中组织的所有子组织权限将受到影响，是否继续执行？", "", "warning", true, function() {
                var params = {
                    "serviceid": "mlf_extrole",
                    "methodname": "saveRight",
                    "RoleId": $scope.roleData.ROLEID,
                    "IsSynchronize": "true",
                    "rights": JSON.stringify([{
                        "ID": parseInt($scope.perSelectedNode.RIGHTID),
                        "OPRTYPE": 203,
                        "OPRID": parseInt($scope.roleData.ROLEID),
                        "OBJTYPE": parseInt($scope.perSelectedNode.OBJTYPE),
                        "OBJID": parseInt($scope.perSelectedNode.OBJID),
                        "NEWVALUE": angular.isArray($scope.perSelectedNode.RIGHTVALUE) ? $scope.perSelectedNode.RIGHTVALUE.join("") : $scope.perSelectedNode.RIGHTVALUE
                    }])
                };
                $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "post").then(function(data) {
                    trsconfirm.alertType("保存权限成功", "", "success", false);
                    $scope.batSetGroupRightObjs = {};
                    delete $scope.perSelectedNode;
                    delete $scope.rightClassify;
                    getChannelTree($scope.roleData.ROLEID);
                });
            });
        }
        //合并批量授权和普通授权开始
        function concatPermission() {
            for (var i in $scope.batSetGroupRightObjs) {
                selecetedChanls[i] = $scope.batSetGroupRightObjs[i];
            }
        }
        //获取树开始
        function getChannelTree(roleId, callback) {
            var params = {
                "serviceid": "mlf_group",
                "methodname": "queryGroupTreeWithSecondRight",
                "RoleId": $scope.roleData.ROLEID
            };
            $scope.loadingPromise = trsHttpService.httpServer("/wcm/mlfcenter.do", params, "get").then(function(data) {
                if (angular.isFunction(callback)) {
                    callback(data);
                } else {
                    $scope.channelTree = [data];
                    $scope.perSelectedNode = $scope.channelTree[0];
                    $scope.cTshowSelected($scope.perSelectedNode);
                    $scope.expandedNodes.push($scope.channelTree[0]);
                }
            });
        }
        //获取树结束
        //获取权限列表开始
        function queryRightClassify(classify) {
            var params = {
                "serviceid": "mlf_extrole",
                "methodname": "queryRightClassify",
                "Classify": classify
            };
            $scope.loadingPromise = trsHttpService.httpServer("/wcm/mlfcenter.do", params, "get").then(
                function(data) {
                    if ($scope.authorSelectedNode !== undefined) {
                        $scope.rightClassify = data;
                        //初始化全选按钮开始
                        $scope.initSelectAll();
                        //初始化全选按钮结束
                    }
                }
            );
        }
        //获取权限列表结束
        //初始化全选按钮方法开始
        $scope.initSelectAll = function() {
            $scope.rightClassify.selectAll = true;
            for (var i = 0; i < $scope.rightClassify.CHILDREN.length; i++) {
                $scope.rightClassify.CHILDREN[i].selectAll = true;
                for (var j = 0; j < $scope.rightClassify.CHILDREN[i].CHILDREN.length; j++) {
                    if ($scope.authorSelectedNode.RIGHTVALUE.length === 0 || $scope.authorSelectedNode.RIGHTVALUE[$scope.rightClassify.CHILDREN[i].CHILDREN[j].RIGHTINDEX - 1] == "0") {
                        $scope.rightClassify.CHILDREN[i].selectAll = false;
                    }
                }
                if ($scope.rightClassify.CHILDREN[i].selectAll === false) {
                    $scope.rightClassify.selectAll = false;
                }
            }
        };
        //初始化全选按钮方法结束
        //删除模板结束
        function initData() {
            $scope.selectedNode;
            //获取左侧树开始
            getChannelTree($scope.roleData.ROLEID);
            //获取左侧树结束
            //获取从产品列表得到的产品数据开始
            getProductListData();
            //获取从产品列表得到的产品数据结束
            if ($scope.roleData === undefined) {
                SweetAlert.swal({
                    title: "错误提示",
                    text: "请选择角色！",
                    type: "warning",
                    closeOnConfirm: true,
                    cancelButtonText: "取消",
                });
                $state.go("manageconfig.rolemanage");
            }
            //监控角色切换开始
            $scope.$on("roleData", function(event, data) {
                $scope.roleData = data;
                getChannelTree($scope.roleData.ROLEID);
                delete $scope.rightClassify;
            });
            //监控角色切换结束
            //模板名称字数限制开始
            $scope.tempNameNum = 6;
            //模板名称字数限制结束
            //批量设置权限对象初始化开始
            $scope.batSetGroupRightObjs = {};
            //批量设置权限对象初始化结束
            $scope.batSetObj = {};
        }
        //获取从产品列表得到产品数据开始
        function getProductListData() {
            $scope.moduleName = "组织范围";
            $scope.classify = "config";
            /*$scope.siteDesc = productListData.siteDesc;
            $scope.moduleName = productListData.moduleName;
            $scope.mediaType = productListData.mediaType;
            $scope.siteId = productListData.siteId;
            $scope.classify = productListData.CLASSIFY;
            delete $scope.rightClassify;
            selecetedChanls = {};*/
        }
        //获取从产品列表得到产品数据结束
        //取消选择树节点开始
        function cancelSelectedNode() {
            delete $scope.perSelectedNode;
        }
        //取消选择树节点结束
        //点击批量授权多选框
        $scope.batPermissionAssignment = function(node) {
            if (angular.isUndefined($scope.rightClassify)) {
                trsconfirm.alertType("请先选择要授权的节点", "", "warning", false);
                return;
            }
            if (angular.isDefined($scope.batSetGroupRightObjs[node.OBJID])) {
                delete $scope.batSetGroupRightObjs[node.OBJID];
                return;
            }
            $scope.batSetGroupRightObjs[$scope.authorSelectedNode.OBJID] = {
                ID: parseInt($scope.authorSelectedNode.RIGHTID),
                OPRTYPE: 203,
                OPRID: parseInt($scope.roleData.ROLEID),
                OBJTYPE: parseInt($scope.authorSelectedNode.OBJTYPE),
                OBJID: parseInt($scope.authorSelectedNode.OBJID),
                NEWVALUE: $scope.authorSelectedNode.RIGHTVALUE
            };
            permissionAssignmentService.initGroupRight(node, $scope.roleData.ROLEID).then(function(data) {
                $scope.batSetObj = {
                    ID: parseInt(data),
                    OPRTYPE: 203,
                    OPRID: parseInt($scope.roleData.ROLEID),
                    OBJTYPE: parseInt(node.OBJTYPE),
                    OBJID: parseInt(node.OBJID),
                    NEWVALUE: $scope.authorSelectedNode.RIGHTVALUE
                };
                updateBatPermissionAssignment();
                $scope.batSetGroupRightObjs[node.OBJID] = $scope.batSetObj;
            });
        };
        //批量授权单选框是否选中判断方法
        $scope.batPerAssCheckboxSelected = function(node) {
            return angular.isDefined($scope.batSetGroupRightObjs[node.OBJID]) ? true : false;
        };
        //监控授权操作给批量对象赋值
        $scope.$watch("authorSelectedNode.RIGHTVALUE", function(newValue, oldValue) {
            updateBatPermissionAssignment();
        });
        //监控授权操作给批量对象赋值
        //更新批量授权开始
        function updateBatPermissionAssignment() {
            for (var i in $scope.batSetGroupRightObjs) {
                $scope.batSetGroupRightObjs[i].NEWVALUE = $scope.authorSelectedNode.RIGHTVALUE;
            }
        }
        //设置是否向子传递权限
        $scope.setToChildren = function() {
            $scope.status.isToChildren = !$scope.status.isToChildren;
        };
    }]);
