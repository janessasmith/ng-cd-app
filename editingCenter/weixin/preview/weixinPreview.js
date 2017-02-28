/**
 * Created by zss in 2017-01-23
 */
'use strict';
angular.module('weixinPreviewModule', []).controller('WeiXinPreviewCtrl', ["$scope", "$sce", "$q", "$modal", "$timeout", "$state", "$location", "$window", "trsHttpService", "$stateParams", 'editcenterRightsService', 'trsconfirm', 'initVersionService', 'editingCenterService', 'websiteService', 'trsPrintService', 'trsPicturePreviewService', 'storageListenerService',
    function($scope, $sce, $q, $modal, $timeout, $state, $location, $window, trsHttpService, $stateParams, editcenterRightsService, trsconfirm, initVersionService, editingCenterService, websiteService, trsPrintService, trsPicturePreviewService, storageListenerService) {
        initStatus();
        initData();
        /**
         * [initStatus description]初始化页面参数
         * @return {[type]} [description]null
         */
        function initStatus() {
            $scope.data = {
                docType: {
                    0: "文字",
                    1: "图文",
                    2: "图片",
                    3: "音频",
                    4: "视频"
                },
            };
            $scope.status = {
                docType: $state.params.doctype,
                params: {
                    "serviceid": "nb_wechatdoc",
                    "WXChannelId": $state.params.wxchannelid,
                    "MetaDataId": $state.params.metadataid
                }
            };
        }
        /**
         * [initData description]初始化页面数据
         * @return {[type]} [description]
         */
        function initData() {
            $scope.status.params.methodname = $scope.status.docType == 'wxpicture' || $scope.status.docType == 'wxgraphic' ? 'getWeChatPicsDoc' : 'getWeChatDocNews';
            $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), $scope.status.params, 'post').then(function(data) {
                $scope.data.wechatDoc = data;
            });
        }
    }
]);
