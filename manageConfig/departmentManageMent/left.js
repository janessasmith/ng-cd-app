"use strict";
angular.module('departmentManageMentLeftModule', [])
    .controller('departmentManageMentLeftCtrl', ['$scope', '$q', '$stateParams', '$location', '$state', '$timeout', 'treeService', 'trsHttpService', 'trsconfirm', 'trsspliceString', 'trsGroupTreeLocationService', "trsColumnTreeLocationService", "departmentService", function($scope, $q, $stateParams, $location, $state, $timeout, treeService, trsHttpService, trsconfirm, trsspliceString, trsGroupTreeLocationService, trsColumnTreeLocationService, departmentService) {
        initStatus();
        initData();
        /**
         * [initStatus description]初始化状态
         */
        function initStatus() {
            $scope.status = {
                selectedDep: $state.params.departmentid ? $state.params.departmentid : "", //当前选择的部门
                isOpen: true
            };
            $scope.data = {
                departmentLists: [],
            };
            $scope.params = {
                serviceid: "nb_departmentSet",
                methodname: "queryUnits",
            };
        }
        /**
         * [initData description]初始化数据
         */
        function initData() {
            requestData();
        }
        /**
         * [requestData description]数据请求
         * @return {[type]} [description]
         */
        function requestData() {
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), $scope.params, "get").then(function(data) {
                if (!data) return;
                $scope.data.departmentLists = data.DATA ? data.DATA : data;//兼容分页与集合
            });
        }
        $scope.$on('departmentUnit', function(event, msg) {
            requestData();
        });
        /**
         * [unitList description]获得单位列表
         * @return {[type]} [description]
         */
        $scope.unitList = function() {
            $scope.status.selectedDep = "";
            $state.go("manageconfig.department.list", { 'departmentid': null });
        };
        /**
         * [departmentList description]获得部门列表
         * @param  {[obj]} department  [description]部门具体信息
         * @return {[type]}            [description]
         */
        $scope.departmentList = function(department) {
            $scope.status.selectedDep = department.DEPARTMENTID;
            $state.go("manageconfig.department.list", {
                "departmentid": department.DEPARTMENTID
            });
        };
    }]);
