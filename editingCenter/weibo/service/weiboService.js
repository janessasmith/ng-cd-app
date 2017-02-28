"use strict";
angular.module('editingCenterWeiBoServiceModule', ['weiboProcessRecordModule', 'weiboGeneralBoxCreatModule'])
    .factory("editingCenterWeiBoService", ['$modal', function($modal) {
        return {
            autoRouter: function() {
                return {
                    DAIBIAN: "tobecompiled",
                    DAISHEN: "pending",
                    YIQIANFA: "signed",
                    WODEWEIBO: "myweibo",
                    GUANZHUDEWEIBO: "attention",
                    SHOUDAODEPINGLUN: "comment",
                    FACHUDEPINGLUN: "comment",
                    SHOUCANG: "collect",
                    ATWODEWEIBO: "me",
                    ATWODEPINGLUN: 'me'
                };
            },
            weiboProcessRecord: function(success) {
                var modalInstance = $modal.open({
                    templateUrl: "./editingCenter/weibo/service/weiboProcessRecord/weiboProcessRecord.html",
                    windowClass: 'weiboProcessRecord',
                    backdrop: false,
                    controller: 'weiboProcessRecordCtrl'
                });
                modalInstance.result.then(function() {
                    success();
                });
            },
            /**
             * [weiboGeneralBox description] 微博创建、编辑、转发弹框
             * @param  {[type]} success [description]
             * @return {[type]}         [description]
             */
            weiboGeneralBox: function(success) {
                var modalInstance = $modal.open({
                    templateUrl: "./editingCenter/weibo/service/weiboGeneralBox/weiboGeneralBoxCreat_tpl.html",
                    windowClass: 'weiboCreat',
                    backdrop: false,
                    controller: 'weiboGeneralBoxCreatCtrl'
                });
                modalInstance.result.then(function() {
                    success();
                });
            },
            // weiboGeneralBox: function(success) {
            //     var modalInstance = $modal.open({
            //         templateUrl: "./editingCenter/weibo/service/weiboCreat/creat_tpl.html",
            //         windowClass: 'weiboCreat',
            //         backdrop: false,
            //         controller: 'weiboGeneralBoxCreatCtrl'
            //     });
            //     modalInstance.result.then(function() {
            //         success();
            //     });
            // }
        };
    }]);
