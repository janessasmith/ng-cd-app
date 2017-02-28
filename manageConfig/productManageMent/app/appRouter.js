"use strict";
angular.module('productManageMentAppRouterModule', [
    'productManageMentAppSiteRouterModule',
    'productManageMentAppChannelModule',
    'productManageMentAppColumnModule'
]).
config(['$stateProvider', function($stateProvider) {
    $stateProvider.state("manageconfig.productmanage.app.site", {
            url: '/site',
            views: {
                'main@manageconfig.productmanage.app': {
                    templateUrl: './manageConfig/productManageMent/app/site/site_tpl.html',
                    controller: 'manageAppSiteController',
                }
            }
        })
        .state("manageconfig.productmanage.app.channel", {
            url: '/channel?selectTab',
            views: {
                'main@manageconfig.productmanage.app': {
                    templateUrl: './manageConfig/productManageMent/app/channel/channelMge_tpl.html',
                    controller: 'productManageMentAppChannelCtrl'
                },
                'footer@manageconfig.productmanage.app': {
                    templateUrl: './manageConfig/productManageMent/app/footRouter_tpl.html',
                    controller: 'proMgrAppfooterRouterCtrl',
                }
            }
        })
        .state("manageconfig.productmanage.app.column", {
            url: '/column?channel&selectTab&parentchnl',
            views: {
                'main@manageconfig.productmanage.app': {
                    templateUrl: './manageConfig/productManageMent/app/column/columnMge_tpl.html',
                    controller: 'productManageMentAppColumnCtrl'
                },
                'footer@manageconfig.productmanage.app': {
                    templateUrl: './manageConfig/productManageMent/app/footRouter_tpl.html',
                    controller: 'proMgrAppfooterRouterCtrl',
                }
            }
        })
        .state("manageconfig.productmanage.app.template", {
            url: '/template?channel&selectTab&parentchnl',
            views: {
                'main@manageconfig.productmanage.app': {
                    templateUrl: './manageConfig/productManageMent/app/template/templateMge_tpl.html',
                    controller: 'productManageMentAppTemplateCtrl'
                },
                'footer@manageconfig.productmanage.app': {
                    templateUrl: './manageConfig/productManageMent/app/footRouter_tpl.html',
                    controller: 'proMgrAppfooterRouterCtrl',
                }
            }
        });
}]);
