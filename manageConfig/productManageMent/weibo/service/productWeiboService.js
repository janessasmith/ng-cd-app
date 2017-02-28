"use strict";
angular.module('productManageMentWeiboServiceModule', ["bangdingWeiboAccountModule", "weiboAccountExtensionModule"])
    .factory("productManageMentWeiboService", ['$q', '$modal',"trsHttpService", "globleParamsSet" ,function($q, $modal,trsHttpService, globleParamsSet) {
        return {
             /**
             * [getRight description]获取微博操作权限
             * @return object [description]
             */
            getRight: function(AccountId, classify) {
                var deffer = $q.defer();
                var params = {
                    serviceid: "mlf_metadataright",
                    methodname: "queryOperKeyOfWeiBo",
                    AccountId: AccountId,
                    Classify: classify
                };
                trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get")
                    .then(function(data) {
                        var right = {};
                        for(var i = 0; i<data.length;i++){
                            right[data[i].OPERNAME.split(".")[2]] = true;
                        }
                        deffer.resolve(right);
                    });
                return deffer.promise;
            },
            /**
             * [bangdingWeibo description] 账号延期
             * @return {[type]} [description]
             */
            bangdingWeibo: function(success) {
                var modalInstance = $modal.open({
                    templateUrl: "./manageConfig/productManageMent/weibo/service/bangdingWeiboAccount/bangdingWeiboAccount.html",
                    windowClass: 'bangding-weiboAccount',
                    backdrop: false,
                    controller: "bangdingWeiboAccountCtrl"
                });
                modalInstance.result.then(function(result) {
                    success(result);
                });

            },
            /**
             * [AccountExtension description] 绑定微博账号
             * @return {[type]} [description]
             */
            AccountExtension: function(success) {
                var modalInstance = $modal.open({
                    templateUrl: "./manageConfig/productManageMent/weibo/service/weiboAccountExtension/weiboAccountExtension.html",
                    windowClass: 'weibo-account-extension',
                    backdrop: false,
                    controller: "weiboAccountExtensionCtrl"
                });
                modalInstance.result.then(function(result) {
                    success(result);
                });
            }
        };
    }]);
