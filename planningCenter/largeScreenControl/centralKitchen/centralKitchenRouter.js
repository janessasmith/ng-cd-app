//create by ma.rongqin 2016.9.1
"use strict";
angular.module("planLSCentralKitchenRouterModule", [])
    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state("plan.centralkitchen", {
            url: '/centralkitchen',
            views: {
                'main@plan': {
                    templateUrl: './planningCenter/largeScreenControl/centralKitchen/centralKitchen_tpl.html',
                    controller: 'planLSCentralKitchenCtrl'
                }
            }
        }).state("plan.centralkitchen.ipconfig", {
            url: '/ipconfig',
            views: {
                'main@plan.centralkitchen': {
                    templateUrl: './planningCenter/largeScreenControl/centralKitchen/ipConfig/ipConfig_tpl.html',
                    controller: 'planLSCentralKitchenIPCtrl'
                }
            }
        }).state("plan.centralkitchen.codeconfig", {
            url: '/codeconfig',
            views: {
                'main@plan.centralkitchen': {
                    templateUrl: './planningCenter/largeScreenControl/centralKitchen/codeConfig/codeConfig_tpl.html',
                    controller: 'planLSCentralKitchenCodeCtrl'
                }
            }
        }).state("plan.centralkitchen.mediaconfig", {
            url: '/mediaconfig',
            views: {
                'main@plan.centralkitchen': {
                    templateUrl: './planningCenter/largeScreenControl/centralKitchen/mediaConfig/mediaConfig_tpl.html',
                    controller: 'planLSCentralKitchenMediaCtrl'
                }
            }
        });
    }]);
