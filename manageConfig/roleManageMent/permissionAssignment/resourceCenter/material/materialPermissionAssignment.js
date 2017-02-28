"use strict";
/**
 * created By cc 2016-12-06 素材库权限设置
 */
angular.module("materialPermissionAssignmentModule", []).
controller('materialPermissionAssignmentCtrl', ['$scope', '$q', '$state', '$modal', '$timeout', 'trsHttpService', 'localStorageService', 'trsconfirm', 'permissionAssignmentService',
    function($scope, $q, $state, $modal, $timeout, trsHttpService, localStorageService, trsconfirm, permissionAssignmentService) {
        initStatus();
        initData();
        var selecetedChanls = {}; //声明要保存的权限数组
        function initStatus() {
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
                    return node.HASCHILDREN === "false" || !node.HASCHILDREN;
                },
                dirSelectable: true,
                allowDeselect: false,
            };
        }

        function initData() {
            getProductListData();
            loadPerTemplate().then(function() {
                $scope.selectTemplate = $scope.templateList[0];
                $scope.ifSelected = false;
            }); //获得权限模板
        }
        /**
         * [getProductListData description]从缓存中中捞出数据
         * @return {[type]} [description]
         */
        function getProductListData() {
            var productListData = localStorageService.get("setResourceCenterPermission");
            $scope.siteDesc = productListData.MATERIALTYPENAME; //素材名称
            $scope.moduleName = productListData.moduleName;
            $scope.mediaType = productListData.mediaType;
            $scope.materialtypeid = productListData.MATERIALTYPEID; //素材ID
            $scope.classify = productListData.CLASSIFY;
            getMateriaTree($scope.materialtypeid, $scope.roleData.ROLEID);
        }
        /**
         * [getMateriaTree description]获得素材库分类下的树
         * @param  {[num]} materialTypeId  [description]分类ID
         * @param  {[num]} roleId          [description]角色ID
         * @return {[type]}                [description]
         */
        function getMateriaTree(materialTypeId, roleId) {
            var deffered = $q.defer();
            var params = {
                "serviceid": "nb_managerconfig",
                "methodname": "getMaterialWithRightStair",
                "MaterialTypeId": materialTypeId,
                "RoleId": roleId
            };
            $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function(data) {
                $scope.channelTree = [data];
                $scope.cTshowSelected($scope.channelTree[0]);
                deffered.resolve(data);
            });
            return deffered.promise;
        }
        /**
         * [queryRightClassify description]获取权限列表
         * @param  {[str]} classify  [description]分类
         * @param  {[obj]} node      [description]节点
         * @return {[type]}          [description]
         */
        function queryRightClassify(classify, node) {
            var params = {
                "serviceid": "mlf_extrole",
                "methodname": "queryRightClassify",
                "Classify": classify
            };
            $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(
                function(data) {
                    if ($scope.authorSelectedNode) {
                        $scope.rightClassify = data;
                        $scope.initSelectAll();
                    }
                }
            );
        }
        $scope.cTshowSelected = function(sel) {
            permissionAssignmentService.initGroupRight(sel, $scope.roleData.ROLEID).then(function(data) {
                sel.RIGHTID = data; //data;
                $scope.authorSelectedNode = sel;
                delete $scope.rightClassify;
                //模板选项恢复默认开始
                if (angular.isDefined($scope.templateList)) $scope.selectTemplate = $scope.templateList[0];
                //模板选项恢复默认结束
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
                queryRightClassify('material', sel);
            });

        };
        /**
         * [initSelectAll description]全选树
         * @return {[type]} [description]
         */
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
        /**
         * [getNodeDesc description]处理节点名称，用于应对不同模块类型节点名称显示
         * @param  {[obj]} node  [description]节点信息
         * @return {[type]}      [description]
         */
        $scope.getNodeDesc = function(node) {
            return node.MATERIALTYPENAME;
            // return angular.isDefined(node.MODALDESC) ? node.MODALDESC : (angular.isDefined(node.SITEDESC) ? node.SITEDESC : node.CHNLDESC);
        };
        /**
         * [productAndModule description]打开权限分配模板
         * @return {[type]} [description]
         */
        $scope.productAndModule = function() {
            var productAndModule = $modal.open({
                templateUrl: "./manageConfig/roleManageMent/permissionAssignment/service/productAndModule/productAndModule_tpl.html",
                scope: $scope,
                windowClass: 'manage-authorityAssignment',
                backdrop: false,
                controller: "productAndModuleCtrl"
            });
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
        $scope.ifSelect = function() {
            $scope.ifSelected = !$scope.ifSelected ? true : false;
        };
        /**
         * [loadPerTemplate description]获取权限模板
         * @return {[type]} [description]
         */
        function loadPerTemplate() {
            var deffered = $q.defer();
            var paramsTemp = {
                "serviceid": "mlf_righttemplate",
                "methodname": "queryRightTemplate",
            };
            $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), paramsTemp, "get").then(function(data) {
                $scope.templateList = data;
                $scope.templateList.splice(0, 0, {
                    "RIGHTTEMPLATENAME": "原子权限模板"
                });
                deffered.resolve(data);
            });
            return deffered.promise;
        }
        /**
         * [selectTemplateFn description]选择模板
         * @param  {[num]} index  [description]数组下标
         * @return {[type]}       [description]
         */
        $scope.selectTemplateFn = function(index) {
            if (!$scope.authorSelectedNode) {
                trsconfirm.alertType('提示信息', '前选择栏目', "warning", true);
                $scope.ifSelected = false;
                return;
            }
            $scope.selectTemplate = $scope.templateList[index];
            if (!angular.isArray($scope.selectTemplate.NEWVALUE) && $scope.selectTemplate.NEWVALUE !== undefined) {
                $scope.authorSelectedNode.RIGHTVALUE = $scope.selectTemplate.NEWVALUE.split("");
                $scope.authorSelectedNode.HASSED = $scope.authorSelectedNode.RIGHTVALUE.indexOf("1") > -1 ? true : false;
                var tempObj = {
                    "ID": parseInt($scope.authorSelectedNode.RIGHTID),
                    "OPRTYPE": 203,
                    "OPRID": parseInt($scope.roleData.ROLEID),
                    "OBJTYPE": parseInt($scope.authorSelectedNode.OBJTYPE),
                    "OBJID": parseInt($scope.authorSelectedNode.OBJID),
                    "NEWVALUE": $scope.authorSelectedNode.RIGHTVALUE
                };
                selecetedChanls[$scope.authorSelectedNode.OBJID] = tempObj;
                $scope.initSelectAll(); //全选按钮初始化
            }
            $scope.ifSelected = false;
        };
        //选择模板结束
        /**
         * [deleteTemplate description]删除模板
         * @param  {[num]} index  [description]要删除的模板下标
         * @return {[type]}       [description]
         */
        $scope.deleteTemplate = function(index) {
            var params = {
                "serviceid": "mlf_righttemplate",
                "methodname": "deleteRightTemplate",
                "tempId": $scope.templateList[index].RIGHTTEMPLATEID
            };
            trsconfirm.alertType("你确定删除模板" + $scope.templateList[index].RIGHTTEMPLATENAME + "么？", '', "info", true, function() {
                $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function(data) {
                    $scope.templateList.splice(index, 1);
                    $scope.ifSelected = false;
                });
            });
        };
        /**
         * [SavePermissions description]保存权限模板
         */
        $scope.SavePermissions = function() {
            var savePermissions = $modal.open({
                templateUrl: "./manageConfig/roleManageMent/permissionAssignment/service/SavePerModule/SavePerModule.html",
                scope: $scope,
                windowClass: 'manageSavePerTemp',
                backdrop: false,
                controller: "SavePerModuleController"
            });
        };
        /**
         * [save description]
         * @return {[type]} [description]
         */
        $scope.save = function() {
            var i = 0,
                postRights = [];
            // concatPermission();
            for (var key in selecetedChanls) {
                postRights.push(angular.copy(selecetedChanls[key]));
                postRights[i].NEWVALUE = angular.isArray(postRights[i].NEWVALUE) ? postRights[i].NEWVALUE.join("") : postRights[i].NEWVALUE;
                i++;
            }
            var postRightsString = JSON.stringify(postRights);
            var params = {
                "serviceid": "mlf_extrole",
                "methodname": "saveRight",
                "RoleId": $scope.roleData.ROLEID,
                "IsSynchronize": "false",
                "rights": postRightsString
            };
            if (postRights.length === 0) {
                trsconfirm.alertType("您尚未设置权限", "您尚未设置权限", "error", false);
                return;
            }
            $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "post").then(function(data) {
                trsconfirm.alertType("保存权限成功", "", "success", false);
                $scope.batSetChanls = {};
                delete $scope.authorSelectedNode;
                delete $scope.rightClassify;
                getMateriaTree($scope.materialtypeid, $scope.roleData.ROLEID);
            });
        };
    }
]);
