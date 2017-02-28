/*
    Create by CC 2016-11-1
*/
'use strict';
angular.module("deparmentCreatePartModule", [])
    .controller("deparmentCreatePartCtrl", ["$scope", "$timeout", "$q", "$validation","$state","trsHttpService", '$modalInstance', "groupManageMentService", "trsspliceString", "trsconfirm","department",
        function($scope, $timeout, $q, $validation,$state,trsHttpService, $modalInstance, groupManageMentService, trsspliceString, trsconfirm,department) {
            initStatus();
            /**
             * [initStatus description]初始化参数
             */
            function initStatus() {
                $scope.data = {
                    department:department
                };
                $scope.status = {
                    unitorDep:$state.params.departmentid?"部门":"单位",
                };
                $scope.status.modalTitle=department?"编辑"+$scope.status.unitorDep : "新建"+$scope.status.unitorDep;
            }
            //确定
            $scope.confirm = function() {
                $validation.validate($scope.createGroupSubmitForm).success(function() {
                    saveDepartment($scope.data.currGroup).then(function(data) {
                        trsconfirm.alertType('保存成功', "", "success", false, function() {
                            $modalInstance.close(data);
                        });
                    });
                }).error(function() {
                    trsconfirm.alertType('保存失败', "请检查填写项", "warning", false);
                });
            };
            //取消
            $scope.cancel = function() {
                $modalInstance.dismiss();
            };
            /**
             * [saveDepartment description]保存部门稿库
             * @return {[type]} [description]
             */
            function saveDepartment() {
                var defer = $q.defer();
                var params={
                    serviceid:"nb_departmentSet",
                    methodname:$state.params.departmentid?"saveDepartment":"saveUnit",
                    departmentname:$scope.data.department.DEPARTMENTNAME,
                    depdesc:$scope.data.department.DEPDESC,
                };
                params.ObjectId=department?department.DEPARTMENTID:0;
                params.parentId=$state.params.departmentid?$state.params.departmentid:null;
                $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "post").then(function(data) {
                    defer.resolve(data);
                });
                return defer.promise;
            }
        }
    ]);
