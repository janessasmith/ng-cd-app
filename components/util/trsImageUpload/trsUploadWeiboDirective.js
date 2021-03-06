"use strict";
/**
 * created by cc 2016-4-13 网站导读图片上传指令
 */
angular.module('editingCenter.imgUploadChgWeibo', [])
    .directive('trsUploadWeibo', ['$timeout', '$modal', function($timeout, $modal) {
        return {
            restrict: 'EA',
            replace: true,
            transclude: true,
            scope: {
                fileName: "=",
                fileDesc: "=",
                returnFile: "=",
                callback: "&",
            },

            templateUrl: './components/util/trsImageUpload/uploaderFull.html',
            link: function(scope, element, attr) {
                var accept = {
                    title: "Images",
                    extensions: 'gif,jpg,png',
                    mimeTypes: '.gif,.jpg,.png'
                };
                //指定按钮
                var picker = element[0].children[0].children[1];
                var uploader = WebUploader.create({
                    // 选完文件后，是否自动上传
                    auto: true,
                    // swf文件路径
                    // swf: BASE_URL + '/js/Uploader.swf',
                    swf: './webuploader/util/Uploader.swf',
                    server: "/wcm/openapi/uploadImageForMicroBlog",
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
                    fileSizeLimit: "5m",
                    prepareNextFile: true
                });
                //上传成功后
                uploader.on('uploadSuccess', function(file, src) {
                    $timeout(function() {
                        scope.fileName = src.imgName;
                        scope.fileDesc = src.imgName;
                        scope.uploaderSuccess = true;
                        if (file.ext != 'gif') {
                            scope.returnFile = src.imgSrc;
                        }
                    });
                });
                //上传失败后
                uploader.on('uploadError', function(file) {
                    $timeout(function() {
                        scope.info = "上传失败";
                    });
                });
                //文件加入队列
                uploader.on('filesQueued', function(file) {
                    $timeout(function() {
                        scope.uploaderSuccess = false;
                        if (file[0].ext == "gif") {
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
                 * [modifyImg description]图片修改
                 * @return {[type]} [description]
                 */
                scope.modifyImg = function() {
                    var modalInstance = $modal.open({
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

                    window.editCallback = uploaderImgeditCallback;
                };
                /**
                 * [uploaderImgeditCallback description]图片修改回掉函数
                 * @param  {[type]} params [description]
                 * @return {[type]}        [description]
                 */
                function uploaderImgeditCallback(params) {
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
                }
            }
        };
    }]);
