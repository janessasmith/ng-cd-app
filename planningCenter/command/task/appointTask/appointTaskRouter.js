/*create by ma.rongqin 2016.6.27*/
"use strict";
angular.module('planCenCommandAppointTaskRouterModule', [])
    .config(['$stateProvider', function($stateProvider) {
        $stateProvider
            .state('plan.appointtask.newtask', {
                url: '/newtask?userid&username&taskid&reportid',
                views: {
                    'main@plan': {
                        templateUrl: './planningCenter/command/task/appointTask/newTask/newTask_tpl.html',
                        controller: 'planCenCommandAppointNewTaskCtrl'
                    },
                }
            })
            .state('plan.appointtask.newevent', {
                url: '/newevent',
                views: {
                    'main@plan': {
                        templateUrl: './planningCenter/command/task/appointTask/newEvent/newEvent_tpl.html',
                        controller: 'planCenCommandAppointNewEventCtrl'
                    },
                }
            })
            .state('plantaskdetail', {
                url: '/plantaskdetai?taskid&detailType&showmaterials&taskuserid&reportid',
                views: {
                    '': {
                        templateUrl: './planningCenter/command/task/appointTask/taskDetail/taskDetail_tpl.html',
                        controller: 'planCenCommandAppointTaskDetailCtrl'
                    },
                }
            });
    }]);
