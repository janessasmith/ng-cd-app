'use strict';
angular.module('editingCenterCompiledRouterModule', []).
config(['$stateProvider', function($stateProvider) {
    $stateProvider.state('editctr.app.waitcompiled', {
        url: '/waitcompiled?channelid&type',
        views: {
            'main@editctr': {
                templateUrl: function($stateParams) {
                    var type = $stateParams.type ? $stateParams.type.toLowerCase() : 'app';
                    return './editingCenter/app/toBeCompiled/' + type + '_tpl' + '.html';
                },
                controllerProvider: function($stateParams) {
                    var type = $stateParams.type ? $stateParams.type.toLowerCase() : 'app';
                    var ctrlName = "EditingCenterAppCompiled" + type + "Ctrl";
                    return ctrlName;
                }
            }
        }
    }).
    state('editctr.app.waitcompiled.recycle', {
            url: '/recycle',
            views: {
                'main@editctr': {
                    templateUrl: './editingCenter/app/toBeCompiled/recycle/main_draft_tpl.html',
                    controller: 'editCompileRecycleController'
                }
            }
        }).state('editctr.app.waitcompiled.timingsign', {
            url: '/timingsign',
            views: {
                'main@editctr': {
                    templateUrl: './editingCenter/app/toBeCompiled/timingSign/timingSign_tpl.html',
                    controller: 'editCompileTimingSignController'
                }
            }
        }).state('appatlas', {
            url: '/appatlas?channelid&chnldocid&siteid&metadataid&platform&doctype',
            views: {
                '': {
                    templateUrl: './editingCenter/app/toBeCompiled/atlas/editCenter_atlas.html',
                    controller: 'EditCenterAtlasController'
                }
            }
        })
        .state('appnews', {
            url: '/appnews?channelid&chnldocid&siteid&metadataid&platform&doctype',//channelid->栏目ID,chnldocid->关联表ID,siteid->站点ID,metadataid->元数据ID,platform->区分待编、待审、已签发,doctype->区分稿件是新闻稿、图集稿
            views: {
                '': {
                    templateUrl: './editingCenter/app/toBeCompiled/news/editCenter_news.html',
                    controller: 'EditingCenterNewsController'
                }
            }
        })
        .state('appsubject', {
            url: '/appsubject?channelid&chnldocid&siteid&metadataid&platform&doctype',
            views: {
                '': {
                    templateUrl: './editingCenter/app/toBeCompiled/subject/editCenter_subject.html',
                    controller: 'EditingCenterSubjectController'

                }
            }
        })
        .state('appwebsite', {
            url: "/appwebsite?channelid&chnldocid&siteid&metadataid&platform&doctype",
            views: {
                '': {
                    templateUrl: "./editingCenter/app/toBeCompiled/website/editCenter_website.html",
                    controller: "EditingCenterAddWebsiteController"
                }
            }
        })
        //app官员库新建和编辑
        .state('appofficial', {
            url: "/appofficial?channelid&officerid&officerstatus",
            views: {
                '': {
                    templateUrl: "./editingCenter/app/toBeCompiled/official/officialEdit/official_edit_tpl.html",
                    controller: "editingCenterAppOfficialEditCtrl"
                }
            }
        })
        //app官员库官员详细
        .state('appofficialdetail',{
            url:"/appofficialdetail?channelid&officerid&officerstatus",
            views:{
                '':{
                    templateUrl:"./editingCenter/app/toBeCompiled/official/officialDetail/official_detail_tpl.html",
                    controller:"editingCenterAppOfficialDetailCtrl"
                }
            }
        })
        .state('appvideo', {
            url: "/appvideo?channelid&chnldocid&siteid&metadataid&platform&doctype",
            views: {
                '': {
                    templateUrl: "./editingCenter/app/toBeCompiled/video/editCenter_video.html",
                    controller: "EditCenterAppVideoCtrl"
                }
            }
        });
}]);
