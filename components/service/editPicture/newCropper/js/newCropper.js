//创建人：fanglijuan
//创建时间：2016-11-21
//描述：new裁剪图片ctrl
"use strict";
angular.module("newCropperModule", [])
    .controller("newCropperCtrl", ["$scope", "$modalInstance", "$q", "$timeout", "params", "editPictureService", "trsHttpService", "trsconfirm",
        function($scope, $modalInstance, $q, $timeout, params, editPictureService, trsHttpService, trsconfirm) {
            var $img,
                img, event, options, containerWidth, containerHeight, imgHeight, imgWidth, imgRatio, flag = true;
            initStatus();
            initData();
            /**
             * [initStatus description]初始化状态
             */
            function initStatus() {
                $scope.status = {
                    imgSrc: params.imgSrc
                };
            }

            function initCropper() {
                var deffer = $q.defer();
                $timeout(function() {
                    $img = $("#img");
                    $scope.status.imgSrc = $scope.status.imgSrc.replace(/ScaleWidth=600&/g, "");
                    if ($scope.status.imgSrc.indexOf("http://") === 0) {
                        var imgArray = $scope.status.imgSrc.split("/");
                        imgArray.splice(0, 3);
                        $scope.status.imgSrc = ("/" + imgArray.join("/")).replace(/ScaleWidth=600&/g, "");
                    }
                    var imgType = editPictureService.getImageType($scope.status.imgSrc);
                    img = new Image();
                    img.src = $scope.status.imgSrc;
                    img.onload = function() {
                        $timeout(function() {
                            $scope.status.orgWidth = img.width;
                            $scope.status.orgHeight = img.height;
                        });
                        $img.attr("src", $scope.status.imgSrc);
                        options = {
                            //aspectRatio: 16 / 9,
                            checkCrossOrigin: false,
                            zoomable: false,
                            dragMode: 'none',
                            /*minCropBoxWidth: cropWidth,
                            minCropBoxHeight: cropHeight,
                            aspectRatio: aspectRatio,
                            autoCropArea: 0.1,
                            cropBoxResizable: false,*/
                            crop: function(e) {
                                //console.log(e);
                            }
                        };
                        $img.on({
                            'build.cropper': function(e) {
                                //console.log(e.type);
                            },
                            'built.cropper': function(e) {
                                containerWidth = $img.cropper("getContainerData").width;
                                containerHeight = $img.cropper("getContainerData").height;
                                imgWidth = $img.cropper("getImageData").width;
                                imgHeight = $img.cropper("getImageData").height;
                                imgRatio = imgWidth / img.width;
                                $img.cropper("setCropBoxData", {
                                    left: (containerWidth - imgWidth) / 2,
                                    top: (containerHeight - imgHeight) / 2,
                                    width: imgWidth / 2,
                                    height: imgHeight
                                });

                                //$img.cropper('setData', { left: 0, top: 0, width: Math.round(img.width / 2), height: Math.round(img.height / 2) });

                                //console.log(e.type);
                            },
                            'cropstart.cropper': function(e) {
                                flag = true;
                                //console.log(e.type, e.action);
                            },
                            'cropmove.cropper': function(e) {
                                //console.log(e.type, e.action);
                            },
                            'cropend.cropper': function(e) {
                                /*var cropBoxData = $img.cropper("getCropBoxData");
                                var marginLeft = (containerWidth - imgWidth) / 2;
                                var marginTop = (containerHeight - imgHeight) / 2;
                                var left = cropBoxData.left - marginLeft;
                                var top = cropBoxData.top - marginTop;
                                var width = cropBoxData.width / imgRatio;
                                var height = cropBoxData.height / imgRatio;
                                $("#horizontal").val(Math.round(left));
                                $("#vertical").val(Math.round(top));
                                $("#realWidth").val(Math.round(width));
                                $("#realHeight").val(Math.round(height));*/
                                //console.log(e.type, e.action);
                            },
                            'crop.cropper': function(e) {
                                delete $scope.status.previewResult; //删除上次预览结果
                                event = e;
                                previewImgDivStyle(e);
                                if (!flag) return;
                                outOfrangeprocess(e);
                                $("#horizontal").val(Math.round(e.x));
                                $("#vertical").val(Math.round(e.y));
                                $("#realWidth").val(Math.round(e.width));
                                $("#realHeight").val(Math.round(e.height));
                            },
                            'zoom.cropper': function(e) {}
                        }).cropper(options);
                        $("#horizontal").bind("change", function() {
                            flag = false;
                            var myValue = parseFloat($(this).val()),
                                width;
                            myValue = myValue > 0 ? myValue : 0;
                            myValue = myValue > $scope.status.orgWidth ? $scope.status.orgWidth : myValue;
                            if ((myValue + event.width) > $scope.status.orgWidth) {
                                width = $scope.status.orgWidth - myValue;
                                $("#realWidth").val(Math.round(width));
                            }
                            $(this).val(myValue);
                            var margin = (containerWidth - imgWidth) / 2;
                            $img.cropper("setCropBoxData", { left: myValue * imgRatio + margin, width: width * imgRatio });
                        });
                        $("#vertical").bind("change", function() {
                            flag = false;
                            var myValue = parseFloat($(this).val()),
                                height;
                            myValue = myValue > 0 ? myValue : 0;
                            myValue = myValue > $scope.status.orgHeight ? $scope.status.orgHeight : myValue;
                            if ((myValue + event.height) > $scope.status.orgHeight) {
                                height = $scope.status.orgHeight - myValue;
                                $("#realHeight").val(Math.round(height));
                            }
                            $(this).val(myValue);
                            var margin = (containerHeight - imgHeight) / 2;
                            $img.cropper("setCropBoxData", { top: myValue * imgRatio + margin, height: height * imgRatio });
                        });
                        $("#realWidth").bind("change", function() {
                            flag = false;
                            var myValue = parseFloat($(this).val());
                            myValue = myValue > 0 ? myValue : 0;
                            myValue = myValue + event.x > $scope.status.orgWidth ? ($scope.status.orgWidth - event.x) : myValue;
                            myValue = Math.round(myValue);
                            $(this).val(myValue);
                            $img.cropper("setCropBoxData", { width: myValue * imgRatio });
                        });
                        $("#realHeight").bind("change", function() {
                            flag = false;
                            var myValue = parseFloat($(this).val());
                            myValue = myValue > 0 ? myValue : 0;
                            myValue = myValue + event.y > $scope.status.orgHeight ? ($scope.status.orgHeight - event.y) : myValue;
                            myValue = Math.round(myValue);
                            $(this).val(myValue);
                            $img.cropper("setCropBoxData", { height: myValue * imgRatio });
                        });
                    };
                    deffer.resolve();
                }, 1000);
                return deffer.promise;
            }

            /**
             * [initData description]初始化数据
             */
            function initData() {
                $scope.loadingPromise = initCropper();
            }
            /**
             * [cancel description]取消图片编辑 关闭窗口
             */
            $scope.cancel = function() {
                $modalInstance.dismiss();
            };
            /**
             * [cropper description]裁剪图片 关闭窗口
             */
            $scope.cropper = function() {
                trsconfirm.alertType("确定要裁剪该图片？", "", "info", true, function() {
                    if ($scope.status.previewResult) {
                        $modalInstance.close($scope.status.previewResult);
                        return;
                    }
                    cropper().then(function(result) {
                        $modalInstance.close(result);
                    });
                });
            };
            /**
             * [previewImgDiv description]预览框的样式设定
             */
            function previewImgDivStyle(event) {
                var width, height;
                var imgAspectRatio = event.width / event.height;
                var divAspectRatio = 1;
                if (imgAspectRatio > divAspectRatio) {
                    width = "204px";
                    height = 204 / imgAspectRatio + "px";
                } else {
                    height = "204px";
                    width = 204 * imgAspectRatio + "px";
                }
                $scope.status.imgOuterDiv = "width:" + width + ";height:" + height;
                previewImgStyle(event, width, height);
            }
            /**
             * [previewImgDiv description]预览框的图片样式设定
             */
            function previewImgStyle(event, preDivWidth, preDivHeight) {
                preDivWidth = parseFloat(preDivWidth.replace(/px/, ""));
                var preImgWidth, preTop, preLeft;
                var cropRadio = event.width / $scope.status.orgWidth;
                preImgWidth = (preDivWidth / cropRadio) + "px";
                var zoomRadio = parseFloat(preImgWidth.replace(/px/, "")) / $scope.status.orgWidth;
                preTop = (-event.y * zoomRadio) + "px";
                preLeft = (-event.x * zoomRadio) + "px";
                $timeout(function() {
                    $scope.status.imgStyle = "width:" + preImgWidth + ";top:" + preTop + ";left:" + preLeft;
                });
            }
            /**
             * [preview description]预览裁剪图片
             */
            $scope.preview = function() {
                if ($scope.status.previewResult) {
                    editPictureService.newCropperPreview($scope.status.previewResult);
                } else {
                    cropper().then(function(result) {
                        $scope.status.previewResult = result;
                        editPictureService.newCropperPreview($scope.status.previewResult);
                    });
                }
            };
            /**
             * [cropper description]裁剪接口
             */
            function cropper() {
                var deffer = $q.defer();
                var params = {
                    serviceid: "mlf_image",
                    methodname: "cropimage",
                    FILENAME: editPictureService.getFileName($scope.status.imgSrc),
                    X: Math.round(event.x),
                    Y: Math.round(event.y),
                    WIDTH: Math.round(event.width),
                    HEIGHT: Math.round(event.height)
                };
                trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function(data) {
                    var result = {
                        imgName: data.FN,
                        imgSrc: "/wcm/file/read_image.jsp?FileName=" + data.FN,
                        success: "上传成功"
                    };
                    deffer.resolve(result);
                });
                return deffer.promise;
            }
            /**
             * [outOfrangeprocess description]裁剪框超出范围处理
             */
            var promise;

            function outOfrangeprocess(e) {
                if (promise) {
                    $timeout.cancel(promise);
                    promise = null;
                }
                promise = $timeout(function() {
                    if (promise) {
                        $timeout.cancel(promise);
                        promise = null;
                    }
                    var marginTop = (containerHeight - imgHeight) / 2;
                    var marginLeft = (containerWidth - imgWidth) / 2;
                    if (e.x < 0) {
                        $img.cropper("setCropBoxData", { left: marginLeft });
                        $("#horizontal").val(0);
                    }
                    if (e.y < 0) {
                        $img.cropper("setCropBoxData", { top: marginTop });
                        $("#vertical").val(0);
                    }
                    if (e.x > $scope.status.orgWidth) {
                        $img.cropper("setCropBoxData", { left: $scope.status.orgWidth * imgRatio + marginLeft });
                        $("#realWidth").val($scope.status.orgWidth);
                    }
                    if ((e.x + e.width) > $scope.status.orgWidth) {
                        var fixWidth = ($scope.status.orgWidth - e.x) * imgRatio;
                        $img.cropper("setCropBoxData", { width: fixWidth });
                    }
                    if (e.y > $scope.status.orgHeight) {
                        $img.cropper("setCropBoxData", { top: $scope.status.orgHeight * imgRatio + marginTop });
                        $("#realHeight").val($scope.status.orgHeight);
                    }
                    if ((e.y + e.height) > $scope.status.orgHeight) {
                        var fixHeight = ($scope.status.orgHeight - e.y) * imgRatio;
                        $img.cropper("setCropBoxData", { height: fixHeight });
                    }
                }, 0.00001);
                return promise;
            }
        }
    ]);
