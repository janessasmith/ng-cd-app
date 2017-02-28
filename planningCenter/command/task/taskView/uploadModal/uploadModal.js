'use strict';
angular.module("uploadModalModule", []).controller('uploadModalCtrl', ['$scope', '$q', '$validation', '$timeout', '$http', '$stateParams', '$modalInstance', 'Upload', 'trsHttpService', 'selectItems', 'trsspliceString', 'trsconfirm', 'plancenterService', 'uploadAudioVideoService', function($scope, $q, $validation, $timeout, $http, $stateParams, $modalInstance, Upload, trsHttpService, selectItems, trsspliceString, trsconfirm, plancenterService, uploadAudioVideoService) {
    var appendix;
    initStatus();
    // 关闭
    $scope.close = function() {
        $modalInstance.dismiss();
    };
    //确定
    // $scope.sendInfo = function() {
    //     $validation.validate($scope.uploadForm).success(function() {
    //         handleSubmit();
    //     }).error(function(data) {
    //         if ($scope.status.selectedMedia !== 'text') {
    //             //trsconfirm.alertType("请先上传素材", "", "warning", false);
    //             if (angular.isDefined($scope.uploadForm.$error.appendixes)) {
    //                 trsconfirm.alertType("请先上传素材", "", "warning", false);
    //             } else {
    //                 handleSubmit();
    //             }
    //         }
    //     });
    // };
    $scope.sendInfo = function() {
        $validation.validate($scope.uploadForm).success(function() {
            submit("1", $scope.data.appendix);
        }).error(function(data) {
            if ($scope.status.selectedMedia !== 'text') {
                //trsconfirm.alertType("请先上传素材", "", "warning", false);
                if (angular.isDefined($scope.uploadForm.$error.appendixes)) {
                    trsconfirm.alertType("请先上传素材", "", "warning", false);
                };
            }
        });
    };
    $scope.chooseFile = function() {
        if ($scope.status.tempAppendix.length === 0) return;
        if (typeof $scope.data.appendix === "string") {
            $scope.data.appendix = [];
        }
        $scope.data.appendix = $scope.data.appendix.concat($scope.status.tempAppendix);
        $scope.status.formAppendix = $scope.data.appendix.length;
        delete $scope.status.tempAppendix;
    };

    function initStatus() {
        $scope.data = {
            appendix: '',
        };
        $scope.status = {
            selectedMedia: "text",
            uploadResult: [],
            uploadProgress: {},
        };
        //初始化上传音视频图片方法
        initUploadCallback();
        //初始化选择文件类型
        initFileType();
    }
    $scope.fileType = function() {
        // return plancenterService.uploadMap()[$scope.status.selectedMedia];
        return plancenterService.uploadType()[$scope.status.selectedMedia];
    };
    //初始化选择文件类型
    function initFileType() {
        $scope.status.uploadType = plancenterService.uploadType();
    }

    // $scope.deleteAppendix = function(index) {
    //     $scope.data.appendix.splice(index, 1);
    //     $scope.status.formAppendix = $scope.data.appendix.length === 0 ? "" : $scope.data.appendix.length
    // };

    // function uploadImg() {
    //     var deffer = $q.defer();
    //     appendix = [];
    //     var maxlength = $scope.data.appendix.length;
    //     var index = 0;
    //     upload($scope.data.appendix[index]);

    //     function upload(file) {
    //         Upload.upload({
    //             url: '/wcm/openapi/uploadImage',
    //             data: {
    //                 file: file
    //             }
    //         }).then(function(resp) {
    //             appendix.push(resp);
    //             index++;
    //             if (index < maxlength) {
    //                 upload($scope.data.appendix[index]);
    //             } else {
    //                 deffer.resolve();
    //             }
    //         });
    //     }
    //     return deffer.promise;
    // }

    function submit(flag, appendix) {
        var params = {
            serviceid: "mlf_task",
            methodname: "saveMaterial",
            TaskId: $stateParams.taskid,
            Appendix: appendix,
            Flag: flag,
        };
        trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "post").then(function(data) {
            if (data.ISSUCCESS == "true") {
                trsconfirm.alertType("上传成功！", "", "success", false, "");
                $modalInstance.close();
            }
        });
    }
    //提交前处理数据
    // function handleSubmit() {
    //     if ($scope.status.selectedMedia === "picture") {
    //         $scope.loadingPromise = uploadImg().then(function() {
    //             trsconfirm.alertType("上传素材成功", "", "success", false);
    //             var myAppendix = [];
    //             for (var i = 0; i < appendix.length; i++) {
    //                 myAppendix.push(appendix[i].data.imgName);
    //             }
    //             submit("2", myAppendix.join(","));
    //         });
    //     } else if ($scope.status.selectedMedia === "voice" || $scope.status.selectedMedia === "video") {
    //         $scope.loadingPromise = uploadAudioVideoService.uploadVoiceOrVideo($scope.data.appendix).then(function(data) {
    //             trsconfirm.alertType("上传素材成功", "", "success", false);
    //             submit($scope.status.selectedMedia === "voice" ? "3" : "4", trsspliceString.spliceString(data, "masId", ","));
    //         });
    //     } else {
    //         submit("1", $scope.data.appendix);
    //     }
    // };
    //上传音视频图片callback
    function initUploadCallback() {
        $scope.uploadCallback = {
            success: function(file, src, uploader) {
                if ($scope.status.selectedMedia === "picture") {
                    $scope.status.uploadResult.push(src.imgName);
                } else if ($scope.status.selectedMedia === "voice" || $scope.status.selectedMedia === "video") {
                    uploadAudioVideoService.submit(src).then(function(data) {
                        var currFile = file;
                        $scope.status.uploadProgress[currFile.id] = '100%';
                        $scope.status.uploadResult.push(data.masId);
                        if ($scope.status.uploadResult.length == $scope.data.appendix.length) {
                            trsconfirm.alertType("上传素材成功", "", "success", false);
                            submit($scope.status.selectedMedia === "voice" ? "3" : "4", $scope.status.uploadResult.join(','));
                        };
                    });
                };
                if ($scope.status.uploadResult.length == $scope.data.appendix.length) {
                    if ($scope.status.selectedMedia === "picture") {
                        trsconfirm.alertType("上传素材成功", "", "success", false);
                        submit("2", $scope.status.uploadResult.join(','));
                    };
                };
            },
            error: function(file) {},
            file: function(file, uploader) {
                $timeout(function() {
                    chooseFile(file);
                    //存储file
                    if (!!fileStore) {
                        fileStore = fileStore.concat(file);
                    } else {
                        var fileStore = file;
                    }
                    //删除
                    $scope.deleteAppendix = function(index) {
                        uploader.removeFile(fileStore[index].id)
                        $scope.data.appendix.splice(index, 1);
                        $scope.status.formAppendix = $scope.data.appendix.length === 0 ? "" : $scope.data.appendix.length
                    };
                    //确定提交
                    $scope.sendInfo = function() {
                        $validation.validate($scope.uploadForm).success(function() {
                            if ($scope.status.selectedMedia === 'text') {
                                submit("1", $scope.data.appendix);
                            } else {
                                uploader.upload();
                            }
                        }).error(function(data) {
                            if ($scope.status.selectedMedia !== 'text') {
                                //trsconfirm.alertType("请先上传素材", "", "warning", false);
                                if (angular.isDefined($scope.uploadForm.$error.appendixes)) {
                                    trsconfirm.alertType("请先上传素材", "", "warning", false);
                                } else {
                                    uploader.upload();
                                }
                            }
                        });
                    };
                });
            },
            tar: function(file, percentage) {
                var max = $scope.status.selectedMedia === "picture" ? 100 : 90,
                    per = Math.ceil(percentage * max) + "%";
                $timeout(function() {
                    $scope.status.uploadProgress[file.id] = per;
                    $scope.status.uploadMasNow = true;
                });
            },
            comp: function(file) {}
        }
    };
    //选择文件
    function chooseFile(file) {
        if (file.length === 0) return;
        if (typeof $scope.data.appendix === "string") {
            $scope.data.appendix = [];
        }
        $scope.data.appendix = $scope.data.appendix.concat(file);
        $scope.status.formAppendix = $scope.data.appendix.length;
    };
}]);
