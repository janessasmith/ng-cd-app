"use strict";
/**
 * created By cc 16-11-04 部门稿库路由
 */
angular.module('iWoDepartmentRouterModule', [])
    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('editctr.iWo.department', {
                url: "/department?departmentid?parentid",
                views: {
                    "main@editctr": {
                        templateUrl: "./editingCenter/iWo/department/department_tpl.html",
                        controller: "iWoDepartmentCtrl"
                    }
                }
            });
    }]);
