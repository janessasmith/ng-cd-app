"use strict";
angular.module('resourceCenterModule', [
    'resourceCenterRouterModule',
    'util.checkbox',
    'util.trsGoTopModule',
    'trsSetColumnsModule',
    'trsAreaSelectModule',
    'trsngsweetalert',
    'trsInputSuggestModule',
    'resCtrModalModule',
    'resourceCenterinitComDataModule',
    'resCenterSubTabModule',
    'resourceCenterLeftModule',
    'resourceCenterIwoLeftModule',
    'resourceCenterIwoModule',
    'resourceCenterSharedModule',
    'oldResourceCenterSharedModule',
    'resourceCenterStockModule',
    'resourceCenterVideoModule',
    'resourceDirectiveModule',
    'resCenWebsiteModule',
    'resCenDigitalnewsModule',
    'resCenDigitalPreviewModule',
    'resCenWechatModule',
    'resCenWeiboModule',
    'resCenAppModule',
    'resourceCenterServiceModule',
    'resourceCenterDetailModule',
    'resourceCenterWeiboDetailModule',
    'resCenRetMoulde',
    'resCenSearchMoulde',
    'resMangementModule',
    'resSubscribeModule',
    'appResourceDetailModule',
    'resourceCenterGxgkDetailModule',
    'resCenterPictureRouterModule', //图片库路由模块
    'resCenterXHRouterModule', //新华社稿路由模块
    'resourceCenterMaterialLeftModule',//素材库左侧模块
    'resourceCenterMaterialServiceModule',//素材公用服务
    'resCenWeiboModule'//微博模块
]).
controller('resourceCenterController', ['$scope', '$state', '$location', 'resourceCenterService',
    function($scope, $state, $location, resourceCenterService) {
    }
]);
