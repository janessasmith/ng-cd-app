'use strict';
/**
 *  Module
 *
 * Description
 */
angular.module('flieUploadCtrlModule', []).controller('flieUploadCtrl', ['$scope', '$filter', '$q', '$validation', 'Upload', 'pathArray', 'templateOnly', 'currItems', 'trsconfirm', '$stateParams', "$window", "trsHttpService", "$modalInstance", 'trsspliceString',
    function($scope, $filter, $q, $validation, Upload, pathArray, templateOnly, currItems, trsconfirm, $stateParams, $window, trsHttpService, $modalInstance, trsspliceString) {
        initstatus();

        function initstatus() {
            $scope.status = {
                isUploaderFile: '',
                showFiles: [],
                ATTACHFILE: [],
                WCMFILENAMES: [],
                file: [],
                templateOnly: templateOnly,
                successUpload: 0,
                repeatName: [],
            };
            $scope.data = {
                items: currItems,
            };
        }
        /**********************************************附件上传开始**********************************************/
        /**
         * [selectFiles description]选择文件
         * @param  {[type]} files    [description]所有文件
         * @param  {[type]} file     [description]
         * @param  {[type]} newFiles [description]新增的文件
         * @return {[type]}          [description]
         */
        $scope.selectFiles = function(files, file, newFiles) {
            $scope.status.isUploaderFile = true;
            // angular.forEach(newFiles, function(value, key) {
            //     if ($scope.status.templateOnly) {
            //         if(value.name.substr(value.name.lastIndexOf('.')+1).toLowerCase!='zip'){

            //         }
            //     }
            //     $scope.status.showFiles.push({
            //         SRCFILE: newFiles[key].name,
            //         APPDESC: newFiles[key].name,
            //         FILEINFO: "等待上传",
            //         FILE: newFiles[key],
            //     });
            // });
            var notZipOnly = false;
            for (var i = 0; i < newFiles.length; i++) {
                if ($scope.status.templateOnly) {
                    if (newFiles[i].name.substr(newFiles[i].name.lastIndexOf('.') + 1).toLowerCase() != 'zip') {
                        notZipOnly = true;
                        continue;
                    }
                }
                $scope.status.showFiles.push({
                    SRCFILE: newFiles[i].name,
                    APPDESC: newFiles[i].name,
                    FILEINFO: "等待上传",
                    FILE: newFiles[i],
                });
            }
            if ($scope.status.templateOnly && notZipOnly) trsconfirm.alertType('只能上传zip', '', 'warning', false);
            // if ($scope.status.templateOnly && notZipOnly && newFiles.length == 1) trsconfirm.alertType('只能上传zip', '', 'warning', false);
            // if ($scope.status.templateOnly && (newFiles.length > 1 || $scope.status.showFiles.length > 1)) {
            //     $scope.status.showFiles.length = 1;
            //     trsconfirm.alertType('一个只能上传一个模板', '', 'warning', false);
            // }
        };
        /**
         * [getAttachFile description]为ATTACHFILE重新复制，可更改
         * @return {[type]} [description]null
         */
        function saveAttachFile() {
            $scope.status.ATTACHFILE = [];
            $scope.status.WCMFILENAMES = [];
            angular.forEach($scope.status.showFiles, function(value, key) {
                if (value.FILEINFO === '上传成功') {
                    delete value.FILE;
                    $scope.status.ATTACHFILE = $scope.status.ATTACHFILE.concat(value.SRCFILE);
                    $scope.status.WCMFILENAMES = $scope.status.WCMFILENAMES.concat(value.APPFILE);
                }
            });
        }

        function reWriteAttachFile(data) {
            $scope.status.showFiles = angular.copy(data.ATTACHFILE);
            angular.forEach($scope.status.showFiles, function(value, key) {
                value.FILEINFO = "上传成功";
            });
        }
        /**
         * [fileSubmit description]附件提交
         * @return {[type]} [description]
         */
        $scope.fileSubmit = function() {
            $validation.validate($scope.cloudFileUpload).success(function() {
                if ($scope.status.showFiles) {
                    // if (isSameName()) return;
                    isSameName().then(function() {
                        angular.forEach($scope.status.showFiles, function(file, key) {
                            if (file.FILEINFO === '等待上传') {
                                Upload.upload({
                                    url: "/wcm/openapi/uploadFile",
                                    data: {
                                        file: file.FILE
                                    },
                                }).then(function(resp) {
                                    if (resp.data.success) {
                                        $scope.status.WCMFILENAMES = [];
                                        file.FILEINFO = '上传成功';
                                        file.APPFILE = resp.data.imgName;
                                        $scope.status.WCMFILENAMES = resp.data.imgName;
                                        $scope.status.successUpload++;
                                    } else {
                                        file.FILEINFO = resp.data.error;
                                        //如果是上传失败的情况重新打开开关
                                        // $scope.status.isUploaderFile=true
                                    }
                                }, function(resp) {

                                }, function(evt) {
                                    // file.progressPercentage = parseInt(100.0 * evt.loaded / evt.total) + '%';
                                    file.FILEINFO = "上传中";
                                });
                                $scope.status.isUploaderFile = false;
                            }
                        });
                    })
                } else {
                    trsconfirm.saveModel("附件上传失败", "附件填写有误", "error");
                }
            });
        };
        /**
         * [singleReUpload description]单独重新上传
         */
        $scope.singleReUpload = function(file) {
            $validation.validate($scope.cloudFileUpload).success(function() {
                // if (isSameName()) return;
                isSameName().then(function() {
                    Upload.upload({
                        url: "/wcm/openapi/uploadFile",
                        data: {
                            file: file.FILE
                        },
                    }).then(function(resp) {
                        if (resp.data.success) {
                            $scope.status.WCMFILENAMES = [];
                            file.FILEINFO = '上传成功';
                            file.APPFILE = resp.data.imgName;
                            $scope.status.WCMFILENAMES = resp.data.imgName;
                            $scope.status.successUpload++;
                        } else {
                            file.FILEINFO = resp.data.error;
                            console.log(resp.data.error);
                            //如果是上传失败的情况重新打开开关
                            // $scope.status.isUploaderFile=true
                        }
                    }, function(resp) {

                    }, function(evt) {
                        // file.progressPercentage = parseInt(100.0 * evt.loaded / evt.total) + '%';
                        file.FILEINFO = "上传中";
                    });
                })
            });
        };
        /**
         * [isSameName description]判断是否重名
         */
        // function isSameName() {
        //     var data = {
        //         ISSUCCESS: "false",
        //         REPORTS: [],
        //         TITLE: "文件上传",
        //     };
        //     // { TITLE: "收藏稿件", ISSUCCESS: "false", TYPE: "5", DETAIL: "专题稿件【cs】不能收藏" }
        //     angular.forEach($scope.status.showFiles, function(file, key) {
        //         angular.forEach($scope.data.items, function(item, index) {
        //             if (item.ISDIRECTORY == "false" && item.NAME == file.APPDESC) {
        //                 data.REPORTS.push({
        //                     'TITLE': '上传文件',
        //                     'ISSUCCESS': 'false',
        //                     'TYPE': '5',
        //                     'DETAIL': '文件名【' + file.APPDESC + "】已存在！"
        //                 });
        //             }
        //         });
        //     });
        //     if (data.REPORTS.length > 0) {
        //         trsconfirm.multiReportsAlert(data, "");
        //         return true;
        //     } else {
        //         return false;
        //     }
        // };
        function isSameName() {
            var defer = $q.defer(),
                repeatResult = [];
            angular.forEach($scope.status.showFiles, function(file, key) {
                angular.forEach($scope.data.items, function(item, index) {
                    if (item.ISDIRECTORY == "false" && item.NAME == file.APPDESC) {
                        repeatResult.push(file.APPDESC);
                    }
                });
            });
            if (repeatResult.length > 0) {
                var repeatName = '';
                angular.forEach(repeatResult, function(value, key) {
                    repeatName += '【' + value + '】、';
                    key == repeatResult.length - 1 && (repeatName = repeatName.substr(0, repeatName.length - 1));
                });
                trsconfirm.alertType('是否覆盖', '文件' + repeatName + '已有重名文件，将会覆盖原文件，是否继续',
                    'warning', true,
                    function() {
                        defer.resolve();
                    },
                    function() {
                        defer.reject();
                    });
            } else {
                defer.resolve();
            }
            return defer.promise;
        };
        /**
         * [isRepeatName description]判断是否和当前目录有重名
         */
        function isRepeatName() {
            // $scope.status.repeatName = [];
            // var hash = {};
        };
        /**
         * [removeCurFile description]移除当前附件
         * @param  {[obj]} file  [description]被选中的附件
         * @param  {[num]} index [description]附件下标
         * @return {[type]}       [description]
         */
        $scope.removeCurFile = function(file, index) {
            $scope.status.showFiles.splice($scope.status.showFiles.indexOf(file), 1);
            // $scope.status.successUpload++;
            file.FILEINFO == '上传成功' && $scope.status.successUpload--;
        };

        $scope.confirm = function() {
            if ($scope.status.WCMFILENAMES.length > 0) {
                //如果有正在上传的就禁止确定
                if (isUploading()) return;
                saveAttachFile();
                // var path=pathArray.pathArray.length>1?pathArray.pathArray.join('/')+'/':'/';
                if ($scope.status.templateOnly) {
                    var params = {
                        "serviceid": "mlf_websitefile",
                        "methodname": "importTemplate",
                        "ChannelId": $stateParams.channelid,
                        "FilePath": pathArray.pathArray,
                        "FileName": $scope.status.WCMFILENAMES.join(','),
                    };
                    $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, 'get').then(function(url) {
                        $modalInstance.close("success");
                    });
                } else {
                    /*解压操作开始*/
                    var hasZip = false,
                        zipATTACHFILE = [],
                        zipWCMFILENAMES = [],
                        isUnzipFile = false;
                    for (var i = 0; i < $scope.status.ATTACHFILE.length; i++) {
                        if ($scope.status.ATTACHFILE[i].indexOf('.zip') > -1) {
                            hasZip = true;
                            zipATTACHFILE.push($scope.status.ATTACHFILE[i]);
                            zipWCMFILENAMES.push($scope.status.WCMFILENAMES[i]);
                        }
                    }
                    if (hasZip && $scope.status.showFiles.length == 1) {
                        trsconfirm.cloudConfirmModel("提示信息", "本次上传含有Zip文件，是否解压",
                            function() {
                                isUnzipFile = true;
                                var params = {
                                    "serviceid": "mlf_websitefile",
                                    "methodname": "saveFile",
                                    "SiteId": $stateParams.siteid,
                                    "ChannelId": $stateParams.channelid,
                                    "SrcFileNames": $scope.status.ATTACHFILE.join(','),
                                    'WCMFileNames': $scope.status.WCMFILENAMES.join(','),
                                    "ParentPathName": pathArray.pathArray,
                                    "IsUnzipFile": true
                                };
                                $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, 'get').then(function(url) {
                                    $modalInstance.close("success");
                                });
                            },
                            function() {
                                var params = {
                                    "serviceid": "mlf_websitefile",
                                    "methodname": "saveFile",
                                    "SiteId": $stateParams.siteid,
                                    "ChannelId": $stateParams.channelid,
                                    "SrcFileNames": $scope.status.ATTACHFILE.join(','),
                                    'WCMFileNames': $scope.status.WCMFILENAMES.join(','),
                                    "ParentPathName": pathArray.pathArray,
                                };
                                $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, 'get').then(function(url) {
                                    $modalInstance.close("success");
                                });
                            }); /*解压操作结束*/
                    } else {
                        var params = {
                            "serviceid": "mlf_websitefile",
                            "methodname": "saveFile",
                            "SiteId": $stateParams.siteid,
                            "ChannelId": $stateParams.channelid,
                            "SrcFileNames": $scope.status.ATTACHFILE.join(','),
                            'WCMFileNames': $scope.status.WCMFILENAMES.join(','),
                            "ParentPathName": pathArray.pathArray,
                        };
                        $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, 'get').then(function(url) {
                            $modalInstance.close("success");
                        });
                    }
                }
            } else {
                trsconfirm.alertType("请上传文件", "", "warning", false, function() {});
            }
        };
        /**
         * [isUploading description]检查是否有正在上传的
         */
        function isUploading() {
            var flag = false;
            for (var i = 0; i < $scope.status.showFiles.length; i++) {
                if ($scope.status.showFiles[i].FILEINFO == "上传中") {
                    flag = true;
                    return flag;
                }
            }
            return flag;
        }

        $scope.cancel = function() {
            $modalInstance.close();
        };

    }
]);
