"use strict";
/**
 * eventManagementModuleRouter Module
 *
 * Description 创建事件路由
 * Author:fanglijuan 2016-7-8
 */
angular.module('eventManagementModuleRouter', [])
    .config(['$stateProvider', function($stateProvider) {
        $stateProvider
            .state("plan.eventanalysis.createHotEvent", {
                url: '/createHotEvent?eventtype&createtype&eventid',
                views: {
                    'main@plan': {
                        templateUrl: './planningCenter/selectedTopicEvent/eventAnalysis/eventManagement/createEvent/createHotEvent_tpl.html',
                        controller: 'createHotEventController',
                    }
                }
            });
    }]);
