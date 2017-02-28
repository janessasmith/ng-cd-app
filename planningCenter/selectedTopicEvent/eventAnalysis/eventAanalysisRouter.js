"use strict";
/*
author:bai.zhiming
date:2016-07-04
 */
angular.module("eventAnalysisRouterModule", [])
    .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
        $stateProvider.state("plan.eventanalysis.applymanagement", {
            url: '/applymanagement',
            views: {
                'main@plan.eventanalysis': {
                    templateUrl: './planningCenter/selectedTopicEvent/eventAnalysis/applyManagement/applyManagement_tpl.html',
                    controller: 'applyManagermentController',
                },
                'nav@plan.eventanalysis': {
                    templateUrl: './planningCenter/selectedTopicEvent/eventAnalysis/eventAnalysisNav_tpl.html',
                    controller: 'eventAnalysisNavController',
                }
            }
        }).state("plan.eventanalysis.eventmanagement", {
            url: '/eventmanagement',
            views: {
                'main@plan.eventanalysis': {
                    templateUrl: './planningCenter/selectedTopicEvent/eventAnalysis/eventManagement/eventManagement_tpl.html',
                    controller: 'eventManagermentController',
                },
                'nav@plan.eventanalysis': {
                    templateUrl: './planningCenter/selectedTopicEvent/eventAnalysis/eventAnalysisNav_tpl.html',
                    controller: 'eventAnalysisNavController',
                }
            }
        }).state("plan.eventanalysis.hotevents", {
            url: '/hotevents',
            views: {
                'main@plan.eventanalysis': {
                    templateUrl: './planningCenter/selectedTopicEvent/eventAnalysis/hotEvents/hotEvents_tpl.html',
                    controller: 'hotEventsController',
                },
                'nav@plan.eventanalysis': {
                    templateUrl: './planningCenter/selectedTopicEvent/eventAnalysis/eventAnalysisNav_tpl.html',
                    controller: 'eventAnalysisNavController',
                }
            }
        }).state("plan.eventanalysis.personalevents", {
            url: '/personalevents',
            views: {
                'main@plan.eventanalysis': {
                    templateUrl: './planningCenter/selectedTopicEvent/eventAnalysis/personalEvents/personalEvents_tpl.html',
                    controller: 'personalEventsController',
                },
                'nav@plan.eventanalysis': {
                    templateUrl: './planningCenter/selectedTopicEvent/eventAnalysis/eventAnalysisNav_tpl.html',
                    controller: 'eventAnalysisNavController',
                }
            }
        }).state("eventdetail", {
            url: '/eventdetail',
            views: {
                '': {
                    templateUrl: './planningCenter/selectedTopicEvent/eventAnalysis/detail/index_tpl.html',
                }
            }
        }).state("eventdetail.eventanalyisbasicinfo", {
            url: '/eventanalyisbasicinfo?eventid&eventtype',
            views: {
                'head': {
                    templateUrl: './header_tpl.html',
                    controller: 'HeaderController'
                },
                'main': {
                    templateUrl: './planningCenter/selectedTopicEvent/eventAnalysis/detail/basicInfo/basicInfo_tpl.html',
                    controller: 'planEventAnalyisBasicInfoDetailCtrl',
                }
            }
        }).state("eventdetail.eventanalyiseventtracks", {
            url: '/eventanalyiseventtracks?eventid&eventtype',
            views: {
                'head': {
                    templateUrl: './header_tpl.html',
                    controller: 'HeaderController'
                },
                'main': {
                    templateUrl: './planningCenter/selectedTopicEvent/eventAnalysis/detail/eventTracks/eventTracks_tpl.html',
                    controller: 'planEventAnalyisEventTracksDetailCtrl',
                }
            }
        }).state("eventdetail.eventanalyiseventtap", {
            url: '/eventanalyiseventtap?eventid&eventtype',
            views: {
                'head': {
                    templateUrl: './header_tpl.html',
                    controller: 'HeaderController'
                },
                'main': {
                    templateUrl: './planningCenter/selectedTopicEvent/eventAnalysis/detail/eventTap/eventTap_tpl.html',
                    controller: 'planEventAnalyisEventTapDetailCtrl',
                }
            }
        });
    }]);
