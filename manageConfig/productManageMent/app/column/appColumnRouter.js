/**
 * Created by MRQ on 2016/1/7.
 */
"use strict";
angular.module('productManageMentAppColumnRouterModule', []).
    config(['$stateProvider', function($stateProvider) {
        $stateProvider.state("manageconfig.productmanage.app.column.recyclebin", {
            url: '/recyclebin',
            views: {
                'main@manageconfig.productmanage.app': {
                    templateUrl: './manageConfig/productManageMent/app/column/recycleBin/recycleBin_tpl.html',
                    controller: 'productManageMentAppColumnRecycleBinCtrl'
                }
            }
        });
    }]);
