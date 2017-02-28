/*
  作者：baizhiming
  日期:2016-9-13
  描述:图片剪裁
*/
'use strict';
angular.module("trsCutPictureCtrlMoudle", [])
    .controller("cutPictureCtrl", ["$scope", '$modalInstance', 'params', 'trsconfirm',
        function($scope, $modalInstance, params, trsconfirm) {
            initStatus();
            /**
             * [initStatus description] 初始化状态
             * @return {[type]} [description]
             */
            function initStatus() {
                $scope.status = {
                    params: params.src,
                    picturesize: params.picturesize

                };
                buldWatch();
            }
            /**
             * [cancel description] 取消
             * @return {[type]} [description]
             */
            $scope.cancel = function() {
                $modalInstance.close();
            };
            /**
             * [confirm description] 确认
             * @return {[type]} [description]
             */
            $scope.confirm = function() {
                trsconfirm.confirmModel("裁剪图片", "确定要裁剪该图片么", function() {
                    window.crop.confirm = true;
                });
            };
            /**
             * [buldWatch description] 创建父子变量监控
             * @return {[type]} [description]
             */
            function buldWatch() {
                window.crop = {
                    src: angular.copy($scope.status.params),
                    confirm: false,
                    picturesize: angular.copy($scope.status.picturesize)
                };
                window.crop.watch = function(prop, handler) {
                    var oldVal = this[prop]; //旧值
                    var nowVal = oldVal; //现值

                    if (delete this[prop]) {
                        this.__defineSetter__(prop, function(val) {
                            oldVal = nowVal;
                            nowVal = val;
                            handler(oldVal, val);
                        });
                        this.__defineGetter__(prop, function() {
                            return nowVal;
                        });
                    }
                };
                window.crop.watch("src", function(oldV, newV) {
                    delete window.crop;
                    $modalInstance.close(newV);
                });
            }
        }
    ]);
