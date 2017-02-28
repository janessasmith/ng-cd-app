"use strict";
/**
 * modify by cc 16/12/09 视频库路由模块
 */
angular.module('resCenterVideoRouterModule', []).
config(['$stateProvider', function($stateProvider) {
    $stateProvider.state("resourcectrl.video.resource", {
        url: '/resource?materialtypeid?parentid?topclassifyid',
        views: {
            'resource@resourcectrl.video': {
                templateUrl: './resourceCenter/material/video/video_main_tpl.html',
                controller: 'resourceCenterVideoCtrl'
            }
        }
    }).state("resourcevideoedit", {
        url: '/resourcevideoedit?videoid&materialtypeid&topclassifyid',
        views: {
            '': {
                templateUrl: './resourceCenter/material/video/videoEdit/video_edit_tpl.html',
                controller: 'resourceCenterVideoEditCtrl'
            }
        }
    }).state("resourcevideodetail", {
        url: '/resourcevideodetail?videoid&materialtypeid&topclassifyid',
        views: {
            '': {
                templateUrl: './resourceCenter/material/video/videoDetail/video_detail_tpl.html',
                controller: 'resourceCenterVideoDetailCtrl'
            }
        }
    });
}]);
