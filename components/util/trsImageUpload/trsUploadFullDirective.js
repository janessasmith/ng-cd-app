"use strict";
/**
 * created by cc 2016-4-13 网站导读图片上传指令
 * motified by xuexiaoting 2017-01-10 需剪裁图片，使用指令时html增加directcropper属性；不需剪裁，则去掉
 */
angular.module('editingCenter.imgUploadChg', [])
    .directive('trsUploadFull', ['$timeout', '$modal', 'editPictureService', 'trsconfirm', 'editingCenterService',
        function($timeout, $modal, editPictureService, trsconfirm, editingCenterService) {
            return {
                restrict: 'EA',
                replace: true,
                transclude: true,
                scope: {
                    fileName: "=",
                    fileDesc: "=",
                    returnFile: "=",
                    callback: "&",
                    maxSize: "@",
                },

                templateUrl: './components/util/trsImageUpload/uploaderFull.html',
                link: function(scope, element, attr) {
                    initStatus();
                    var accept = {
                        title: "Images",
                        extensions: 'gif,jpg,jpeg,bmp,png',
                        mimeTypes: '.gif,.jpg,.jpeg,.bmp,.png'
                    };
                    //指定按钮
                    var picker = element[0].children[0].children[1];
                    var uploader = WebUploader.create({
                        // 选完文件后，是否自动上传
                        auto: true,
                        // swf文件路径
                        // swf: BASE_URL + '/js/Uploader.swf',
                        swf: './webuploader/util/Uploader.swf',
                        server: "/wcm/openapi/uploadImage",
                        // 选择文件的按钮。可选。
                        // 内部根据当前运行是创建，可能是input元素，也可能是flash.
                        threads: 1,
                        fileNumLimit: 1,
                        pick: {
                            id: picker,
                            multiple: true
                        },
                        // 只允许选择图片文件。
                        method: 'POST',
                        //接收文件的类型
                        accept: accept,
                        compress: false,
                        duplicate: true,
                        fileSingleSizeLimit: scope.maxSize||104857600,//不传入时默认图片大小为100M
                        prepareNextFile: true
                    });
                    /**
                     * [initStatus description]初始化
                     * @return {[type]}        [description]
                     */
                    function initStatus() {
                        scope.status = {
                            directcropper: false,
                            info: {
                                F_EXCEED_SIZE: '图片超过' + parseInt(scope.maxSize)/1024/1024 + 'm，请重新上传',
                                // Q_EXCEED_NUM_LIMIT:'每次上'
                            }
                        };
                        if (attr.$attr.directcropper) {
                            scope.status.directcropper = true;
                            scope.status.picturesize = attr.picturesize;
                        }
                    }
                    //上传成功后
                    uploader.on('uploadSuccess', function(file, src) {
                        if (angular.isString(scope.maxSize) && parseInt(scope.maxSize) * Math.pow(1024, 2) < file.size) {
                            trsconfirm.alertType("上传图片的大小不可超过" + scope.maxSize, '', 'error', false);
                            return;
                        }
                        scope.fileNameBak = angular.copy(scope.fileName); //用于取消裁剪后的回退操作
                        scope.returnFileBak = angular.copy(scope.returnFile); //用于取消裁剪后的回退操作
                        scope.fileDescBak = angular.copy(scope.fileDesc); //用于取消裁剪后的回退操作
                        if (scope.status.directcropper) {
                            editPictureService.cutPicture(src, scope.status.picturesize, function(_src) {
                                var picturesizeArray = scope.status.picturesize.split(",");
                                var width = picturesizeArray[0];
                                var height = picturesizeArray[1];
                                editPictureService.compressImg(_src.imgSrc, Math.round(width), Math.round(height)).then(function(__src) {
                                    var __srcArray = __src.split("=");
                                    var srcObj = {
                                        imgName: __srcArray[__srcArray.length - 1],
                                        imgSrc: __src,
                                        success: "上传成功"
                                    };
                                    successHandle(srcObj, file);
                                });
                            }, function() {
                                // cancelHandle();
                                successHandle(src, file); //点击取消时显示原图
                            });
                        } else {
                            $timeout(function() {
                                scope.fileName = src.imgName;
                                scope.fileDesc = src.imgName;
                                scope.uploaderSuccess = true;
                                if (file.ext != 'gif') {
                                    scope.returnFile = src.imgSrc;
                                }
                            });
                        }
                        $timeout(function() {
                            successHandle(src, file);
                        });
                    });
                    //上传失败后
                    uploader.on('uploadError', function(file) {
                        $timeout(function() {
                            scope.info = "上传失败";
                        });
                    });
                    uploader.on('error', function(handler) {
                        trsconfirm.alertType('上传失败', scope.status.info[handler], "error", false);
                    });
                    //文件加入队列
                    uploader.on('filesQueued', function(file) {
                        $timeout(function() {
                            scope.uploaderSuccess = false;
                            if (file.length > 0 && file[0].ext == "gif") {
                                uploader.makeThumb(file, function(error, src) {
                                    scope.returnFile = src;
                                });
                            }
                        });
                    });
                    /**
                     * [removeImg description]删除导读图片框
                     * @return {[type]} [description]
                     */
                    scope.removeImg = function() {
                        scope.uploaderSuccess = false;
                        scope.callback();
                    };
                    /**
                     * [successHandle description]上传图片并且成功过后的处理
                     * @return {[type]} [description]
                     */
                    function successHandle(src, file) {
                        scope.fileName = src.imgName;
                        scope.fileDesc = src.imgName;
                        scope.uploaderSuccess = true;
                        if (file.ext != 'gif') {
                            scope.returnFile = src.imgSrc;
                        }
                    }
                    /**
                     * [successHandle description]取消裁剪图片的处理
                     * @return {[type]} [description]
                     */
                    function cancelHandle(src, file) {
                        scope.fileName = angular.copy(scope.fileNameBak);
                        scope.returnFile = angular.copy(scope.returnFileBak);
                        scope.fileDesc = angular.copy(scope.fileDescBak);
                        scope.uploaderSuccess = false;
                    }
                    /**
                     * [modifyImg description]图片修改
                     * @return {[type]} [description]
                     */
                    scope.modifyImg = function() {
                        editPictureService.editPicture({ PERPICURL: scope.returnFile }, function(img) {
                            var myImg = new Image();
                            var sFileName = img.imgName || img.FN;
                            var imageUrl = "/wcm/file/read_image.jsp?FileName=" + sFileName; //文件没有保存之后，是U0开头

                            if (sFileName.match(/^W0/)) {
                                imageUrl = ["/webpic/", sFileName.substring(0, 8), "/", sFileName.substring(0, 10), "/", sFileName].join("");
                                //imageUrl += "?r=" + new Date().getTime(); //添加水印之后，图片名称不变，防止图片不刷新
                            }

                            myImg.src = imageUrl;
                            myImg.onload = function() {
                                scope.fileName = img.imgName;
                                scope.returnFile = imageUrl;
                            };
                            //editPhotoCallback();
                        });
                        /*var modalInstance = $modal.open({
                            template: '<iframe src="/wcm/app/photo/photo_compress_mlf.jsp?photo=..%2F..%2Ffile%2Fread_image.jsp%3FFileName%3D' + scope.fileName + '&index=' + 0 + '" width="1210px" height="600px"></iframe>',
                            windowClass: 'photoCropCtrl',
                            backdrop: false,
                            controller: "trsPhotoCropCtrl",
                            resolve: {
                                params: function() {
                                    return;
                                }
                            }
                        });

                        window.editCallback = uploaderImgeditCallback;*/
                    };
                    /**
                     * [cropper description]只裁剪图片
                     * @return {[type]} [description]
                     */
                    scope.cropper = function() {
                        var src = {
                            imgSrc: scope.returnFile
                        };
                        editPictureService.cutPicture(src, scope.status.picturesize, function(_src) {
                            var file = {
                                ext: ""
                            };
                            var picturesizeArray = scope.status.picturesize.split(",");
                            var width = picturesizeArray[0];
                            var height = picturesizeArray[1];
                            editPictureService.compressImg(_src.imgSrc, Math.round(width), Math.round(height)).then(function(__src) {
                                var __srcArray = __src.split("=");
                                var srcObj = {
                                    imgName: __srcArray[__srcArray.length - 1],
                                    imgSrc: __src,
                                    success: "上传成功"
                                };
                                successHandle(srcObj, file);
                            });
                            //successHandle(_src, file);
                        });
                    };
                    /**
                     * [uploaderImgeditCallback description]图片修改回掉函数
                     * @param  {[type]} params [description]
                     * @return {[type]}        [description]
                     */
                    /*function uploaderImgeditCallback(params) {
                        var myImg = new Image();
                        var sFileName = params.imageName || params.FN;
                        var imageUrl = "/wcm/file/read_image.jsp?FileName=" + sFileName; //文件没有保存之后，是U0开头

                        if (sFileName.match(/^W0/)) {
                            imageUrl = ["/webpic/", sFileName.substring(0, 8), "/", sFileName.substring(0, 10), "/", sFileName].join("");
                            //imageUrl += "?r=" + new Date().getTime(); //添加水印之后，图片名称不变，防止图片不刷新
                        }

                        myImg.src = imageUrl;
                        myImg.onload = function() {
                            scope.fileName = params.imageName;
                            scope.returnFile = imageUrl;
                        }
                        editPhotoCallback();
                    }*/
                }
            };
        }
    ]);
