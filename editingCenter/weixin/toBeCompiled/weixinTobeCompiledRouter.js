"use strict";
angular.module('weixinTobeCompiledRouter', []).config(['$stateProvider',function ($stateProvider) {
	$stateProvider.state('editctr.weixin.tobecompiled',{
		url:'/tobecompiled?channelid',
		views:{
			'main@editctr':{
				templateUrl:'./editingCenter/weixin/toBeCompiled/main_tpl.html',
				controller:'WeiXinTobeCompiledCtrl'
			}
		}
	}).state('wxgraphic', { //新建图文
        //wxchannelid->栏目ID,metadataid->元数据ID,chnldocid->关联表ID,
        //status->区分稿件状态(待编、待审、已签发),doctype->区分稿件类型
        url: "/wxgraphic?wxchannelid&metadataid&chnldocid&status",
        views: {
            '': {
                templateUrl:'./editingCenter/weixin/toBeCompiled/graphic/wechat_graphic_tpl.html',
                controller:'WechatGraphicCtrl',
            }
        }
    }).
    state('wxpicture', { //新建图片
        url: "/wxpicture?wxchannelid&metadataid&chnldocid&status&doctype",
        views: {
            '': {
                templateUrl:'./editingCenter/weixin/toBeCompiled/picture/wechat_picture_tpl.html',
                controller:'WechatPictureCtrl',
            }
        }
    }).
    state('wxaudio', { //新建音频
        url: "/wxaudio?metadataid&wxchannelid&status&doctype",
        views: {
            '': {
                templateUrl:'./editingCenter/weixin/toBeCompiled/audio/weiXin_audio.html',
                controller:'WeiXinAudioNewCtrl',
            }
        }
    }).
    state('wxvideo', { //新建视频
        url: "/wxvideo?metadataid&wxchannelid&status&doctype",
        views: {
            '': {
                templateUrl:'./editingCenter/weixin/toBeCompiled/video/weiXin_video.html',
                controller:'WeiXinVideoNewCtrl',
            }
        }
    }).
    state('wxtext', { //新建文本
        url: "/wxtext?wxchannelid&metadataid&chnldocid&status&doctype",
        views: {
            '': {
                templateUrl:'./editingCenter/weixin/toBeCompiled/text/wechat_text_tpl.html',
                controller:'WechatTextCtrl',
            }
        }
    });
	
}]);