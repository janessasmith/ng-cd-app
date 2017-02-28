"use strict";
angular.module('resourceCenterRouterModule', []).
config(['$stateProvider', '$urlRouterProvider', function($stateProvider) {
    $stateProvider.state("resourcectrl", {
            url: '/resourcectrl',
            views: {
                '': {
                    templateUrl: './resourceCenter/resourceCenter.html',
                    controller: 'resWebsiteCtrl'
                },
                'head@resourcectrl': {
                    templateUrl: './header_tpl.html',
                    controller: 'HeaderController'
                },
                'nav@resourcectrl': {
                    templateUrl: './resourceCenter/nav_tpl.html',
                    controller: 'resCenterSubTabCtrl'
                },
                'content@resourcectrl': {
                    templateUrl: './resourceCenter/main_tpl.html',
                },
                'footer@resourcectrl': {
                    templateUrl: './footer_tpl.html'
                }
            }
        }).state('resourcectrl.iwo', { //iwo资源
            url: '/iwo?typename',
            views: {
                'left@resourcectrl': {
                    templateUrl: './resourceCenter/left_tpl.html',
                    controller: 'resourceCenterIwoLeftCtrl'
                },
                'main@resourcectrl': {
                    templateUrl: './resourceCenter/resource_main_tpl.html'
                }
            }
        }).state("resourcectrl.iwo.resource", {
            url: '/resource?nodeid&nodename&modalid&change',
            views: {
                'resource@resourcectrl.iwo': {
                    templateUrl: './resourceCenter/iwo/iwo_main_tpl.html',
                    controller: 'resourceCenterIwoCtrl'
                }
            }
        }).state("retrieval.resmanage", { //资源管理
            url: '/resmanage',
            views: {
                'main@retrieval': {
                    templateUrl: './resourceCenter/iwo/leftMenuContent/resourceMengement.html',
                    controller: "resMangementCtrl"
                }
            }
        }).state("retrieval.subscribe", { //资源管理(为策划中心的自定义跳转添加一个参数isControl)
            url: '/subscribe?parentId&sourceId&isControl&channelType&title',
            views: {
                'main@retrieval': {
                    templateUrl: './resourceCenter/iwo/leftMenuContent/subscribe.html',
                    controller: "resSubscribeCtrl"
                }
            }
        }).state('resourcectrl.xinhua', { //新华社稿
            url: "/xinhua?typename&modalid",
            views: {
                // 'left@resourcectrl': {
                //     templateUrl: './resourceCenter/left_tpl.html',
                //     controller: 'resourceCenterLeftCtrl'
                // },
                'left@resourcectrl': {
                    templateUrl: './resourceCenter/XinhuaNews/xinhua_left_tpl.html',
                    controller: 'resourceCenterXinhuaLeftCtrl'
                },
                'main@resourcectrl': {
                    templateUrl: './resourceCenter/resource_main_tpl.html'
                }
            }
        }).state('resourcectrl.share', { //共享稿库
            url: "/share?typename&modalid",
            views: {
                'left@resourcectrl': {
                    templateUrl: './resourceCenter/left_tpl.html',
                    controller: 'resourceCenterLeftCtrl'
                },
                'main@resourcectrl': {
                    templateUrl: './resourceCenter/resource_main_tpl.html'
                }
            }
        }).state('resourcectrl.stock', { //集团成品库
            url: "/stock?typename",
            views: {
                'left@resourcectrl': {
                    templateUrl: './resourceCenter/left_tpl.html',
                    controller: 'resourceCenterLeftCtrl'
                },
                'main@resourcectrl': {
                    templateUrl: './resourceCenter/resource_main_tpl.html'
                }

            }
        }).state('resourcectrl.picture', { //图片库
            url: "/picture",
            views: {
                'nav@resourcectrl': {
                    templateUrl: './resourceCenter/nav_tpl.html', //图片库独立的nav块
                    controller: 'resCenterSubTabPictrueCtrl'
                },
                'left@resourcectrl': {
                    templateUrl: './resourceCenter/material/material_left_tpl.html', //图片库独立左侧
                    controller: 'resourceCenterMaterialLeftCtrl'
                },
                'main@resourcectrl': {
                    templateUrl: './resourceCenter/resource_main_tpl.html',
                },
            }
        }).state('resourcectrl.video', { //视频库
            url: "/video?typename",
            views: {
                'nav@resourcectrl': {
                    templateUrl: './resourceCenter/nav_tpl.html', //图片库独立的nav块
                    controller: 'resCenterSubTabPictrueCtrl'
                },
                'left@resourcectrl': {
                    templateUrl: './resourceCenter/material/material_left_tpl.html',
                    controller: 'resourceCenterMaterialLeftCtrl'
                },
                'main@resourcectrl': {
                    templateUrl: './resourceCenter/resource_main_tpl.html'
                }
            }
        }).state('resourcectrl.website', { //网站
            url: "/website?typename",
            views: {
                'left@resourcectrl': {
                    templateUrl: './resourceCenter/left_tpl.html',
                    controller: 'resourceCenterLeftCtrl'
                },
                'main@resourcectrl': {
                    templateUrl: './resourceCenter/resource_main_tpl.html'
                }
            }
        }).state('resourcectrl.website.resource', {
            url: '/resource?nodeid&nodename',
            views: {
                'resource@resourcectrl.website': {
                    templateUrl: './resourceCenter/website/main_tpl.html',
                    controller: 'resWebsiteMainCtrl'
                }
            }
        }).state('resourcectrl.wechat', { //微信
            url: "/wechat?typename",
            views: {
                'left@resourcectrl': {
                    templateUrl: './resourceCenter/left_tpl.html',
                    controller: 'resourceCenterLeftCtrl'
                },
                'main@resourcectrl': {
                    templateUrl: './resourceCenter/resource_main_tpl.html'
                }
            }
        }).state('resourcectrl.wechat.resource', {
            url: '/resource?nodeid&nodename',
            views: {
                'resource@resourcectrl.wechat': {
                    templateUrl: './resourceCenter/wechat/main_tpl.html',
                    controller: 'resWebsiteMainCtrl'
                }
            }
        }).state('resourcectrl.app', { //app
            url: "/app?typename",
            views: {
                'left@resourcectrl': {
                    templateUrl: './resourceCenter/left_tpl.html',
                    controller: 'resourceCenterLeftCtrl'
                },
                'main@resourcectrl': {
                    templateUrl: './resourceCenter/resource_main_tpl.html'
                }
            }
        }).state('resourcectrl.app.resource', {
            url: '/resource?nodeid&nodename',
            views: {
                'resource@resourcectrl.app': {
                    templateUrl: './resourceCenter/website/main_tpl.html',
                    controller: 'resWebsiteMainCtrl'
                }
            }
        }).state('resourcectrl.weibo', { //微博
            url: "/weibo?typename",
            views: {
                'left@resourcectrl': {
                    templateUrl: './resourceCenter/left_tpl.html',
                    controller: 'resourceCenterLeftCtrl'
                },
                'main@resourcectrl': {
                    templateUrl: './resourceCenter/resource_main_tpl.html'
                }
            }
        })
        // .state('resourcectrl.weibo.resource', {
        //     url: '/resource?nodeid&nodename',
        //     views: {
        //         'resource@resourcectrl.weibo': {
        //             templateUrl: './resourceCenter/weibo/main_tpl.html',
        //             controller: 'resCenWeiboMainCtrl'
        //         }
        //     }
        // })
        .state('resourcectrl.weibo.resource', {
            url: '/resource?nodeid&nodename',
            views: {
                'resource@resourcectrl.weibo': {
                    templateUrl: './resourceCenter/weibo/main_tpl.html',
                    controller: 'resCenWeiboMainCtrl'
                }
            }
        }).state('resourcectrl.digital', { //数字报
            url: "/digital?typename",
            views: {
                'left@resourcectrl': {
                    templateUrl: './resourceCenter/left_tpl.html',
                    controller: 'resourceCenterLeftCtrl'
                },
                'main@resourcectrl': {
                    templateUrl: './resourceCenter/resource_main_tpl.html'
                }
            }
        }).state('resourcectrl.digital.resource', {
            url: '/resource?nodeid&nodename&isShowPreview',
            views: {
                'resource@resourcectrl.digital': {
                    templateUrl: './resourceCenter/website/main_tpl.html',
                    controller: 'resWebsiteMainCtrl'
                }
            }
        }).state('resourcectrl.digital.preview', {
            url: '/preview?nodeid&nodename&isShowPreview',
            views: {
                'resource@resourcectrl.digital': {
                    templateUrl: './resourceCenter/digitalnews/preview_tpl.html',
                    controller: 'resCenDigitalPreviewCtrl'
                }
            }
        })
        .state('digitaldetailjtcpg', {
            url: '/digitaldetailjtcpg?nodeid&bc&docpubtime&serviceid&papername',
            views: {
                '': {
                    templateUrl: './resourceCenter/digitalnews/detail/detail_tpl.html',
                    controller: 'resCenDigitalPreviewDetailCtrl'
                }
            }
        })
        .state('digitaldetailother', {
            url: '/digitaldetailother?nodeid&bc&docpubtime&serviceid&papername',
            views: {
                '': {
                    templateUrl: './resourceCenter/digitalnews/detail/digitalDetail_tpl.html',
                    controller: 'resCenDigitalPreviewOtherDetailCtrl'
                }
            }
        })
        .state("retrieval", { //高级检索
            url: '/retrieval?typename&channelName&starttime&endtime&keyword_and&keyword_or&keyword_not&fromevent',
            views: {
                '': {
                    templateUrl: './resourceCenter/retrieval/retrieval.html'
                },
                'head@retrieval': {
                    templateUrl: './header_tpl.html',
                    controller: 'HeaderController'
                },
                'nav@retrieval': {
                    templateUrl: './resourceCenter/nav_tpl.html',
                    controller: 'resCenterSubTabCtrl'
                },
                'main@retrieval': {
                    templateUrl: './resourceCenter/retrieval/retrieval_main_tpl.html',
                    controller: "resCenRetCtrl"
                },
                'footer@index': {
                    templateUrl: './footer_tpl.html'
                }
            }
        }).state("retrieval.allsearch", { //全库搜索
            url: '/allsearch?planKey',
            views: {
                'main@retrieval': {
                    templateUrl: './resourceCenter/search/search.html',
                    controller: "resCenSearchCtrl"
                }
            }
        }).state("resourcectrl.more", {
            url: "/more?type&method",
            views: {
                'body@resourcectrl': {
                    templateUrl: './planningCenter/cueSelectedTopic/cueMonitoring/more/cueMonitorMore_tpl.html',
                    controller: 'cueMonitorMoreCtrl'
                }
            }
        }).state("resourcectrl.type", {
            url: "/information?type&keyword",
            views: {
                'body@resourcectrl': {
                    templateUrl: './planningCenter/cueSelectedTopic/cueMonitoring/more/cueMonitorMore_tpl.html',
                    controller: 'planCenterTrelatedinformationCtrl'
                }
            }
        }).state("resourcectrl.hotKey", {
            url: "/eventcorrelation?hotKey",
            views: {
                'body@resourcectrl': {
                    templateUrl: './planningCenter/cueSelectedTopic/cueMonitoring/more/cueMonitorMore_tpl.html',
                    controller: 'planCenterEventCorrelationHotKeyCtrl'
                }
            }
        }).state("resourcedetail", { //资源中心细览详情
            url: "/resourcedetail?guid&channel&service&indexname",
            views: {
                '': {
                    templateUrl: './resourceCenter/detail/detail_tpl.html',
                    controller: 'resourceCenterDetailCtrl'
                }
            }
        }).state("resourceweibodetail", { //资源中心细览详情
            url: "/resourceweibodetail?guid&channel&service&indexname",
            views: {
                '': {
                    templateUrl: './resourceCenter/detail/weiboDetail_tpl.html',
                    controller: 'resourceCenterWeiboDetailCtrl'
                }
            }
        }).state("appresourcedetail", { //辅助写作细览
            url: "/appresourcedetail?guid&indexname",
            views: {
                '': {
                    templateUrl: './resourceCenter/appresourcedetail/appresourcedetail_tpl.html',
                    controller: 'appResourceDetailCtrl'
                }
            }
        }).state("resourcegxgkdetail", { //资源中心共享稿库细览详情
            url: "/resourcegxgkdetail?metadataid&type",
            views: {
                '': {
                    templateUrl: './resourceCenter/gxgkDetail/gxgkDetail_tpl.html',
                    controller: 'resourceCenterGxgkDetailCtrl'
                }
            }
        });
}]);
