/*create by ma.rongqin 2016.12.6*/
"use strict";
angular.module('manageSysManageTypeMgrRouterModule', []).
config(['$stateProvider', function($stateProvider) {
    $stateProvider.state("manageconfig.sysmanage.typemgr.categorymgr", { //稿件类别管理
        url: '/categorymgr?sharecategoryid&categoryname',
        views: {
            'main@manageconfig.sysmanage': {
                templateUrl: './manageConfig/sysManageMent/typeMgr/categoryMgr/categoryMgr_tpl.html',
                controller: 'manageSysManageCategoryMgrCtrl'
            }
        }
    });
}]);
