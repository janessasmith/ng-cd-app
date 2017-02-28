"use strict";
/**
 * modify by cc 16-11-28 图片库路由模块
 */
angular.module('resCenterPictureRouterModule', ['resourceCenterPictureModule'])
.config(['$stateProvider', function($stateProvider) {
    $stateProvider.state("resourcectrl.picture.resource", {
        url: '/resource?materialtypeid?parentid?topclassifyid', //materialtypeid:当前分类ID parentid:二级分类ID topclassifyid:一级分类ID
        views: {
            'resource@resourcectrl.picture': {
                templateUrl: './resourceCenter/material/pictures/picture_main_tpl.html',
                controller: 'resourceCenterPictureCtrl'
            }
        }
    }).state("resourcePictureDetail", {
        url: '/resPictureDetail?pictureId&materialtypeid&topclassifyid',
        views: {
            '': {
                templateUrl: './resourceCenter/material/pictures/pictureDetail/picture_detail_tpl.html',
                controller: 'resourceCenterPictureDetailCtrl'
            }
        }
    })
    .state("resourcePicture", {
        url: '/resourcePicture?pictureid&materialtypeid&topclassifyid&istakedraft',
        views: {
            '': {
                templateUrl: './resourceCenter/material/pictures/pictureEdit/picture_edit_tpl.html',
                controller: 'resourceCenterPictureEditCtrl'
            }
        }
    });
}]);
