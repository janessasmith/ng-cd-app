"use strict";
angular.module("largeScreenControlTopManagementRouterModule", [])
    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state("plan.topManagement", {
            url: '/topmanagement',
            views: {
                'main@plan': {
                    templateUrl: './planningCenter/largeScreenControl/topManagement/topManagement_tpl.html',
                    controller: 'largeScreenControlTopManagementCtrl'
                }
            }
        });
    }]);