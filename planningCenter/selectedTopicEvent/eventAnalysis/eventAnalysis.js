"use strict";
/*
author:bai.zhiming
date:2016-07-04
 */
angular.module("eventAnalysisModule", [
        "eventAnalysisRouterModule",
        'planEventAnalyisBasicInfoDetailModule',
        'planEventAnalyisEventTapDetailModule',
        'planEventAnalyisEventTracksDetailModule',
        'planEventDetailServiceModule',
        'eventManagermentModule',
        'personalEventsModule',
        'applyManagermentModule',
        'hotEventsModule',
        'eventAnalysisNavModule',
    ])
    .controller("eventAnalysisCtrl", ["$scope", "$location", function($scope, $location) {
        /*initStatus();
        initData();

        function initStatus() {
            $scope.currEventAnalysisModule = $location.path().split("/").pop();
            console.log($scope.currEventAnalysisModule);
            $scope.eventAnalysisNavTab = {
                'hotevents': false,
                'personalevents': false,
                'applymanagement': false,
                'eventmanagement': false
            };
            $scope.eventAnalysisNavTab[$scope.currEventAnalysisModule] = true;
        }

        function initData() {}*/
    }]);
