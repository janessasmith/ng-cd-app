"use strict";
angular.module("largeScreenControlBroadcastPreviewRouterModule", [])
    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state("plan.broadcastPreview", {
            url: '/plan.broadcastpreview',
            views: {
                'main@plan': {
                    templateUrl: './planningCenter/largeScreenControl/broadcastPreview/broadcastPreview_tpl.html',
                    controller: 'largeScreenControlBroadcastPreviewCtrl'
                }
            }
        });
    }]);