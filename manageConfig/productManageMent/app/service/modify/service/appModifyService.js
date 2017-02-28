/**
 * Created by MRQ on 2016/1/6.
 */
"use strict";
angular.module("productManageMentAppModifyServiceModule", [
    'appModifyChannlOtherViewsModule',
    'appModifyChannlViewsModule',
    'appModifyDefaultArticleViewsModule'
])
    .factory("productMangageMentAppModifyService", ["$modal", function ($modal) {
        return {
            //栏目其他模板弹窗
            channlOtherViews: function () {
                var modalInstance = $modal.open({
                    templateUrl: "./manageConfig/productManageMent/app/service/modify/service/channlOtherTemplate/channl_other_tpl.html",
                    windowClass: 'pmm-app-modify-channl-other',
                    backdrop: false,
                    controller: "appModifyChannlOtherViewsCtrl"
                });
                return modalInstance.result.then(function (result) {
                    success(result);
                });
            },
            //栏目模板弹窗
            channlViews: function () {
                var modalInstance = $modal.open({
                    templateUrl: "./manageConfig/productManageMent/app/service/modify/service/channlTemplate/channl_tpl.html",
                    windowClass: 'pmm-app-modify-channl',
                    backdrop: false,
                    controller: "appModifyChannlViewsCtrl"
                });
                return modalInstance.result.then(function (result) {
                    success(result);
                });
            },
            //默认模板弹窗
            defaultArticleViews: function () {
                var modalInstance = $modal.open({
                    templateUrl: "./manageConfig/productManageMent/app/service/modify/service/defaultArticleTemplate/default_article_tpl.html",
                    windowClass: 'pmm-app-modify-default-article',
                    backdrop: false,
                    controller: "appModifyDefaultArticleViewsCtrl"
                });
                return modalInstance.result.then(function (result) {
                    success(result);
                });
            }
        }
    }]);
