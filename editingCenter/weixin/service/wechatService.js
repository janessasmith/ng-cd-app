"use strict";
angular.module('editingCenterWechatServiceModule', ["wechatMultiGraphicRankModule"]).
factory('editingCenterWechatService', ['$q', '$modal', '$state', 'trsHttpService', function($q, $modal, $state, trsHttpService) {
    return {
        imageMaxsize:2097152,//上传图片的最大限制(2M，单位是字)
        audioMaxsize:2097152,//上传音频的最大限制(2M),
        videoMaxsize:10485760,//上传视频的最大限制(10M)
        getWechatId: function(wxChannelId) {
            var defferd = $q.defer();
            var params = {
                serviceid: "wcm61_wxaccount",
                methodname: "queryAccountFindById",
                wxChannelId: wxChannelId
            };
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function(data) {
                defferd.resolve(data);
            });
            return defferd.promise;
        },
        /**
         * [multiDraftPend description]多个图文稿件送审
         * @param  {[Array]} data         [description]已选稿件
         * @param  {[fun]} success      [description]回调函数
         * @return {[type]}             [description]
         */
        multiDraftPend: function(metaDataIds, wxChannelId) {
            var defferd = $q.defer();
            var modalInstance = $modal.open({
                templateUrl: "./editingCenter/weixin/service/multiGraphic/multi_graphic_tpl.html",
                windowClass: 'wechat_multidraft_window',
                backdrop: false,
                controller: "wechatMultiGraphicRankCtrl",
                resolve: {
                    draftParams: function() {
                        return {
                            "data": metaDataIds,
                            "wxChannelId": wxChannelId,
                        };
                    }
                }
            });
            modalInstance.result.then(function(metaDataIds) {
                defferd.resolve(metaDataIds);
            });
            return defferd.promise;
        },
    };
}]);
