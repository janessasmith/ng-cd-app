/**
 * 图片编辑新建
 * Created by cc in 2016/12/09
 * modified by zss in 2016/12/12
 */
"use strict";
angular.module("resourceCenterVideoEditModule", [])
    .controller("resourceCenterVideoEditCtrl", ['$scope', '$q', '$timeout', '$state', '$validation', '$window', '$filter', '$stateParams', 'trsHttpService', 'trsconfirm', 'storageListenerService', 'resourceCenterMaterialService', 'trsspliceString', 'resCtrModalService', 'resourceCenterService', 'jsonArrayToStringService', 'editingCenterService', 'uploadAudioVideoService',
        function($scope, $q, $timeout, $state, $validation, $window, $filter, $stateParams, trsHttpService, trsconfirm, storageListenerService, resourceCenterMaterialService, trsspliceString, resCtrModalService, resourceCenterService, jsonArrayToStringService, editingCenterService, uploadAudioVideoService) {
            initStatus();
            initData();
            /**
             * [initStatus description] 初始化状态
             * @return {[type]} [description] null
             */
            function initStatus() {
                $scope.data = {
                    video: {
                        'MATERIALID': 0,
                        'MATERIALTYPE': 2, //视频
                        'TYPEIDS': "",
                        'TITLE': '',
                        'CONTENT': '',
                        'FILENAME': '',
                        'FILEPATH': '',
                        'KEYWORD': '',
                        'RELATEPERSON': '',
                        'RELATEPLACE': '',
                        'AUTHORS': '',
                        'PSTIME': new Date(),
                        "MASID": "",
                        // "AUDIOVIDEO": [],
                    },
                    picFilePath: '', //保存图片修改前的文件地址
                    selectClassify: [], //选择的分类集合
                };
                $scope.status = {
                    params: {
                        'serviceid': 'nb_material',
                        'methodname': 'findImgByID',
                        'materialId': $state.params.videoid,
                        'TypeID': $state.params.materialtypeid,
                    },
                    VIDEOMATERIALTYPE: 2, //音视频的分类类型为1
                    btnRights: "", //按钮权限
                    audioVideoidsArray: [], //播放音视频临时数组
                    uploadMasProgress: 0, //mas上传进度
                    uploadMasNow: false,
                    masUploadExtensions: 'mp3,mp4,flv,rmvb,avi', //接收的视频类型
                    masUploadMimeTypes: 'audio/mp3,video/mp4,video/flv,video/rmvb,video/avi'
                };
            }
            /**
             * [initData description] 初始化数据
             * @return {[type]} [description] null
             */
            function initData() {
                // getBtnRights(); //获得按钮权限
                initUploadMasFn();
                if ($state.params.videoid) {
                    requestData();
                }
            }

            function initUploadMasFn() {
                $scope.uploadMasCallBack = {
                    success: function(file, src, uploader) {
                        uploadAudioVideoService.submit(src).then(function(data) {
                            $scope.status.uploadMasProgress = '100%';
                            $scope.status.uploadMasNow = false;
                            // $scope.data.video.AUDIOVIDEO.push(data.masId);
                            $scope.data.video.MASID = data.masId;
                            $scope.status.audioVideoidsArray.push({ id: data.masId });
                            delete $scope.status.tempAppendix;
                        });
                    },
                    error: function(file) {},
                    file: function(file, uploader) {
                        uploader.upload();
                    },
                    tar: function(file, percentage) {
                        var per = Math.ceil(percentage * 90) + "%";
                        $timeout(function() {
                            $scope.status.uploadMasProgress = per;
                            $scope.status.uploadMasNow = true;
                        });
                    },
                    comp: function(file) {}
                };
            }
            /**
             * [requestData description] 数据请求
             * @return {[type]} [description]
             */
            function requestData() {
                trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), $scope.status.params, "post").then(function(data) {
                    $scope.data.video = data;
                    $scope.data.selectClassify = data.MATERIALTYPE;
                    $scope.data.video.MATERIALTYPE = $scope.status.VIDEOMATERIALTYPE;
                    angular.forEach(data.MASID.split(','), function(_data, index, array) {
                        $scope.status.audioVideoidsArray.push({ id: _data });
                    });//获得显示音视频的数组
                });
            }
            /**
             * [getBtnRights description]获得操作按钮权限
             * @return {[type]} [description]
             */
            function getBtnRights() {
                resourceCenterMaterialService.btnRights().then(function(data) {
                    $scope.status.btnRights = data;
                });
            }
            /**
             * [getAudioVideoPlayer description]获得播放地址
             * @param  {[obj]} item  [description]视频信息
             * @return {[type]}      [description]
             */
            $scope.getAudioVideoPlayer = function(item) {
                uploadAudioVideoService.getPlayerById(item.id || item.masId).then(function(data) {
                    if (angular.isDefined(data.err)) {
                        $timeout(function() {
                            $scope.getAudioVideoPlayer(item); //刷到视频上传成功为止
                        }, 10000);
                    }
                    item.value = data;
                });
            };
            /**
             * [downloadAudioVideo description]音视频下载
             * @param  {[obj]} item  [description]音视频信息
             * @return {[type]}      [description]
             */
            $scope.downloadAudioVideo = function(item) {
                uploadAudioVideoService.download(item.id || item.masId);
            };
            /**
             * [deleteAudioVideo description]音视频删除
             * @param  {[obj]} item  [description]音视频信息
             * @return {[type]}      [description]
             */
            $scope.deleteAudioVideo = function(item) {
                trsconfirm.confirmModel("删除音视频", "确定要删除选中的音/视频？", function() {
                    $scope.status.audioVideoidsArray = [];
                    $scope.data.video.MASID = "";
                    // for (var i = 0; i < $scope.list.AUDIOVIDEO.length; i++) {
                    //     if (item.id === $scope.list.AUDIOVIDEO[i]) {
                    //         $scope.list.AUDIOVIDEO.splice(i, 1);
                    //         break;
                    //     }
                    // }
                    // for (var j = 0; j < $scope.status.audioVideoidsArray.length; j++) {
                    //     if (item.id === $scope.status.audioVideoidsArray[j].id) {
                    //         $scope.status.audioVideoidsArray.splice(i, 1);
                    //         break;
                    //     }
                    // }
                });
            };
            /**
             * [confirm description] 确定保存
             * @return {[type]} [description] null
             */
            $scope.confirm = function() {
                saveVideo().then(function(data) {
                    pictureDataAfterSave(data);
                    // $scope.status.params.materialId = $state.params.videoid;
                    trsconfirm.saveModel("素材保存成功", "", "success");
                });
            };
            /**
             * [pictureDataAfterSave description] 素材新建保存后修改地址栏参数，再保存为编辑保存，不刷新页面
             * @param  {[string]} data [description] 素材id
             * @return {[type]}      [description] null
             */
            function pictureDataAfterSave(data) {
                $stateParams.videoid = data.replace(/\"/g, "");
                $state.transitionTo($state.current, $stateParams, {
                    reload: false
                });
            }
            /**
             * [close description]页面关闭
             * @return {[type]} [description]
             */
            $scope.close = function() {
                resourceCenterMaterialService.closeWinow($scope.videoEditform.$dirty).then(function() {
                    saveVideo().then(function() {
                        var opened = $window.open('about:blank', '_self');
                        opened.close();
                    });
                }, function() {
                    var opened = $window.open('about:blank', '_self');
                    opened.close();
                });
            };
            /**
             * [dealVideoBeforeSave description]保存前处理音视频属性
             * @return {[type]} [description]
             */
            function dealVideoBeforeSave() {
                if ($scope.status.audioVideoidsArray < 1) {
                    trsconfirm.alertType("音/视频未上传", "支持格式 “.mp3/.mp4/.flv/.rmvb/.avi”", "warning", false);
                    return;
                }
                if ($scope.data.selectClassify.length < 1) {
                    trsconfirm.alertType("请选择分类", "", "warning", false);
                    return;
                }
                $scope.data.video.serviceid = 'nb_material';
                $scope.data.video.methodname = 'save';
                $scope.data.video.PSTIME = $filter('date')($scope.data.video.PSTIME, 'yyyy-MM-dd');
                $scope.data.video.TYPEIDS = trsspliceString.spliceString($scope.data.selectClassify, 'MATERIALTYPEID', ","); //多分类
                $scope.data.video = jsonArrayToStringService.jsonArrayToString($scope.data.video);
            }
            /**
             * [save description] 保存音视频
             * @return {[type]} [description] promise
             */
            function saveVideo() {
                var deferred = $q.defer();
                $validation.validate($scope.videoEditform)
                    .success(function() {
                        dealVideoBeforeSave();
                        trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), $scope.data.video, "post").then(function(data) {
                            storageListenerService.addListenerToResource("VideoSaved");
                            $scope.videoEditform.$setPristine();
                            deferred.resolve(data);
                        });
                    }).error(function() {
                        editingCenterService.checkSaveError($scope.videoEditform);
                        trsconfirm.alertType("素材保存失败", "请检查填写项", "error", false);
                        deferred.reject();
                    });
                return deferred.promise;
            }
            /**
             * [selectClassify description]选择稿件所属分类
             * @type {[type]}
             */
            $scope.selectClassify = function() {
                var params = {
                    serviceid: "nb_material",
                    methodname: "getMaterialTypeTree",
                    materialtypeid: $state.params.topclassifyid
                };
                resourceCenterMaterialService.multipleClassify('分类选择', params, angular.copy($scope.data.selectClassify)).then(function(data) {
                    $scope.data.selectClassify = data;
                });
            };
        }
    ]);
