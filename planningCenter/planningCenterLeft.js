"use strict";
angular.module('planningCenterLeftModule', ["ui.bootstrap"])
    .controller('planningCenterLeftController', ["$scope", "$q", "$location", "globleParamsSet", "trsHttpService", function($scope, $q, $location, globleParamsSet, trsHttpService) {
        initStatus();
        $scope.setPlanSelect = function(param) {
            $scope.status.selectedItem = param;
        };

        function initStatus() {
            $scope.routerPathes = $location.path().split("/");
            $scope.status = {
                selectedItem: $scope.routerPathes[2] ? $scope.routerPathes[2] : "cuemonitor",
                eventRights: {},
            };
            getCommandAccess().then(function() {
                for (var i in $scope.status.commandAccess) {
                    getCommandOperRights(i);
                }
            });
            //获取大屏控制访问权限
            getLargeScreenAccess();
            //获取事件分析访问权限
            getEventanalysisRights();
        }
        /**
         * [getCommandAccess description] 协同指挥访问权限
         * @return {[type]} [description] null
         */
        function getCommandAccess() {
            var deffer = $q.defer();
            var params = {
                serviceid: "mlf_metadataright",
                methodname: "queryOperTypesByModal",
            };
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get")
                .then(function(data) {
                    angular.forEach(data, function(_data, index, array) {
                        data[index] = "commandAccess." + data[index];
                    });
                    $scope.status.commandAccess = globleParamsSet.handlePermissionData(data);
                    deffer.resolve();
                });
            return deffer.promise;
        };
        /**
         * [getCommandAccess description] 协同指挥访问权限
         * @return {[type]} [description] null
         */
        function getCommandOperRights(name) {
            var params = {
                serviceid: "mlf_metadataright",
                methodname: "queryOperKeysOfModal",
                ModalName: name,
                Classify: name
            };
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get")
                .then(function(data) {
                    $scope.$parent.initStatus[name] = globleParamsSet.handlePermissionData(data);
                });
        };
        /**
         * [getLargeScreenAccess description] 大屏控制显示隐藏权限
         * @return {[type]} [description] null
         */
        function getLargeScreenAccess() {
            var params = {
                serviceid: "mlf_metadataright",
                methodname: "queryOperKeysOfNormalModal",
                ModalName: '大屏控制',
                Classify: 'daping'
            }
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get")
                .then(function(data) {
                    $scope.status.largeScreenAccessShow = data.length > 0 ? true : false;
                });
        };
        /**
         * [getEventanalysisRights description] 选题事件显示隐藏权限
         * @return {[type]} [description] null
         */
        function getEventanalysisRights() {
            var params = {
                'Classify': 'sjfx',
                'ModalName': '事件分析',
                'methodname': 'queryOperKeysOfNormalModal',
                'serviceid': 'mlf_metadataright'
            };
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get")
                .then(function(data) {
                    angular.forEach(data, function(value, key) {
                        $scope.status.eventRights[value.OPERNAME] = true;
                    });
                });
        };
    }]);
