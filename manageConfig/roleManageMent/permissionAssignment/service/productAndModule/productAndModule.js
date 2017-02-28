/*
    Create By BaiZhiming 2015-10-19
*/
'use strict';
angular.module("manageCfg.roleManageMent.permissionAssignment.productAndModule", []).
controller("productAndModuleCtrl", ["$scope", "$q", "$rootScope", "$modal", "$http", "$timeout", "$state", "localStorageService", "trsHttpService", "SweetAlert", "trsSelectItemByTreeService", "trsconfirm", "permissionService",
    function($scope, $q, $rootScope, $modal, $http, $timeout, $state, localStorageService, trsHttpService, SweetAlert, trsSelectItemByTreeService, trsconfirm, permissionService) {
        initStatus();
        initData();
        $scope.selectPMTab = function(module, moduleName) {
            $scope.status.selectedModule = module;
            $scope.status.moduleName = moduleName;
            switch ($scope.status.selectedModule) {
                case 'planningCenter':
                    if (!angular.isDefined($scope.data.plCenterMedias)) {
                        getPlanningCenterProduct();
                    }
                    break;
                case 'editingCenter':
                    if (!angular.isDefined($scope.data.medias)) {
                        getEditingCenterProduct();
                    }
                    break;
                case 'resourceCenter':
                    getResouceCenterProduct();
                    break;
                case 'visualCenter':
                    break;
                case 'operationCenter':
                    break;
                case 'manageConfig':
                    getManageConfigList();
                    break;
            }
        };
        //选择模块方法开始
        $scope.chooseModule = function(module) {
            $state.go("manageconfig.rolemanage.permissionassignment." + module.TYPE, "", { reload: "manageconfig.rolemanage.permissionassignment." + module.TYPE });
        };
        //资源中心选择模块开始
        $scope.resChooseModule = function(module) {
            $state.go("manageconfig.rolemanage.permissionassignment." + module.key, "", { reload: "manageconfig.rolemanage.permissionassignment." + module.key });
        };
        //选择模块方法结束
        /**
         * [setEditingCenterPermission description]进入采编中心授权界面
         * @param {[obj]} node   [description]节点信息
         * @param {[obj]} media  [description]渠道信息
         */
        $scope.setEditingCenterPermission = function(node, media) {
            localStorageService.set("setEditingCenterPermission", {
                "siteId": node.SITEID,
                "siteDesc": node.SITEDESC || node.DEPARTMENTNAME,
                "moduleName": $scope.status.moduleName,
                "mediaType": media.MEDIATYPE,
                "CLASSIFY": media.CLASSIFY,
                "channelId": node.CHANNELID,
                "accountId": node.ACCOUNTID, //微博ID
                "departmentId": node.DEPARTMENTID //部门ID
            });
            var url = "manageconfig.rolemanage.permissionassignment." + media.CLASSIFY;
            $state.go(url, '', { reload: url });
            $scope.$close();
        };
        //采编中心站点选择结束
        //采编中心IWO站点选择开始
        $scope.setIwoPermission = function(media) {
            if (media.CLASSIFY === "iwo") {
                localStorageService.set("setEditingCenterPermission", media);
                $scope.$emit("switchSite", "");
                //同路径下切换通知开始
                $timeout(function() {
                    $state.go("manageconfig.rolemanage.permissionassignment.iwo", '', { reload: "manageconfig.rolemanage.permissionassignment.iwo" });
                    $scope.$close();
                }, 500);
                //同路径下切换通知结束
            }
        };
        //采编中心IWO站点选择结束
        $scope.cancel = function() {
            $scope.$close();
        };
        //协同指挥赋权
        $scope.selectPlCenterNode = function(node, index, media) {
            $rootScope.plCenterRight = { chooseNode: node, treeData: $scope.data.plCenterMedias, treeIndex: index, media: media };
            $state.go("manageconfig.rolemanage.permissionassignment.plCCommand", "", { reload: "manageconfig.rolemanage.permissionassignment.plCCommand" });
            $scope.$close();
        };
        //特权取稿
        $scope.privilegedAccess = function() {
            trsSelectItemByTreeService.getDeptAndUser($scope.roleData.ROLEID, function(data) {
                data.serviceid = "mlf_extrole";
                data.methodname = "setPrivilegeRange";
                data.RoleId = $scope.roleData.ROLEID;
                trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), data, "get").then(function(data) {
                    trsconfirm.alertType("保存成功", "", "success", false, function() {});
                });
            });
        };

        function initStatus() {
            $scope.data = {
                "resourceCenter": [{
                    moduleName: '资源中心',
                    key: 'resourcecenter'
                }],
                materials: "", //素材库
            };
            $scope.status = {
                selectedModule: 'planningCenter'
            };
            permissionService.isAdministrator().then(function(data) {
                $scope.status.isSystemUser = data;
            });
        }
        //获取管理配置列表
        function getManageConfigList() {
            var params = {
                serviceid: "mlf_metadataright",
                methodname: "queryTypesOfConfigmodule",
            };
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function(data) {
                $scope.data.manageConfig = data;
            });
        }

        function initData() {
            getPlanningCenterProduct();
        }
        /**
         * [getEditingCenterProduct description]获得采编中心的产品列表
         * @return {[type]} [description]
         */
        function getEditingCenterProduct() {
            var defferd = $q.defer();
            var params = {
                serviceid: "nb_managerconfig",
                methodname: "queryCaiBianCenterConfig",
                RoleId: $scope.roleData.ROLEID
            };
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function(data) {
                $scope.data.medias = data;
                defferd.resolve(data);
            });
            return defferd.promise;
        }
        //获取采编中心产品列表结束
        /**
         * [getDepartmentList description]获得单位列表
         * @return {[type]} [description]
         */
        function getDepartmentList() {
            var params = {
                serviceid: "nb_department",
                methodname: "queryDepartmentWithSecondRight",
                "RoleId": $scope.roleData.ROLEID
            };
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function(data) {
                $scope.data.medias.splice(1, 0, data);
            });
        }
        //获取策划中心产品列表
        function getPlanningCenterProduct() {
            var params = {
                "serviceid": "mlf_extrole",
                "methodname": "queryPlanMediaProduct",
                "RoleId": $scope.roleData.ROLEID
            };
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function(data) {
                $scope.data.plCenterMedias = data;
            });
            /*$scope.data.plCenterMedias = [{
                MEDIANAME: "指挥中心"
            }];*/
        }
        //获取资源中心权限列表
        /**
         * [selectPlCenterRootNode description]点击策划中心根节点来设置授权
         * @param  {[obj]} media [description]媒体类型
         * @return {[type]}            [description]
         */
        $scope.selectPlCenterRootNode = function(media) {
            if (media.CLASSIFY === "daping") {
                $rootScope.plCenterRight = { treeData: $scope.data.plCenterMedias[1] };
                $state.go("manageconfig.rolemanage.permissionassignment.plCLargeScreen", "", { reload: "manageconfig.rolemanage.permissionassignment.plCCommand" });
                $scope.$close();
            }
        };
        /**
         * [getResouceCenterProduct description]获得资源中心产品列表（这里是素材库）
         * @return {[type]} [description]
         */
        function getResouceCenterProduct() {
            var params = {
                serviceid: "nb_managerconfig",
                methodname: "getMaterialAllStair",
                RoleId: $scope.roleData.ROLEID
            };
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function(data) {
                $scope.data.materials = data;
            });
        }
        /**
         * [setEditingCenterPermission description]进入资源中心授权界面
         * @param {[obj]} node   [description]节点信息
         * @param {[obj]} media  [description]渠道信息
         */
        $scope.setResourceCenterPermission = function(node, media) {
            localStorageService.set("setResourceCenterPermission", {
                "MATERIALTYPEID": node.MATERIALTYPEID,
                "MATERIALTYPENAME": node.MATERIALTYPENAME,
                "moduleName": media.MEDIANAME,
                "mediaType": media.MEDIATYPE,
                "CLASSIFY": media.CLASSIFY,
            });
            var url = "manageconfig.rolemanage.permissionassignment." + media.CLASSIFY;
            $state.go(url, '', { reload: url });
            $scope.$close();
        };
    }
]);
