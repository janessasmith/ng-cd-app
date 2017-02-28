/*
    Create By CC 2016-11-11
    部门稿库相关服务
*/
'use strict';
angular.module("departmentManageMentServiceModule", ["deparmentCreatePartModule", "departmentPressRankModule"])
    .factory("departmentService", ["$modal", "$q", '$state', 'trsHttpService', function($modal, $q, $state, trsHttpService) {
        /**
         * [getBtnRights description]根据权限名称归类权限对象
         * @param  {[type]} params [description]各渠道权限请求参数
         * @return {[obj]}        [description]处理过的权限对象集合
         */
        function getBtnRights(params) {
            var defferd = $q.defer();
            var btnRights = {};
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function(data) {
                angular.forEach(data, function(value, key) {
                    btnRights[value.OPERNAME] = value;
                });
                defferd.resolve(btnRights);
            });
            return defferd.promise;
        }
        return {
            //新建or编辑部门
            createOrEditDepartment: function(department) {
                var defer = $q.defer();
                var modalInstance = $modal.open({
                    templateUrl: "./manageConfig/departmentManageMent/service/createDepartment/createDepartmen_tpl.html",
                    windowClass: 'userManageMent-createUser-window',
                    backdrop: false,
                    controller: "deparmentCreatePartCtrl",
                    resolve: {
                        department: function() {
                            return department;
                        }
                    }
                });
                modalInstance.result.then(function(result) {
                    defer.resolve();
                }, function() {
                    defer.reject();
                });
                return defer.promise;
            },
            /**
             * [pressRank description]部门排序
             * @param  {[array]} departments [description]所有部门信息
             * @return {[type]}              [description]
             */
            pressRank: function(departments) {
                var defer = $q.defer();
                var modalInstance = $modal.open({
                    templateUrl: "./manageConfig/departmentManageMent/service/pressRank/pressRank_tpl.html",
                    windowClass: 'man_produ_NewOrder',
                    backdrop: false,
                    controller: "departmentPressRanCtrl",
                    resolve: {
                        departments: function() {
                            return departments;
                        }
                    }
                });
                modalInstance.result.then(function(result) {
                    defer.resolve();
                }, function() {
                    defer.reject();
                });
                return defer.promise;
            },
            /**
             * [getBtnRights description]获得管理配置部门稿库权限
             * @return {[type]} [description]
             */
            getBtnRights: function() {
                var defferd = $q.defer();
                var params = {
                    serviceid: "nb_managerconfig",
                    methodname: "findDepartmentConfigRight",
                    DepartmentId: $state.params.departmentid
                };
                getBtnRights(params).then(function(rights) {
                    defferd.resolve(rights);
                });
                return defferd.promise;
            }
        };
    }]);
