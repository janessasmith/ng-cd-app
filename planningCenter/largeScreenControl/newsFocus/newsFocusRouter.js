"use strict";
angular.module("largeScreenControlNewsFocusRouterModule", [])
    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state("plan.newsfocus", {
            url: '/newsfocus?returnfieldid',
            views: {
                'main@plan': {
                    templateUrl: './planningCenter/largeScreenControl/newsFocus/newsFocus_tpl.html',
                    controller: 'largeScreenControlNewsFocusCtrl'
                }
            }
        }).state("plan.newsfocus.newsfocusclick", {
            url: '/newsfocusclick?fieldid&hotspotids&selectedid&currfield&currfieldname',
            views: {
                'main@plan': {
                    templateUrl: './planningCenter/largeScreenControl/newsFocus/newsFocusclick/newsFocusclick_tpl.html',
                    controller: 'largeScreenCtrlNewsFocusClickCtrl'
                }
            }
        });
    }]);
