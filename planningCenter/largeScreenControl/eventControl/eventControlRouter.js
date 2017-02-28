"use strict";
angular.module("largeScreenControlEventControlRouterModule", [])
    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state("plan.eventcontrol", {
            url: '/eventcontrol',
            views: {
                'main@plan': {
                    templateUrl: './planningCenter/largeScreenControl/eventControl/eventControl_tpl.html',
                    controller: 'largeScreenControlEventControlCtrl'
                }
            }
        });
    }]);