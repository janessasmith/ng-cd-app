"use strict";
/**
 *  eventAnalysisNavModule Module
 *
 * Description 策划中心 选题事件 事件分析nav切换
 * rebuild: fanglijuan 2016-7-8
 */
angular.module('eventAnalysisNavModule', [])
    .controller('eventAnalysisNavController', ["$scope", "$location", "trsHttpService", function($scope, $location, trsHttpService) {
        initStatus();
        initData();

        function initStatus() {
            $scope.currEventAnalysisModule = $location.path().split("/").pop();
            $scope.eventAnalysisNavTab = {
                'hotevents': false,
                'personalevents': false,
                'applymanagement': false,
                'eventmanagement': false
            };
            $scope.eventAnalysisNavTab[$scope.currEventAnalysisModule] = true;
            $scope.tagRights = {};
        }

        function initData() {
            getTagRight();
        }
        //标签的权限
        function getTagRight() {
            var params = {
                serviceid: 'mlf_metadataright',
                methodname: 'queryOperKeysOfNormalModal',
                ModalName: '事件分析',
                Classify: 'sjfx'
            };
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, 'get').then(function(data) {
                angular.forEach(data, function(value, key) {
                    $scope.tagRights[value.OPERNAME] = true;
                });
            })
        };
    }]);
