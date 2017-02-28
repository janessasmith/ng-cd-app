"use strict";
angular.module('weixinRouterModule', []).config(['$stateProvider', function($stateProvider) {
    $stateProvider.state('editctr.weixin', {
        url: "/weixin",
        views: {
            'weixin@editctr':{
                templateUrl:'./editingCenter/weixin/left_tpl.html',
                controller:'WeiXinLeftCtrl',
            }
        }
    }).
    state('wxPreview', {
        url: "/wxPreview?wxchannelid&metadataid&chnldocid&status&doctype",
        views: {
            '': {
                templateUrl:'./editingCenter/weixin/preview/main_tpl.html',
                controller:'WeiXinPreviewCtrl',
            }
        }
    });
}]);
