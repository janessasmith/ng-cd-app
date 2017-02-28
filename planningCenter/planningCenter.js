"use strict";
angular.module('planningCenterModule', [
    'planningCenterRouterModule',
    'PlanCueSelectedTopicModule',
    'planningCenterLeftModule',
    "planningCenterEventAnalyseModule",
    'initCueMonitorMoreServiceModule',
    'plan.reportRouterModule',
    'trsPagenationWithPageCountModule',
    'plancenterServiceModule',
    'planCtrModalModule',
    'reportsummaryModule',
    'reportdailyselectModule',
    'planDetailRouterModule',
    'taskRouterModule',
    'taskAssignmentModule',
    'infoAssignmentModule',
	'selectedTopicEventModule',	
    'planCenCommandAppointTaskModule',
    'planCenCommandTaskViewModule',
    'planCenCommandTaskClueModule',
    'largeScreenControlModule',
    ]).controller('planningCenterController', ["$scope",'$state', function($scope,$state) {
 //$state.go("plan.cuemonitor");
    initStatus();
    function initStatus(){
        $scope.initStatus = {
        };
    }
}]);
