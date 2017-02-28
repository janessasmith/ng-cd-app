/**
 * 产品管理 微博 绑定微博账号
 * by zhou 2016-8-22
 */
"use strict";
angular.module("bangdingWeiboAccountModule", [])
    .controller('bangdingWeiboAccountCtrl', ['$scope', '$modalInstance', '$validation', 'trsHttpService', 'trsconfirm',
        function($scope, $modalInstance, $validation, trsHttpService, trsconfirm) {
            initStatus();

            /**
             * [initStatus description] 初始化状态
             * @return {[type]} [description]
             */
            function initStatus() {
                $scope.data = {
                    username: '',
                    password: ''
                };
            }

            /**
             * [deleteWeiboAccount description] 确定
             * @return {[type]} [description]
             */
            $scope.confirm = function() {
                var params = {
                    serviceid: "wcm61_scmaccount",
                    methodname: "autoBindAccountOfSinaToJson",
                    UserId: $scope.data.username,
                    Passwd: $scope.data.password
                };

                //     .then(function(data) {
                //     trsconfirm.alertType("账号延期成功", "", "success", false, function() {
                //         $modalInstance.close(params);
                //     });
                // });
                $validation.validate($scope.bingdingweiboAccount).success(function() {
                    LazyLoad.js(["./lib/js-base64/base64.js"], function() {
                        params.Passwd = "__encoded__" + Base64.encode(angular.copy($scope.data.password));
                        // params.UserId = "__encoded__" + Base64.encode(angular.copy($scope.data.username));
                        $scope.loadingPromise = trsHttpService.httpServer('/wcm/rbcenter.do', params, 'get');
                    });
                });
            };

            /**
             * [cancel description] 取消
             * @return {[type]} [description]
             */
            $scope.cancel = function() {
                $modalInstance.dismiss();
            };
        }
    ]);
