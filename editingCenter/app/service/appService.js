"use strict";
angular.module('editingCenterAppServiceModule', ['appSingleChooseChnlModule', 'initAppRequiredBtnModule', 'appDictionaryBtnServiceModule']).
factory('editingCenterAppService', ['$q', '$modal', '$state', function($q, $modal, $state) {
    return {
        /**
         * [initEditPath description]初始化编辑页类型
         * @return {[type]} [description]
         */
        initEditPath: function() {
            var editPath = {
                1: "appnews",
                2: "appatlas",
                3: "appsubject",
                4: "appwebsite",
                5: "appvideo",
            };
            return editPath;
        },
        /**
         * [initListStyle description]初始化列表样式
         * @return {[type]} [description]
         */
        initListStyle: function() {
            var listStyle = [{
                "desc": "图文",
                "value": "0"
            }, {
                "desc": "多图",
                "value": "1"
            }, {
                "desc": "文字",
                "value": "2"
            }, {
                "desc": "大图",
                "value": "3"
            }];
            return listStyle;
        },
        /**
         * [initDisplaySet description]初始化显示设置
         * @return {[type]} [description]
         */
        initDisplaySet: function() {
            var displaySet = [{
                "desc": "取专题基本信息",
                "value": "0"
            }, {
                "desc": "取新闻列表信息",
                "value": "1"
            }];
            return displaySet;
        },
        /**
         * [initLabel description]初始化标签
         * @return {[type]} [description]
         */
        initLabel: function() {
            var listLabel = [{
                "desc": "无",
                "value": "无"
            }, {
                "desc": "突发",
                "value": "突发"
            }, {
                "desc": "独家",
                "value": "独家"
            }, {
                "desc": "专题",
                "value": "专题"
            }, {
                "desc": "图集",
                "value": "图集"
            }, {
                "desc": "视频",
                "value": "视频"
            }, {
                "desc": "活动",
                "value": "活动"
            }];
            return listLabel;
        },
        /**
         * [initCommentSet description]初始化评论设置
         * @return {[type]} [description]
         */
        initCommentSet: function() {
            var commentSet = [{
                "desc": "先审后发",
                "value": "1"
            }, {
                "desc": "先发后审",
                "value": "2"
            }, {
                "desc": "关闭",
                "value": "0"
            }];
            return commentSet;
        },
        /**
         * [relatedOfficerParams description]相关官员请求参数
         * @return {[type]} [description]
         */
        relatedOfficerParams: function() {
            var params = {
                serviceid: "nb_appofficer",
                methodname: "queryRelatedOfficer",
                // parameter: "",
                ChannelId: $state.params.channelid,
                CurrPage: 1,
                PageSize: 10,
                SearchDocId: "",
                SearchName: "",
                // SearchRecId: "",
                // SearchPost: "",
            };
            return params;
        },
        /**
         * [initDocGenre description]初始化稿件体裁
         * @return {[type]} [description]
         */
        initDocGenre: function() {
            var docGenre = [{
                "name": "无体裁",
                "value": "无体裁"
            }, {
                "name": "一版头条消息",
                "value": "一版头条消息"
            }, {
                "name": "其它版头条消息",
                "value": "其它版头条消息"
            }, {
                "name": "其它消息",
                "value": "其它消息"
            }, {
                "name": "调查类报道",
                "value": "调查类报道"
            }, {
                "name": "来信",
                "value": "来信"
            }, {
                "name": "重要评论文章",
                "value": "重要评论文章"
            }, {
                "name": "社论、特约评论员",
                "value": "社论、特约评论员"
            }, {
                "name": "通讯",
                "value": "通讯"
            }, {
                "name": "简讯",
                "value": "简讯"
            }, {
                "name": "本报评论员、署名评论",
                "value": "本报评论员、署名评论"
            }, {
                "name": "摄影作品",
                "value": "摄影作品"
            }, {
                "name": "短评（含编辑按、编后、小言论等）",
                "value": "短评（含编辑按、编后、小言论等）"
            }, {
                "name": "内参",
                "value": "内参"
            }, {
                "name": "新华社",
                "value": "新华社"
            }, {
                "name": "文摘",
                "value": "文摘"
            }];
            return docGenre;
        },
        /**
         * [moveDraft description]稿件移动服务
         * @param  {[str]} modalTitle [description]标题
         * @param  {[num]} siteid     [description]站点ID
         * @param  {[num]} channelid  [description]栏目ID
         * @param  {[num]} platform   [description]平台种类
         * @param  {[fun]} success    [description]回调函数
         * @return {[type]}            [description]
         */
        moveDraft: function(modalTitle, siteid, channelid, platform, success) {
            var modalInstance = $modal.open({
                templateUrl: "./editingCenter/app/service/singelChannelChose/singleChooseChnl_tpl.html",
                windowClass: 'website-move-window',
                backdrop: false,
                controller: "appSingleChooseChnlCtrl",
                resolve: {
                    draftParams: function() {
                        return {
                            "siteid": siteid,
                            "channelid": channelid,
                            "modalTitle": modalTitle,
                            "platform": platform
                        };
                    }
                }
            });
            modalInstance.result.then(function(result) {
                success(result);
            });
        },
    };
}]);
