"use strict";
//创建人：bai.zhiming
//日期：2016-8-24
//描述：产品管理微信服务
angular.module("productManagementWeixinServiceModule", ["productManageMentWeixinSubscriptionModifyModule", "createWxAccountModule"])
    .factory("productManagementWeixinService", ["$q", "trsHttpService", "$modal", function($q, trsHttpService, $modal) {
        return {
            /**
             * [getOperRight description]获取微信渠道操作权限
             * @return obj [description]
             */
            getOperRight: function() {
                var deffer = $q.defer();
                var params = {
                    serviceid: "mlf_metadataright",
                    methodname: "queryOperkeyOfWeChat",
                    Classify: "wechatsetsite.gongzhonghao"
                };
                trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(
                    function(data) {
                        var right = {};
                        for (var i = 0; i < data.length; i++) {
                            right[data[i].split(".")[2]] = true;
                        }
                        deffer.resolve(right);
                    });
                return deffer.promise;
            },
            /**
             * [modifySubscription description] 修改公众号弹窗
             * @param  {[type]} success [description]
             * @return {[type]}         [description]
             */
            modifySubscription: function(item, success) {
                var modalInstance = $modal.open({
                    templateUrl: "manageConfig/productManageMent/weixin/service/modify/subscription_modify_tpl.html",
                    windowClass: "productManageMent-weixin-subscription-modify",
                    backdrop: false,
                    controller: "productManageMentWeixinSubscriptionModifyCtrl",
                    resolve: {
                        item: function() {
                            return item;
                        }
                    }
                });
                return modalInstance.result.then(function(data) {
                    success(data);
                });
            },
            /**
             * [createWxAccount description] 绑定微信账号/编辑微信账号弹框
             * @param  {[string]} title [description] 模态框标题
             * @param  {[object]} account [description] 账号
             * @return {[type]}         [description] null
             */
            createWxAccount: function(title,account) {
                var deffer = $q.defer();
                var modalInstance = $modal.open({
                    templateUrl: "./manageConfig/productManageMent/weixin/service/account/createWxAccount_tpl.html",
                    windowClass: "wx-createAccount-window",
                    backdrop: false,
                    controller: "createWxAccountCtrl",
                    resolve: {
                        title: function(){
                            return title||'编辑账号';
                        },
                        account: function() {
                            return account;
                        }
                    }
                });
                modalInstance.result.then(function(result) {
                    deffer.resolve(result);
                });
                return deffer.promise;
            }
        };
    }]);
