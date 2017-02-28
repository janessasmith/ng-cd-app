/**
 * Created by MRQ on 2016/1/7.
 */
"use strict";
angular.module('productManageMentAppChannelRouterModule', []).
config(['$stateProvider', function($stateProvider) {
    $stateProvider
        .state("manageconfig.productmanage.app.channel.recyclebin", {
            url: '/recyclebin',
            views: {
                'main@manageconfig.productmanage.app': {
                    templateUrl: './manageConfig/productManageMent/app/channel/recycleBin/recycleBin_tpl.html',
                    controller: 'productManageMentAppChannelRecycleBinCtrl'
                }
            }
        });
}]);
