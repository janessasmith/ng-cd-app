"use strict";
angular.module('initWeiXinDataModule', []).
factory('initWeiXinDataService', ["$stateParams", "WeiXininitService", function($stateParams, WeiXininitService) {
    return {
        /**
         * [initNews description]初始化图文对象
         * @return {[type]} [description]
         */
        initNews: function() {
            var list = {
                "METADATAID": 0,
                "WXCHANNELID": $stateParams.wxchannelid,
                "CHNLDOCID": "",
                "DOCTITLE": "", //标题
                "HTMLCONTENT": "", //正文内容
                "RELATEDLINK": "", //原文链接
                "DOCNAME": "", //署名作者
                "DOCABSTRACT": "", //摘要
                "DOC_PICTURELIST": [], //封面图片
                "ISSHOWATCONTENT": 0, //封面图片是否显示在正文中
                "ISNOPAYMENT": 1, //不发稿费1,发稿费0(下同)
                "DOCGENRE": angular.copy(WeiXininitService.initDocGenre()[0]),
                "FGD_EDITINFO": [],
                "FGD_AUTHINFO": [{ "isCreate": true }],
                "KEYWORDS": "",
                "CONTENT": "",
                "DOCSOURCENAME": "",
                "ORIGINALTITLE": "",
                "APPFILE": "",
                "SRCFILE": ""
            };
            return list;
        },
        /**
         * [initPic description]初始化图片对象
         * @return {[type]} [description]
         */
        initPic: function() {
            var list = {
                "METADATAID": 0,
                "WXCHANNELID": $stateParams.wxchannelid,
                "CHNLDOCID": '',
                "DOCTITLE": '',
                "DOC_PICTURELIST": [], //"LISTPICS"
                "ISNOPAYMENT": 1,
                "DOCGENRE": angular.copy(WeiXininitService.initDocGenre()[0]),
                "FGD_EDITINFO": [],
                "FGD_AUTHINFO": [{ "isCreate": true }],
                "APPFILE": '',
            };
            return list;
        },
        /**
         * [initText description]初始化文字对象
         * @return {[type]} [description]
         */
        initText: function() {
            var list = {
                "METADATAID": 0,
                "WXCHANNELID": $stateParams.wxchannelid,
                "CHNLDOCID": '',
                "DOCTITLE": '',
                "DOCNAME": '',
                "HTMLCONTENT": '',
                "ISNOPAYMENT": 1,
                "DOCGENRE": angular.copy(WeiXininitService.initDocGenre()[0]),
                "FGD_EDITINFO": [],
                "FGD_AUTHINFO": [{ "isCreate": true }],
            };
            return list;
        },
        /**
         * [initAudio description]初始化音视频对象
         * @return {[type]} [description]
         */
        initAudioVdieo: function() {
            var audioVideo = {
                'ISNOPAYMENT': 1,
                'DOCGENRE': angular.copy(WeiXininitService.initDocGenre()[0]),
                "FGD_EDITINFO": [],
                "FGD_AUTHINFO": [{ "isCreate": true }],
            };
            return audioVideo;
        },
    };
}]);
