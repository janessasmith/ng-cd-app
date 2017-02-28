//创建人：bai.zhiming
//创建时间：2016-11-3
//描述：编辑图片ctrl
"use strict";
angular.module("editPictureModule", [])
    .controller("editPictureCtrl", ["$scope", "$modalInstance", "$q", "$timeout", "params", "editPictureService", function($scope, $modalInstance, $q, $timeout, params, editPictureService) {
        initStatus();
        initImage();
        getWatermarkList();
        /**
         * [initStatus description]初始化状态
         */
        function initStatus() {
            $scope.status = {
                sizeType: "0", //1表示适合大小 0表示原始大小
                zoomType: "1", //1表示按像素，0表示百分比
                keeyAspectRatio: "1", //是否保持宽高比
                watermarkType: (angular.isDefined($scope.status) && angular.isDefined($scope.status.watermarkType)) ? $scope.status.watermarkType : "-1", //保存之前的水印效果，并兼容初始化
                locationType: "4", //默认水印位置，右下
                waterMarkOpc: 1, //水印透明度
                orgImg: {
                    preWidth: '加载中...',
                    preHeight: '加载中...'
                },
                previewStyle: {} //预览图片尺寸样式
            };
        }
        /**
         * [setSizeType description]设置图片显示类型
         */
        $scope.setSizeType = function(value) {
            $scope.status.sizeType = value;
            loadImageWithType($scope.status.sizeType).then(function() {
                $scope.setWatermark($scope.status.watermarkType);
            });
        };
        /**
         * [setZoomType description]设置图片缩放类型
         */
        $scope.setZoomType = function(value) {
            $scope.status.zoomType = value;
        };
        /**
         * [setKeeyAspectRatio description]设置是否保持宽高比
         */
        /*$scope.setKeeyAspectRatio = function() {
            $scope.status.keeyAspectRatio = $scope.status.keeyAspectRatio === '1' ? '0' : '1';
        };*/
        /**
         * [setLocation description]设置水印位置
         * @param  {[string]} width [description] 图片在左侧框展现宽度
         *  @param  {[string]}  height [description] 图片在左侧框展现高度
         */
        $scope.setLocation = function(type) {
            $scope.status.locationType = type;
            if (!$("#myWatermark")[0]) return;
            $("#myWatermark").css("top", "initial");
            $("#myWatermark").css("left", "initial");
            $("#myWatermark").css("right", "initial");
            $("#myWatermark").css("bottom", "initial");
            var left, top, calWidth, calHeight;
            switch (type) {
                case "1":
                    $("#myWatermark").css("top", "10px");
                    $("#myWatermark").css("left", "10px");
                    break;
                case "2":
                    calWidth = parseFloat(styleToJson($scope.status.previewStyle).width.replace(/px/g, "")) - parseFloat($("#myWatermark").css("width").replace(/px/g, ""));
                    calHeight = parseFloat(styleToJson($scope.status.previewStyle).height.replace(/px/g, "")) - parseFloat($("#myWatermark").css("height").replace(/px/g, ""));
                    left = (calWidth / 2) + "px";
                    top = (calHeight / 2) + "px";
                    $("#myWatermark").css("top", top);
                    $("#myWatermark").css("left", left);
                    break;
                case "3":
                    calWidth = parseFloat(styleToJson($scope.status.previewStyle).width.replace(/px/g, "")) - parseFloat($("#myWatermark").css("width").replace(/px/g, ""));
                    left = (calWidth / 2) + "px";
                    //$("#myWatermark").css("bottom", "0px");
                    $("#myWatermark").css("top", (parseFloat(styleToJson($scope.status.previewStyle).height.replace(/px/g, "")) - $scope.status.watermarkHeight - 10) + "px");
                    $("#myWatermark").css("left", left);
                    break;
                case "4":
                    $("#myWatermark").css("top", (parseFloat(styleToJson($scope.status.previewStyle).height.replace(/px/g, "")) - $scope.status.watermarkHeight - 10) + "px");
                    $("#myWatermark").css("left", (parseFloat(styleToJson($scope.status.previewStyle).width.replace(/px/g, "")) - $scope.status.watermarkWidth - 10) + "px");
                    /*$("#myWatermark").css("bottom", "0px");
                    $("#myWatermark").css("right", "0px");*/
                    break;
                default:
            }
        };
        /**
         * [cancel description]取消图片编辑 关闭窗口
         */
        $scope.cancel = function() {
            $modalInstance.dismiss();
        };
        /**
         * [apply description]应用预设图片尺寸，并进行压缩
         */
        $scope.apply = function() {
            if ($scope.status.orgImg.preWidth !== $scope.status.numWidth || $scope.status.orgImg.preHeight !== $scope.status.numHeight) {
                $scope.loadingPromise = editPictureService.compressImg($scope.status.orgImg.src, $scope.status.numWidth, $scope.status.numHeight).then(function(src) {
                    params.image.PERPICURL = src;
                    initStatus();
                    initImage().then(function() {
                        $scope.setWatermark($scope.status.watermarkType);
                    });
                    getWatermarkList();
                });
            }
        };
        /**
         * [setWatermark description]添加水印
         */
        $scope.setWatermark = function(watermarkType) {
            $("#myWatermark").remove();
            if (watermarkType !== "-1") {
                var watermarkTypeArray = watermarkType.split("/");
                watermarkTypeArray.splice(0, 3);
                watermarkType = "/" + watermarkTypeArray.join("/");
                var img = new Image();
                img.src = watermarkType;
                img.onload = function() {
                    $scope.loadingPromise = handleWatermark(img).then(function(params) {
                        var $img = $(img).clone();
                        $img.attr("src", params.src);
                        $scope.status.watermarkWidth = params.width; //获取水印宽度
                        $scope.status.watermarkHeight = params.height;
                        $img.attr("id", "myWatermark");
                        $("#toCanvas").append($img);
                        $img.draggable({
                            containment: "parent",
                        });
                        var style = {
                            position: "absolute",
                            top: "0px",
                            width: params.width + "px",
                            height: params.height + "px",
                            opacity: $scope.status.waterMarkOpc,
                            cursor: "crosshair"
                        };
                        style = $scope.exchangeStyle(style);
                        $img.attr("style", style);
                        $scope.setLocation($scope.status.locationType);
                    });
                };
            }
        };
        /**
         * [handleWatermark description]处理水印缩放
         */
        function handleWatermark(img) {
            var deffer = $q.defer();
            var preWidth = parseFloat(styleToJson($scope.status.previewStyle).width.replace(/px/, ""));
            var preHeight = parseFloat(styleToJson($scope.status.previewStyle).height.replace(/px/, ""));
            var params;
            if (img.width > preWidth || img.height > preHeight) {
                var waterMarkAspectRatio = img.width / img.height;
                var orgImgAspectRatio = preWidth / preHeight;
                if (waterMarkAspectRatio > orgImgAspectRatio) {
                    editPictureService.compressImg(img.src, preWidth, preWidth / waterMarkAspectRatio).then(
                        function(src) {
                            params = {
                                src: src,
                                width: preWidth,
                                height: preWidth / waterMarkAspectRatio
                            };
                            deffer.resolve(params);
                        });
                } else {
                    editPictureService.compressImg(img.src, preHeight * waterMarkAspectRatio, preHeight).then(
                        function(src) {
                            params = {
                                src: src,
                                width: preHeight * waterMarkAspectRatio,
                                height: preHeight
                            };
                            deffer.resolve(params);
                        });
                }
            } else {
                params = {
                    src: img.src,
                    width: img.width,
                    height: img.height
                };
                deffer.resolve(params);
            }
            return deffer.promise;
        }
        /**
         * [cropper description]裁剪图片
         */
        $scope.cropper = function() {
            editPictureService.newCropper($scope.status.orgImg.src).then(function(data) {
                params.image.PERPICURL = data.imgSrc.replace(/ScaleWidth=600&/g, ""); //data.imgSrc;
                initStatus();
                initImage().then(function() {
                    $scope.setWatermark($scope.status.watermarkType);
                });
                getWatermarkList();
            });
            /*$scope.loadingPromise = editPictureService.cutPicture({ imgSrc: $scope.status.orgImg.src }, "", function(data) {
                params.image.PERPICURL = data.imgSrc.replace(/ScaleWidth=600&/g, ""); //data.imgSrc;
                initStatus();
                initImage().then(function() {
                    $scope.setWatermark($scope.status.watermarkType);
                });
                getWatermarkList();
            });*/
        };
        /**
         * [reset description]重置预设缩放输入框
         */
        $scope.reset = function() {
            $scope.status.numHeight = $scope.status.orgImg.preHeight;
            $scope.status.numWidth = $scope.status.orgImg.preWidth;
            $scope.status.widthPercent = 100;
            $scope.status.heightPercent = 100;
        };
        /**
         * [ description]确定
         */
        $scope.confirm = function() {
            $scope.loadingPromise = handlePic().then(function(src) {
                if (src.indexOf("data") === 0) {
                    editPictureService.submitDatabase64Url(src).then(function(data) {
                        $modalInstance.close(data);
                    });
                } else if (src.indexOf("read_image") > 0 || src.indexOf("readimg") > 0) {
                    var imgNameArray = src.split("=");
                    var imgName = imgNameArray[imgNameArray.length - 1];
                    var params = {
                        imgName: imgName,
                        imgSrc: src
                    };
                    $modalInstance.close(params);
                } else {
                    $modalInstance.dismiss();
                }
            }, function() {
                $modalInstance.dismiss();
            });
        };
        /**
         * [handlePic description]点击确定后处理图片
         *  @return  {[string]}  src [description] 处理后的canvas的src
         */
        function handlePic() {
            var deffer = $q.defer();
            if (angular.isUndefined($("#myWatermark").attr("style"))) {
                deffer.resolve($scope.status.orgImg.src);
                return deffer.promise;
            }
            var waterMarkStyle = styleToJson($("#myWatermark").attr("style"));
            var scalingLeft = parseFloat(waterMarkStyle.left.replace(/px/, ""));
            var scalingTop = parseFloat(waterMarkStyle.top.replace(/px/, ""));
            var scalingWidth = parseFloat(waterMarkStyle.width.replace(/px/, ""));
            var scalingHeight = parseFloat(waterMarkStyle.height.replace(/px/, ""));
            if ($scope.status.sizeType === "1") { //在适合尺寸中进行添加水印，水印和坐标也要按比例缩放
                var scaling = parseFloat(styleToJson($scope.status.previewStyle).width.replace(/px/, "")) / $scope.status.orgImg.width;
                scalingLeft = scalingLeft / scaling;
                scalingTop = scalingTop / scaling;
                scalingWidth = scalingWidth / scaling;
                scalingHeight = scalingHeight / scaling;

            }
            editPictureService.ScaleWatermark($("#myWatermark").attr("src"), scalingWidth, scalingHeight, $scope.status.waterMarkOpc).then(function(watermarkSrc) {
                editPictureService.watermark($scope.status.orgImg.src, watermarkSrc, scalingLeft, scalingTop, $scope.status.waterMarkOpc)
                    .then(function(newPicture) {
                        deffer.resolve(newPicture);
                    });
            });
            return deffer.promise;
        }
        /**
         * [ description]绑定宽
         */
        $scope.$watch("status.numWidth", function(newV, oldV) {
            if ($scope.status.inputType !== "1") return;
            if (newV === oldV || (angular.isUndefined(newV) && angular.isUndefined(oldV))) return;
            if ($scope.status.keeyAspectRatio === "1") {
                $scope.status.numHeight = editPictureService.parseFloat(newV / $scope.status.aspectRatio);
                $scope.status.heightPercent = editPictureService.parseFloat((newV / $scope.status.orgImg.width) * 100);
                $scope.status.widthPercent = editPictureService.parseFloat((newV / $scope.status.orgImg.width) * 100);
            } else {
                $scope.status.widthPercent = editPictureService.parseFloat((newV / $scope.status.orgImg.width) * 100);
                $scope.status.aspectRatio = newV / $scope.status.numHeight;
            }
        });
        /**
         * [ description]绑定高
         */
        $scope.$watch("status.numHeight", function(newV, oldV) {
            if ($scope.status.inputType !== "2") return;
            if (newV === oldV || (angular.isUndefined(newV) && angular.isUndefined(oldV))) return;
            if ($scope.status.keeyAspectRatio === "1") {
                $scope.status.numWidth = editPictureService.parseFloat(newV * $scope.status.aspectRatio);
                $scope.status.heightPercent = editPictureService.parseFloat((newV / $scope.status.orgImg.height) * 100);
                $scope.status.widthPercent = editPictureService.parseFloat((newV / $scope.status.orgImg.height) * 100);
            } else {
                $scope.status.heightPercent = editPictureService.parseFloat((newV / $scope.status.orgImg.height) * 100);
                $scope.status.aspectRatio = $scope.status.numWidth / newV;
            }
        });
        /**
         * [ description]绑定宽百分比
         */
        $scope.$watch("status.widthPercent", function(newV, oldV) {
            if ($scope.status.inputType !== "3") return;
            if (newV === oldV || (angular.isUndefined(newV) && angular.isUndefined(oldV))) return;
            if ($scope.status.keeyAspectRatio === "1") {
                $scope.status.heightPercent = newV;
                $scope.status.numWidth = editPictureService.parseFloat($scope.status.orgImg.width * (newV / 100));
                $scope.status.numHeight = editPictureService.parseFloat($scope.status.orgImg.height * (newV / 100));
            } else {
                $scope.status.numWidth = editPictureService.parseFloat($scope.status.orgImg.width * (newV / 100));
                $scope.status.aspectRatio = $scope.status.numWidth / $scope.status.numHeight;
            }
        });
        /**
         * [ description]绑定高百分比
         */
        $scope.$watch("status.heightPercent", function(newV, oldV) {
            if ($scope.status.inputType !== "4") return;
            if (newV === oldV || (angular.isUndefined(newV) && angular.isUndefined(oldV))) return;
            if ($scope.status.keeyAspectRatio === "1") {
                $scope.status.widthPercent = newV; //newV * $scope.status.aspectRatio;
                $scope.status.numHeight = editPictureService.parseFloat($scope.status.orgImg.height * (newV / 100));
                $scope.status.numWidth = editPictureService.parseFloat($scope.status.orgImg.width * (newV / 100));
            } else {
                $scope.status.numHeight = editPictureService.parseFloat($scope.status.orgImg.height * (newV / 100));
                $scope.status.aspectRatio = $scope.status.numWidth / $scope.status.numHeight;
            }
        });
        /**
         * [ description]监听水印透明度变化
         */
        $scope.$watch("status.waterMarkOpc", function(nv, ov) {
            $("#myWatermark").css("opacity", nv);
        });
        /**
        /**
         * [initData description]初始化图片
         */
        function initImage() {
            var deffer = $q.defer();
            $scope.data = {};
            if (params.image.PERPICURL.indexOf("ScaleWidth=600") >= 0) {
                params.image.PERPICURL = params.image.PERPICURL.replace(/ScaleWidth=600&/g, "");
            }
            if (params.image.PERPICURL.indexOf("http") === 0) {
                var prepicurlArray = params.image.PERPICURL.split("/").splice(3);
                params.image.PERPICURL = ("/" + prepicurlArray.join("/")).replace(/_600\./g, ".").replace(/\/\//g, "/"); //兼容后端bug，双斜杠改为单斜杠
            }
            $scope.data.image = params.image;
            $scope.loadingPromise = loadImageWithType($scope.status.sizeType).then(function() {
                deffer.resolve();
            });
            return deffer.promise;
        }
        /**
         * [exchangeStyle description]转换样式格式
         */
        $scope.exchangeStyle = function(params) {
            var style = "";
            for (var j in params) {
                style += j + ":" + params[j] + ";";
            }
            return style;
        };
        /**
         * [styleToJson description]样式字符串转JSON
         * @param  {[string]} style [description] 样式字符串
         * @return {[obj]}  styleJson [description] 样式json
         */
        function styleToJson(style) {
            var styleJson = {};
            style = style.replace(/ /g, "").split(";");
            angular.forEach(style, function(data, index, array) {
                var dataArray = data.split(":");
                styleJson[dataArray[0]] = dataArray[1];
            });
            return styleJson;
        }
        /**
         * [loadImage description]加载图片
         */
        function loadImage() {
            var deffer = $q.defer();
            if ($scope.status.orgImg.src) {
                deffer.resolve();
            } else {
                var img = new Image();
                img.src = $scope.data.image.PERPICURL;
                img.onload = function() {
                    $scope.status.orgImg = img;
                    $scope.status.orgImg.preWidth = editPictureService.parseFloat(img.width);
                    $scope.status.orgImg.preHeight = editPictureService.parseFloat(img.height);
                    $scope.status.numWidth = angular.copy($scope.status.orgImg.preWidth);
                    $scope.status.numHeight = angular.copy($scope.status.orgImg.preHeight);
                    $scope.status.widthPercent = 100;
                    $scope.status.heightPercent = 100;
                    $scope.status.aspectRatio = $scope.status.orgImg.width / $scope.status.orgImg.height;
                    deffer.resolve();
                };
            }
            return deffer.promise;
        }
        /**
         * [getWatermarkList description]获取水印列表
         */
        function getWatermarkList() {
            editPictureService.getWatermarkList().then(function(data) {
                $scope.status.watermarkList = data;
            });
        }
        /**
         * [loadImageWithType description]根据缩放类型加载图片
         */
        function loadImageWithType(type) {
            var deffer = $q.defer();
            loadImage().then(function() {
                if (type === "1") {
                    suitableSize();
                    deffer.resolve();
                } else {
                    originalSize();
                    deffer.resolve();
                }
            });
            return deffer.promise;
        }
        /**
         * [originalSize description]原始大小
         */
        function originalSize() {
            $scope.status.previewStyle = "width:" + $scope.status.numWidth + "px;height:" + $scope.status.numHeight + "px;";
        }
        /**
         * [suitableSize description]适合大小
         */
        function suitableSize() {
            var parentAspectRatio = 836 / 490;
            if (parentAspectRatio > $scope.status.aspectRatio) {
                $scope.status.previewStyle = "width:" + (490 * $scope.status.aspectRatio) + "px;height:488px";
            } else {
                $scope.status.previewStyle = "width:834px;height:" + (836 / $scope.status.aspectRatio) + "px";
            }
        }
    }]);
