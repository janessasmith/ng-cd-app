/**
 * created by zss on 2017/01/09.
 * modified by cc on 2017/01/09.
 * 新建视频
 */
'use strict';
angular.module('weiXinVideoModule', [])
    .controller('WeiXinVideoNewCtrl', ['$window', '$scope', '$state', '$stateParams', '$compile', '$timeout', '$q', '$validation', 'editingCenterAppService', 'uploadAudioVideoService', 'trsconfirm', 'trsHttpService', 'editingCenterService', 'storageListenerService', 'resourceCenterMaterialService', 'trsspliceString', 'jsonArrayToStringService', 'initWeiXinDataService','editingCenterWechatService',
        function($window, $scope, $state, $stateParams, $compile, $timeout, $q, $validation, editingCenterAppService, uploadAudioVideoService, trsconfirm, trsHttpService, editingCenterService, storageListenerService, resourceCenterMaterialService, trsspliceString, jsonArrayToStringService, initWeiXinDataService,editingCenterWechatService) {
            initStatus();
            initData();
            /**
             * [initStatus description] 初始化状态
             * @return {[type]} [description] null
             */
            function initStatus() {
                $scope.data = {
                    docGenres: editingCenterAppService.initDocGenre(), //稿件体裁
                    noPayment: 1, //不发稿费
                    payMent: 0, //发稿费
                    maxSize:editingCenterWechatService.videoMaxsize
                };
                $scope.status = {
                    audioVideoidsArray: [], //播放音视频临时数组
                    uploadMasProgress: 0,
                    uploadMasNow: false,
                    masUploadExtensions: 'mp4,flv,rmvb,avi',
                    masUploadMimeTypes: 'video/mp4,video/flv,video/rmvb,video/avi',
                    params: {
                        'serviceid': 'nb_wechatdoc',
                        'methodname': 'getWeChatDocNews',
                        "WXChannelId": $state.params.wxchannelid,
                        'MetaDataId': $state.params.metadataid,
                    },
                    wxStatus: $state.params.status,
                };
            }
            /**
             * [initData description] 初始化数据
             * @return {[type]} [description] null
             */
            function initData() {
                initUploadMasFn();
                loadDirective();
                $state.params.metadataid ? initEditData() : initNewData();
            }
            /**
             * [initNewData description]初始化新建页
             * @return {[type]} [description]
             */
            function initNewData() {
                $scope.video = initWeiXinDataService.initAudioVdieo(); //视频对象
            }
            /**
             * [initEditData description]初始化编辑页
             * @return {[type]} [description]
             */
            function initEditData() {
                trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), $scope.status.params, 'post').then(function(data) {
                    $scope.video = data;
                    angular.forEach(data.MASID.split(','), function(_data, index, array) {
                        $scope.status.audioVideoidsArray.push({ id: _data });
                    }); //获得显示音视频的数组
                });
            }
            /**
             * [initUploadMasFn description]初始化音视频上传方法
             * @return {[type]} [description]
             */
            function initUploadMasFn() {
                $scope.uploadMasCallBack = {
                    success: function(file, src, uploader) {
                        uploadAudioVideoService.submit(src).then(function(data) {
                            $scope.status.uploadMasProgress = '100%';
                            $scope.status.uploadMasNow = false;
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
             * [getAudioVideoPlayer description] 音视频转码
             * @param  {[obj]} item [description] 音视频信息
             * @return {[type]}      [description] null
             */
            $scope.getAudioVideoPlayer = function(item) {
                uploadAudioVideoService.getPlayerById(item.id).then(function(data) {
                    if (angular.isDefined(data.err)) {
                        $timeout(function() {
                            $scope.getAudioVideoPlayer(item); //刷到上传成功为止
                        }, 10000);
                    }
                    item.value = data;
                });
            };
            /**
             * [loadDirective description] 动态加载发稿单编辑信息和作者信息
             * @return {[type]} [description]
             */
            function loadDirective() {
                var draftList = '<editor-dir meta-data-id="{{video.ObjectId}}" editor-json="video.FGD_EDITINFO" show-all-tips="showAllTips" editor-form="newsForm"></editor-dir>' +
                    '<editor-auth-dir author="video.FGD_AUTHINFO"></editor-auth-dir>';
                draftList = $compile(draftList)($scope);
                $($(angular.element(document)).find('editor')).append(draftList);
            }
            /**
             * [updateCKSelection description] 是否不发稿费
             * @param  {[string]} attr [description] 属性
             * @return {[type]}      [description] null
             */
            $scope.updateCKSelection = function(attr) {
                $scope.video[attr] = $scope.video[attr] == $scope.data.noPayment ? $scope.data.payMent : $scope.data.noPayment;
            };
            /**
             * [save description] 确定保存视频
             * @return {[type]} [description] null
             */
            $scope.save = function() {
                saveVideo().then(function(data) {
                    trsconfirm.saveModel("视频保存成功", "", "success");
                });
            };
            /**
             * [saveVideo description] 保存视频
             * @return {[object]} promise 
             */
            function saveVideo() {
                var deffer = $q.defer();
                $validation.validate($scope.videoForm.authorForm); //发稿单表单校验
                $validation.validate($scope.videoForm)
                    .success(function() {
                        var video = dealVideoBeforeSave();
                        trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), video, 'post').then(function(data) {
                            $scope.videoForm.$setPristine();
                            dealVideoAfterSave(data);
                            deffer.resolve(data);
                        });
                    }).error(function() {
                        editingCenterService.checkSaveError($scope.videoForm);
                        trsconfirm.alertType("视频保存失败", "请检查填写项", "error", false);
                        deffer.reject();
                    });
                return deffer.promise;
            }
            /**
             * [dealVideoBeforeSave description] 保存前处理video信息
             * @return {[type]} [description] null
             */
            function dealVideoBeforeSave() {
                if ($scope.status.audioVideoidsArray.length < 1 && !$scope.status.uploadMasNow) {
                    trsconfirm.alertType("视频未上传", "支持格式 “.mp4/.flv/.rmvb/.avi”", "warning", false);
                    return;
                } else if ($scope.status.uploadMasNow) {
                    trsconfirm.alertType("视频正在上传", "请稍等...", "warning", false);
                    return;
                }
                var video = angular.copy($scope.video);
                video.serviceid = 'nb_wechatdoc';
                video.methodname = 'saveWeChatVideo';
                video.WXChannelId = $state.params.wxchannelid; //微信账号ID
                video.MasId = trsspliceString.spliceString($scope.status.audioVideoidsArray, 'id', ',');
                if (angular.isDefined(video.FGD_AUTHINFO[0]) && (!angular.isDefined(video.FGD_AUTHINFO[0].USERNAME) || video.FGD_AUTHINFO[0].USERNAME === "")) {
                    video.FGD_AUTHINFO = [];
                }
                video = jsonArrayToStringService.jsonArrayToString(video);
                return video;
            }
            /**
             * [dealVideoAfterSave description] 保存后信息处理
             * @param  {[object]} data [description] 保存后返回数据
             * @return {[type]}      [description] null
             */
            function dealVideoAfterSave(data) {
                storageListenerService.addListenerToWeixin("save");
                $scope.video.MetaDataId = data.METADATAID;
                $scope.video.CHNLDOCID = data.CHNLDOCID;
                $stateParams.metadataid = data.METADATAID;
                $state.transitionTo($state.current, $stateParams, {
                    reload: false
                });
            }
            /**
             * [close description] 关闭页面
             * @return {[type]} [description] null 
             */
            $scope.close = function() {
                resourceCenterMaterialService.closeWinow($scope.audioForm.$dirty).then(function() {
                    saveVideo().then(function() {
                        $window.open('about:blank', '_self').close();
                    }, function() {
                        $window.open('about:blank', '_self').close();
                    });
                });
            };
        }
    ]);
