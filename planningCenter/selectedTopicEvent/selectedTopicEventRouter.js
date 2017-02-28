"use strict";
/*
author:bai.zhiming
date:2016-07-04
 */
angular.module("selectedTopicEventRouterModule", [])
    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state("plan.eventanalysis", {
            url: '/eventanalysis',
            views: {
                'main@plan': {
                    templateUrl: './planningCenter/selectedTopicEvent/eventAnalysis/main_tpl.html',
                    controller: 'eventAnalysisCtrl'
                }
            }
        });
    }]);
