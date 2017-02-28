"use strict";
angular.module("largeScreenControlBroadcastRouterModule", [])
    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state("plan.broadcast", {
            url: '/broadcast',
            views: {
                'main@plan': {
                    templateUrl: './planningCenter/largeScreenControl/broadcast/broadcast_tpl.html',
                    controller: 'largeScreenControlBroadcastCtrl'
                }
            }
        });
    }]);