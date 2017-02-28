"use strict";
angular.module('editingCenterIWoModule', [
        'iWoLeftModule',
        "editingCenterIWoRouterModule",
        "iWoMyManuscriptModule",
        "iWoResourceModule",
        "myManuscriptService",
        "fusionPendingModule",
        "iWoFusionSignModule",
        "iWoPrivilegeDraftModule",
        "iWoDraftBoxModule",
        "iWoObjTimeModule",
        "videoModule",
        "iWoBtnServiceModule",
        "iWoPreveiwRouterModule",
        'iWoServiceModule',
        'iWoDepartmentModule'//新增部门稿库
    ])
    .controller('editingCenterIWoCtrl', ['$location','$state','$scope',function($location,$state,$scope) {
    }]);
