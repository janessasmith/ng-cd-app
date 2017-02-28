/**
 * Created by MRQ on 2016/1/7.
 */
"use strict";
angular.module('productManageMentAppSiteRouterModule', []).
    config(['$stateProvider', function($stateProvider) {
        $stateProvider.state("manageconfig.productmanage.app.site.recyclebin", {
            url: '/recyclebin',
            views: {
                'main@manageconfig.productmanage': {
                    templateUrl: './manageConfig/productManageMent/app/site/recycleBin/recycleBin_tpl.html',
                    controller: 'productManageMentAppSiteRecycleBinCtrl'
                }
            }
        });
    }]);
