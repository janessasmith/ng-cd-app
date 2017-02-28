"use strict";
/**
 * created by cc 2016-4-13
 * 图集稿，碎片化图片上传指令
 */
angular.module('trsMasUploadDirective', [])
    .directive('trsMasUpload', ['$timeout', 'trsHttpService', 'trsconfirm', function($timeout, trsHttpService, trsconfirm) {
        return {
            restrict: 'EA',
            replace: true,
            transclude: true,
            scope: {
                diruploadSrc: "=",
                diruploadName: "=",
                callBack: "=",
                extensions: '=',
                mimeTypes: '=',
                multiple: '=',
                maxSize: "=", //上传的大小限制
            },

            templateUrl: './components/util/trsMasUpload/trsMasUpload_tpl.html',
            controller: function($scope, $element) {},
            link: function(scope, element, attr) {
                scope.status = {
                    info: {
                        F_EXCEED_SIZE: '音视频超过' + parseInt(scope.maxSize) / 1024 / 1024 + 'm，请重新上传',
                        // Q_EXCEED_NUM_LIMIT:'每次上'
                    }
                };
                var accept = {
                    title: "masUpload",
                    // extensions: 'mp3,mp4,flv,rmvb,avi',
                    // mimeTypes: 'audio/mp3,video/mp4,video/flv,video/rmvb,video/avi'
                    extensions: scope.extensions,
                    mimeTypes: scope.mimeTypes
                };
                var server = attr.src;
                var uploader = WebUploader.create({
                    // 选完文件后，是否自动上传
                    auto: false,
                    // swf文件路径
                    // swf: BASE_URL + '/js/Uploader.swf',
                    swf: './webuploader/util/Uploader.swf',
                    server: trsHttpService.getMasUploadUrl(),
                    // 选择文件的按钮。可选。
                    // 内部根据当前运行是创建，可能是input元素，也可能是flash.
                    threads: 10,
                    pick: {
                        id: element[0],
                        label: attr.innerName,
                        multiple: scope.multiple
                    },
                    // 只允许选择图片文件。
                    method: 'POST',
                    compress: false,
                    //接收文件的类型
                    accept: accept,
                    fileSingleSizeLimit: scope.maxSize || 104857600, //不传入时默认音视频大小为100M
                    duplicate: true,
                    fileVal: 'uf',
                    formData: {
                        enctype: 'multipart/form-data'
                    },
                });
                var tempFilesQueued = [];
                uploader.on('filesQueued', function(file) {
                    if(file.length<1) return;
                    scope.callBack.file(file, uploader);
                });
                uploader.on('error', function(handler) {
                    trsconfirm.alertType('上传失败', scope.status.info[handler], "error", false);
                });
                uploader.on('uploadSuccess', function(file, src) {
                    scope.callBack.success(file, src);
                });
                uploader.on('uploadError', function(file) {
                    scope.callBack.error(file);
                });
                uploader.on('uploadProgress', function(file, percentage) {
                    scope.callBack.tar(file, percentage);
                });
                uploader.on('uploadComplete', function(file) {
                    scope.callBack.comp(file);
                });
            }
        };
    }]);
