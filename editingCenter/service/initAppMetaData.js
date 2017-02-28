"use strict";
angular.module('initAddMetaDataModule', []).
factory('initAddMetaDataService', ['$stateParams', 'editingCenterAppService', function($stateParams, editingCenterAppService) {
    return {
        initNews: function() {
            var list = {
                "METADATAID": 0,
                "CHANNELID": $stateParams.channelid,
                "LISTSTYLE": 0,
                "LISTTITLE":"",
                "LISTPICS": [],
                "LABEL": angular.copy(editingCenterAppService.initLabel()[0].value),
                "ISFOCUSIMAGE": 1,
                "FOCUSIMAGE": [],
                "NEWSSTYLE": "",
                "TITLE": "",
                "HTMLCONTENT": "",
                "CONTENT": "",
                "NEWSSOURCES": "",
                "CONTRIBUTORSAUTHER": "",
                "SIGNATUREAUTHOR": "",
                "KEYWORDS": "",
                "ABSTRACT": "",
                "RELATEDLINK": "", //相关链接
                "ISSELECTFIGURE": 0,
                "FIGURE": [],
                "COMMENTSET": 1,
                "RELEVANTNEWSIDS": "",
                "RELEVANTOFFICIALSIDS": "",
                "ISNOPAYMENT": 1,
                "DOCGENRE": angular.copy(editingCenterAppService.initDocGenre()[0]),
                "FOCUSIMGTITLE": "",
                "DOCWORDSCOUNT": 0,
                "FGD_EDITINFO": [],
                "FGD_AUTHINFO": [{ "isCreate": true }],
            };
            return list;
        },
        initAtlas: function() {
            var list = {
                "CHANNELID": $stateParams.channelid,
                "METADATAID": 0,
                "LISTSTYLE": 0,
                "LISTPICS": [],
                "LABEL": angular.copy(editingCenterAppService.initLabel()[0].value),
                "ISFOCUSIMAGE": 1,
                "FOCUSIMAGE": [],
                "RELEASESOURCE": "",
                "SUBTITLE": "",
                "LEADTITLE": "",
                "NEWSSOURCES": "",
                "TEMPLATESETTING": "",
                "SIGNATUREAUTHOR": "",
                "CONTRIBUTORSAUTHER": "",
                "KEYWORDS": "",
                "ABSTRACT": "",
                "ISSELECTFIGURE": "",
                "FOCUSIMGTITLE": "",
                "FIGURE": [],
                "COMMENTSET": 1,
                "DOC_PICTURELIST": [],
                "ISNOPAYMENT": 1,
                "DOCGENRE": angular.copy(editingCenterAppService.initDocGenre()[0]),
                "FLOWVERSIONTIME": "",
                "DOCTYPE": "",
                "DOCWORDSCOUNT": 0,
                "FGD_EDITINFO": [],
                "FGD_AUTHINFO": [{ "isCreate": true }],
            };
            return list;
        },
        initSubject: function() {
            var list = {
                "CHANNELID": $stateParams.channelid,
                "METADATAID": 0,
                "LISTSTYLE": 0,
                "LISTTITLE":"",
                "LISTPICS": [],
                "LABEL": angular.copy(editingCenterAppService.initLabel()[0].value),
                "DISPLAYSET": 0,
                "TITLE": "",
                "FOCUSIMGTITLE": "",
                "ISFOCUSIMAGE": 1,
                "FOCUSIMAGE": [],
                "KEYWORDS": "",
                "ABSTRACT": "",
                "ISSELECTFIGURE": 0,
                "FIGURE": [],
                "DOCWORDSCOUNT": 0,
                "FZ_SPECIALGROUPINFO": "",
            };
            return list;
        },
        initWebsite: function() {
            var list = {
                METADATAID: 0,
                CHANNELID: $stateParams.channelid,
                LISTSTYLE: 0,
                LISTTITLE: "",
                LISTPICS: [],
                LABEL: angular.copy(editingCenterAppService.initLabel()[0].value),
                ISFOCUSIMAGE: 1,
                FOCUSIMAGE: [],
                URL: "",
                COMMENTSET: 1,
                DOCWORDSCOUNT: 0,
                FOCUSIMGTITLE: "",
            };
            return list;
        },
        initVideo: function() {
            var list = {
                METADATAID: 0,
                CHANNELID: $stateParams.channelid,
                //列表信息
                LISTSTYLE: 0, //列表样式
                LISTTITLE: '',
                LISTPICS: [], //图片列表
                LABEL: angular.copy(editingCenterAppService.initLabel()[0].value), //默认标签
                ISFOCUSIMAGE: 1, //是否为焦点图
                FOCUSIMGTITLE: '', //焦点图title
                FOCUSIMAGE: [], //焦点图
                //属性信息
                NEWSSOURCES: '', //新闻来源
                SIGNATUREAUTHOR: '', //署名作者
                KEYWORDS: '', //关键词
                CONABSTRACT: '', //摘要
                AUDIOVIDEO: [], //音视频
                ISSELECTFIGURE: 0, //是否选为题图
                FIGURE: [], //题图图片存储
                COMMENTSET: 1, //评论设置
                //发稿单
                ISNOPAYMENT: 1, //是否发稿费
                DOCGENRE: angular.copy(editingCenterAppService.initDocGenre()[0]), //默认稿件体裁
                FGD_EDITINFO: [], //编辑信息
                FGD_AUTHINFO: [{ "isCreate": true }],
                //补充
                IMAGESIZE: '1', //保留字段

            };
            return list;
        }
    };
}]);
