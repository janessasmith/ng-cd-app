"use strict";
angular.module('editingCenterIWoRouterModule', [
        "iWoFusionSignRouterModule",
        "iWoPrivilegeDraftRouterModule",
        "iWoFusionPendingRouterModule",
        "iWoDraftBoxRouterModule",
        "iWoDepartmentRouterModule"//部门稿库路由
    ])
    .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
        $stateProvider.state('editctr.iWo', {
            url: '/iWo',
            views: {
                "iwo@editctr": {
                    templateUrl: './editingCenter/iWo/left_tpl.html',
                    controller: 'iWoLeftCtrl'
                }
            }
        });
    }]);
