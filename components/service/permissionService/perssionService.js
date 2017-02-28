/*
    create by BaiZhiming 2016-2-24
*/
//权限公共服务
"use strict";
angular.module("permissionServiceModule", [])
    .factory("permissionService", ["$q", "trsHttpService", "globleParamsSet", function($q, trsHttpService, globleParamsSet) {
        return {
            //当前用户是否是管理员
            isAdministrator: function() {
                var deffer = $q.defer();
                var flag = false;
                var params = {
                    serviceid: "mlf_extuser",
                    methodname: "isAdministrator"
                };
                trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "post")
                    .then(function(data) {
                        deffer.resolve(data.ISADMINISTRATOR === "true" ? true : false);
                    });
                return deffer.promise;
            },
            //管理配置-产品管理-网站人口权限
            getPermissionData: function() {
                var deffer = $q.defer();
                var params = {
                    serviceid: "mlf_metadataright",
                    methodname: "queryCanOperOfConfiguration",
                    Classify: "configmodule"
                };
                trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "post")
                    .then(function(data) {
                        deffer.resolve(globleParamsSet.handlePermissionData(data));
                    });
                return deffer.promise;
            }
        };
    }]);
