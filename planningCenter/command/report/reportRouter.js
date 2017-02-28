/**
 *  Module 报题汇总模块
 *  Author:wang.jiang 2016-3-8
 * Description
 */
"use strict";
angular.module('plan.reportRouterModule', ['planCenReportNewEventModule','dailyselectionNewsModule','dailyselectionNewTaskModule','repCreEventModule'])
    .config(['$stateProvider', function($stateProvider) {
        $stateProvider
            .state('plan.reportsummary', {
                url: '/reportsummary',
                views: {
                    'main@plan': {
                        templateUrl: './planningCenter/command/report/summary/main_tpl.html',
                        controller: 'reportsummaryCtrl'
                    },

                }
            })
            .state('plan.reportsummary.newevent', {
                url: '/newevent?reportId',
                views: {
                    'main@plan': {
                        templateUrl: './planningCenter/command/report/summary/newEvent/newEvent_tpl.html',
                        controller: 'planCenReportNewEventCtrl'
                    },
                }
            }).state('plan.settingTopic', {
                url: '/settingTopic',
                views: {
                    'main@plan': {
                        templateUrl: './planningCenter/command/report/summary/settingTopic_tpl.html',
                        controller: 'settingTopicCtrl'
                    },

                }
            }).state('plan.dailyselection', {
                url: '/dailyselection?date&topicId',
                views: {
                    'main@plan': {
                        templateUrl: './planningCenter/command/report/dailyselection/main_tpl.html',
                        controller: 'reportdailyselectCtrl'
                    },

                }
            }).state('plan.dailyselection.newtask', {
                url: '/newtask?reportId',
                views: {
                    'main@plan': { 
                        templateUrl: './planningCenter/command/report/dailyselection/newTask/newTask_tpl.html',
                        controller: 'dailyselectionNewTaskCtrl'
                    },

                }
            }).state('plan.dailyselection.newHotEvent', {
                url: '/newHotEvent?reportId&eventtype&createtype&eventid&sourcedate&sourceId',
                views: {
                    'main@plan': { 
                        templateUrl: './planningCenter/command/report/dailyselection/createEvent/createHotEvent_tpl.html',
                        controller: 'repCreEventController'
                    },

                }
            }).state('plan.dailyselection.connetEvent', {
                url: '/connetEvent?reportId&sourcedate&sourceId',
                views: {
                    'main@plan': { 
                        templateUrl: './planningCenter/command/report/dailyselection/createEvent/connetHotEvent_tpl.html',
                        controller: 'repConEventController'
                    },

                }
            }).state('dailyselectionnews', {
                url: '/dailyselectionnews?reportId&status&metadataid',
                views: {
                    '': {
                        templateUrl: './planningCenter/command/report/dailyselection/iwonews/dailyselectioniwonews.html',
                        controller: 'dailyselectionlNewsController'
                    },

                }
            });
    }]);