"use strict";
angular.module("departmentManageMentRouterModule", ['departmentManageMentLeftModule', 'departmentListManageMentModule'])
    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state("manageconfig.department", {
            url: '/department',
            views: {
                'main@manageconfig': {
                    templateUrl: './manageConfig/departmentManageMent/main_tpl.html',
                    controller: 'departmentManageMentController'
                },
                'header@manageconfig': {
                    templateUrl: './manageConfig/header_tpl.html',
                    controller: "manageConfigHeaderCtrl"
                },
                'left@manageconfig.department': {
                    templateUrl: './manageConfig/departmentManageMent/left_tpl.html',
                    controller: 'departmentManageMentLeftCtrl',
                },
                // 'right@manageconfig.department': {
                //     templateUrl: './manageConfig/departmentManageMent/right_tpl.html',
                //     controller: 'departmentListManageMentController',
                // },
            }
        }).state("manageconfig.department.list", {
            url: '/list?departmentid',
            views: {
                'right@manageconfig.department': {
                    templateUrl: './manageConfig/departmentManageMent/right_tpl.html',
                    controller: 'departmentListManageMentController',
                },
            }
        });
    }]);
