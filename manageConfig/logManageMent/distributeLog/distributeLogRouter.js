/**
 *  logManageMentModule
 *
 * Description  管理配置 日志管理 操作日志 
 * rebuild:ma.rongqin 2016-4-20
 */

'use strict';
angular.module("logManageMentDistributeLogRouterModule", [])
    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.
        state("manageconfig.logmanage.distributeLog", {
            url: '/distributeLog',
            views: {
                'main@manageconfig.logmanage': {
                    templateUrl: './manageConfig/logManageMent/distributeLog/distributeLog_tpl.html',
                    controller: 'logManageMentDistributeLogCtrl',
                },
                'footer@manageconfig.logmanage': {
                    templateUrl: './footer_tpl.html'
                }
            }
        });
    }]);
