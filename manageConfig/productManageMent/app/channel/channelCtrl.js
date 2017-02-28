"use strict";
/**
 * Created by MRQ in 2016/1/8.
 * Modified by zss in 2016/11/22 重构频道栏目新建编辑
 */
angular.module("mangeProAppChannelCtrlModule", [])
    .controller('appchannelDeleteCtrl', ['$scope', "$modalInstance", "item", "successFn", "productMangageMentAppService", function($scope, $modalInstance, item, successFn, productMangageMentAppService) {
        init();
        $scope.cancel = function() {
            $scope.$close();
        };
        $scope.confirm = function() {
            $modalInstance.close({});
        };
        $scope.deleteToggle = function() {
            $scope.isDeleteFirst = true;
        };

        function init() {
            $scope.item = item;
            $scope.isDeleteFirst = false;
        }
    }])
    .controller("appchannelModifyCtrl", ["$scope", "$state", "$stateParams", "$modalInstance", "$modal", "$validation", "$timeout", "trsHttpService", "trsconfirm", "channelObj", "productMangageMentAppService", 'jsonArrayToStringService',
        function($scope, $state, $stateParams, $modalInstance, $modal, $validation, $timeout, trsHttpService, trsconfirm, channelObj, productMangageMentAppService, jsonArrayToStringService) {
            initStatus();
            initData();
            /**
             * [initStatus description] 初始化状态
             * @return {[type]} [description] null
             */
            function initStatus() {
                $scope.column = channelObj.column; //弹框名称
                $scope.channel = {
                    'TopChannelId': $state.params.parentchnl ? $state.params.parentchnl : 0, //所属频道id
                    'TEMPID': {
                        'CHNLTEMPID': 0,
                        'OTHERTEMPID': 0,
                        'DOCTEMPID': 0,
                    },
                    'SITEID': $state.params.site,
                    'ROOTDOMAIN': '',
                    'PARENTID': $state.params.channel ? $state.params.channel : 0, //父栏目id
                    'DATAPATH': "",
                    'CHNLORDER': "",
                    'CHNLNAME': "",
                    'CHNLDESC': "",
                    'CHNLDATAPATH': "",
                    'OBJECTID': 0,
                    'VIEWINFOID': '' //绑定视图
                };
                $scope.tempName = {
                    'channelTempName': '',
                    'otherTempName': '',
                    'articleTempName': '',
                    'bindViewTempName': '' //绑定视图,对应channel中viewInfoId的描述
                };
                $scope.appChannelsJson = [{
                    CHNLNAME: '最前面',
                    CHNLORDER: '-1',
                }].concat(angular.copy(channelObj.appItems)); //前一频道下拉options,获得所有的频道
                $scope.selectedWebChannel = angular.copy(channelObj.appChannelIndex < 0 ? $scope.appChannelsJson[0] : $scope.appChannelsJson[channelObj.appChannelIndex]); //前一频道选中项
                $scope.isSendRequest = true; //编辑栏目唯一标识时是否可发送请求
            }
            /**
             * [initData description] 初始化数据（修改频道时请求频道存放位置）
             * @return {[type]} [description] null
             */
            function initData() {
                if (channelObj.appChannelIndex != -1) {
                    requestData();
                }
            }
            /**
             * [requestData description] 请求数据
             * @return {[type]} [description] null
             */
            function requestData() {
                var params = {
                    'serviceid': 'mlf_appconfig',
                    'methodname': 'findChannelById',
                    'TopChannelId': $state.params.parentchnl ? $state.params.parentchnl : 0,
                    'ChannelId': $scope.appChannelsJson[channelObj.appChannelIndex + 1].CHANNELID, //拿到当前频道的频道id
                };
                trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, 'post').then(function(data) {
                    setChannel(data);
                });
            }
            /**
             * [setChannel description] 设置channel属性
             * @param {[type]} data [description] 请求到数据
             * @return {[type]} [description] null
             */
            function setChannel(data) {
                $scope.channel = data;
                $scope.channel.OBJECTID = $scope.channel.CHANNELID;
                $scope.channel.VIEWINFOID = $scope.channel.VIEWINFO.VIEWINFOID; //便于后续处理过多信息
                $scope.channel.TEMPID = {
                    'CHNLTEMPID': data.GAILANTEMP[0] ? data.GAILANTEMP[0].TEMPID : 0,
                    'OTHERTEMPID': data.OTHERTEMP[0] ? data.OTHERTEMP[0].TEMPID : 0,
                    'DOCTEMPID': data.DOCTEMP[0] ? data.DOCTEMP[0].TEMPID : 0,
                };
                $scope.tempName = {
                    'channelTempName': data.GAILANTEMP[0] ? data.GAILANTEMP[0].TEMPNAME : '',
                    'otherTempName': data.OTHERTEMP[0] ? data.OTHERTEMP[0].TEMPNAME : '',
                    'articleTempName': data.DOCTEMP[0] ? data.DOCTEMP[0].TEMPNAME : '',
                    'bindViewTempName': data.VIEWINFO ? data.VIEWINFO.VIEWDESC : '', //绑定视图
                };
                $scope.channel.DOCTEMP = null;
                $scope.channel.GAILANTEMP = null;
                $scope.channel.OTHERTEMP = null;
            }
            /**
             * [confirm description] 保存频道
             * @return {[type]} [description] null
             */
            $scope.confirm = function() {
                $validation.validate($scope.createChlForm)
                    .success(function() {
                        if ($scope.isChnlExist == '"true"') {
                            trsconfirm.alertType("栏目唯一标识已经存在", "", "error", false);
                            return;
                        } else if ($scope.savePos == 'false') {
                            trsconfirm.alertType("栏目存放位置已存在", "", "error", false);
                            return;
                        }
                        $scope.channel.serviceid = 'mlf_appconfig';
                        $scope.channel.methodname = 'saveNewChnl';
                        $scope.channel.CHNLORDER = $scope.selectedWebChannel.CHNLORDER;
                        $scope.channel = jsonArrayToStringService.jsonArrayToString($scope.channel);
                        trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), $scope.channel, 'post').then(function(data) {
                            $modalInstance.close();
                        });
                    }).error(function() {
                        trsconfirm.alertType("保存失败", "请检查填写项", "warning", false);
                    });
            };
            /**
             * [checkIdentify description] 监听唯一标识是否存在
             * @return {[type]} [description] null
             */
            $scope.checkIdentify = function() {
                if($scope.channel.CHNLNAME==='') return;
                var params = {
                    'serviceid': 'mlf_appconfig',
                    'methodname': 'checkChannelNameExists',
                    'CHANNELID': $scope.channel.OBJECTID,
                    'CHNLNAME': $scope.channel.CHNLNAME,
                    'SITEID': $state.params.site,
                };
                trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, 'post').then(function(data) {
                    $scope.isChnlExist = data;
                });
                // var timeout;
                // if ($scope.isSendRequest) {
                //     if($scope.channel.CHNLNAME=='') return;
                //     if (timeout) {
                //         $timeout.cancel(timeout);
                //     }
                //     timeout = $timeout(function() {
                //         $scope.isSendRequest = true;
                //     },100);
                //     $scope.isSendRequest = false;
                // }
            };
            /**
             * [examinePos description] 监听存放地址
             * @return {[type]} [description] null
             */
            $scope.examinePos = function() {
                if ($scope.channel.CHNLDATAPATH) {
                    var params = {
                        'serviceid': 'mlf_websiteconfig',
                        'methodname': 'checkChannelPath',
                        'Siteid': $state.params.site,
                        'DataPath': $scope.channel.CHNLDATAPATH,
                        'ChannelId': $scope.channel.OBJECTID,
                    };
                    trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, 'post').then(function(data) {
                        $scope.savePos = data;
                    });
                }
            };
            /**
             * [chnlTemplate description] 打开频道/栏目模板（概览）
             * @return {[type]} [description] null
             */
            $scope.chnlTemplate = function() {
                openTemplate(1, 'CHNLTEMPID', 'channelTempName');
            };
            /**
             * [chnlOtherTemplate description] 打开频道/栏目其他模板（概览）
             * @return {[type]} [description] null
             */
            $scope.chnlOtherTemplate = function() {
                openTemplate(1, 'OTHERTEMPID', 'otherTempName');
            };
            /**
             * [chnlOtherTemplate description] 打开默认文章模板（细览）
             * @return {[type]} [description] null
             */
            $scope.defaultArticleTemplate = function() {
                openTemplate(2, 'DOCTEMPID', 'articleTempName');
            };
            /**
             * [bindViewTemplate description] 打开绑定视图模板
             * @return {[type]} [description] null
             */
            $scope.bindViewTemplate = function() {
                productMangageMentAppService.bindViewTemplate($scope.channel.VIEWINFO, '选择视图', function(data) {
                    $scope.channel.VIEWINFOID = data.VIEWINFOID;
                    $scope.tempName.bindViewTempName = data.VIEWDESC;
                });
            };
            /**
             * [openTemplate description] 打开模板弹窗
             * @return {[type]} [description]
             */
            function openTemplate(templateType, tempId, name) {
                var params = {
                    'ObjectType': $state.params.channel || $scope.channel.CHANNELID ? '101' : '103',
                    'TempName': '',
                    'TEMPLATETYPE': templateType,
                };
                /**
                 * 修改：ObjectId = appItem.CHANNELID（本身的id）
                 * 新增：1.新增频道 ObjectId = site
                 *       2.新增栏目 ObjectId = channel
                 */
                if ($scope.channel.CHANNELID) { //编辑
                    params.ObjectId = $scope.channel.CHANNELID;
                } else { //新建
                    params.ObjectId = $state.params.channel ? $state.params.channel : $state.params.site;
                }
                params.TEMPID = $scope.channel.TEMPID[tempId];
                productMangageMentAppService.bindTemplate(params, function(data) {
                    $scope.channel.TEMPID[tempId] = data.TEMPID;
                    $scope.tempName[name] = data.TEMPNAME;
                });
            }
            /**
             * [cancel description] 关闭模态框
             * @return {[type]} [description] null 
             */
            $scope.cancel = function() {
                $modalInstance.dismiss();
            };
        }
    ]);
