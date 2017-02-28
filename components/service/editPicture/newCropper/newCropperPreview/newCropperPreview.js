//创建人：fanglijuan
//创建时间：2016-11-22
//描述：new裁剪图片预览ctrl
"use strict";
angular.module("newCropperPreviewModule", [])
    .controller("newCropperPreviewCtrl", ["$scope", "$modalInstance", "$q", "$timeout", "params", "editPictureService",
        function($scope, $modalInstance, $q, $timeout, params, editPictureService) {
            var imgH, imgW;
            initStatus();
            initData();
            /**
             * [initStatus description]初始化状态
             */
            function initStatus() {
                $scope.status = {
                    imgSrc: params.prevImg.imgSrc,
                    imgH: 0,
                    imgW: 0,
                };

            }
            /**
             * [initData description]初始化数据
             */
            function initData() {
                var img = new Image();
                img.src = $scope.status.imgSrc;
                img.onload = function() {
                    $scope.status.imgW = img.width;
                    $scope.status.imgH = img.height;
                    $timeout(function() {
                        $scope.status.imgStyle = $scope.status.prew_imgStyle = "width:" + $scope.status.imgW + "px;height:" + $scope.status.imgH + "px;";
                        //$scope.prev_conStyle = "width:" + ($scope.status.imgW + 50) + "px";
                        setOuterStyle($scope.status.imgW, $scope.status.imgH);
                    });
                };
            }
            /**
             * [setOuterStyle description 设置外框宽高]
             * @param {[type]} imgW [description]
             * @param {[type]} imgH [description]
             */
            function setOuterStyle(imgW, imgH) {
                var newDialogW = imgW + 100;
                var newDialogH = imgH + 100;
                var wiindowW = $(window).width() - 100;
                if (newDialogW < 300) {
                    newDialogW = 300;
                }
                if (newDialogW >= wiindowW) {
                    newDialogW = wiindowW;
                    $scope.status.prew_imgStyle = "width:" + (wiindowW-100) + "px;height:" + $scope.status.imgH + "px;overflow:auto;";
                }
                $(".newCropperPreview").find(".modal-dialog").css("width", newDialogW + "px");
            }
            /**
             * [cancel description]取消图片编辑 关闭窗口
             */
            $scope.cancel = function() {
                $modalInstance.dismiss();
            };
        }
    ]);
