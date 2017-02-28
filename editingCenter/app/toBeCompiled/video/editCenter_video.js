/*
 * Created by xuexiaoting on 2016/12/23.
 */
'use strict';
angular.module('editCenterAppVideoModule', [])
    .controller('EditCenterAppVideoCtrl', ["$scope", "$state", "$window", "$timeout", "$filter", "$compile", "$modal", "$q", "$validation", "trsHttpService", "trsconfirm", "ueditorService", "editingCenterService", "editingCenterAppService", "initAddMetaDataService", "uploadAudioVideoService", "jsonArrayToStringService", "trsspliceString", "storageListenerService", "editcenterRightsService", function($scope, $state, $window, $timeout, $filter, $compile, $modal, $q, $validation, trsHttpService, trsconfirm, ueditorService, editingCenterService, editingCenterAppService, initAddMetaDataService, uploadAudioVideoService, jsonArrayToStringService, trsspliceString, storageListenerService, editcenterRightsService) {
        initStatus();
        initData();
        /**
         * channelid->栏目ID,chnldocid->关联表ID,siteid->站点ID,metadataid->元数据ID
         * platform->区分待编、待审、已签发,doctype->区分稿件是新闻稿、图集稿
         */
        /**
         * [initStatus description]初始化状态
         * @return {[type]} [description]
         */
        function initStatus() {
            $scope.page = {
                CURRPAGE: 1,
                PAGESIZE: 20,
            };
            $scope.platform = {
                '0': 'app.daibian', //待编
                '1': 'app.daishen', //待审
                '2': 'app.yiqianfa', //已签发
            };
            $scope.status = {
                openBtn: true, //按钮开关，防止重复请求
                platformType: $scope.platform[$state.params.platform], //稿件状态，区分待编、待审、已签发
                btnRights: [], //按钮权限
                audioVideoidsArray: [], //播放音视频临时数组
            	uploadMasProgress: 0,
            	uploadMasNow: false,
            	masUploadExtensions: 'mp3,mp4,flv,rmvb,avi',
            	masUploadMimeTypes: 'audio/mp3,video/mp4,video/flv,video/rmvb,video/avi'
            };
            $scope.data = {
                listStyle: editingCenterAppService.initListStyle(), //列表信息-列表样式
                label: editingCenterAppService.initLabel(), //列表信息-标签
                KEYWORDS: [], //属性信息-关键词
                commentSet: editingCenterAppService.initCommentSet(), //属性信息-评论设置
                docGenre: editingCenterAppService.initDocGenre(), //属相信息-稿件体裁
            	copyVersion: [],
                version: [],
            };
            $scope.status.hasVersionTime = angular.isDefined($state.params.chnldocid) ? true : false;
        }
        /**
         * [initData description]初始化数据
         * @return {[type]} [description]
         */
        function initData() {
            editcenterRightsService.initAppListBtn($scope.status.platformType, $state.params.channelid).then(function(rights) {
                    $scope.status.btnRights = rights;
                });
            getCutPictureWidthHeight();
            angular.isDefined($state.params.chnldocid) ? initEditData() : initNewData();
            initUploadMasFn();
        }
        /**
         * [getCutPictureWidthHeight description]获取图片编辑默认宽高
         * @return {[type]} [description]
         */
        function getCutPictureWidthHeight() {
            var params = {
                serviceid: 'mlf_appconfig',
                methodname: 'getPicsSize',
                objectid: $state.params.siteid
            };
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function(data) {
                $scope.status.pictureSize = {
                    LISTPICSSIZE: data.LISTPICSIZE === "" ? "100,100" : data.LISTPICSIZE,
                    FOCUSIMAGESIZE: data.FOCUSIMAGESIZE === "" ? "100,100" : data.FOCUSIMAGESIZE,
                    FIGURESIZE: data.FIGURESIZE === "" ? "100,100" : data.FIGURESIZE,
                    LISTBIGPICSIZE: data.LISTBIGPICSIZE === "" ? "100,100" : data.LISTBIGPICSIZE
                };
            });
        }
        /**
         * [initEditData description]初始化编辑页面
         * @return {[type]} [description]
         */
        function initEditData() {
            var params = {
                serviceid: 'mlf_appmetadata',
                methodname: 'getVideoDoc',
                ChnlDocId: $state.params.chnldocid, //视频稿件id
            };
        	trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function(data) {
                $scope.list = data;
                loadDirective();
                getVersion();
                initKeyWords();
                reWriteImg();
                audioVideo();
            });
        }
        /**
         * [initNewData description]初始化新建页面
         * @return {[type]} [description]
         */
        function initNewData() {
            $scope.list = initAddMetaDataService.initVideo();
            loadDirective();
        }
        /**
         * [loadDirective description]发稿单编译标签editor
         * @return {[type]}     [description]null
         */
        function loadDirective() {
            var draftList = '<editor-dir meta-data-id="{{list.METADATAID}}" editor-json="list.FGD_EDITINFO" show-all-tips="showAllTips" editor-form="videoForm"></editor-dir>' +
                '<editor-auth-dir author="list.FGD_AUTHINFO"></editor-auth-dir>';
            draftList = $compile(draftList)($scope);
            $($(angular.element(document)).find('editor')).append(draftList);
        }
        /**
         * [getVersion description]获取流程版本与操作日志
         * @param  {[num]} id   [description]元数据ID
         * @return {[type]}     [description]
         */
        function getVersion(id) {
            var metadataid = angular.isDefined(id) ? id : $state.params.metadataid;
            editingCenterService.getEditVersionTime(metadataid, $scope.page, $scope.data.copyVersion).then(function(data) {
                $scope.data.version = data;
                $scope.page = data.page;
                $scope.data.copyVersion = data.copyArray;
                $scope.status.hasVersionTime = true;
            });
        }
        /**
         * [initUploadMasFn description]初始化音视频上传方法
         * @return {[type]} [description]
         */
        function initUploadMasFn() {
            $scope.uploadMasCallBack = {
                success: function(file, src, uploader) {
                    uploadAudioVideoService.submit(src).then(function(data) {
                        $scope.status.uploadMasProgress = '100%';
                        $scope.status.uploadMasNow = false;
                        $scope.list.AUDIOVIDEO.push(data.masId);
                        $scope.status.audioVideoidsArray.push({ id: data.masId });
                        delete $scope.status.tempAppendix;
                    });
                },
                error: function(file) {},
                file: function(file, uploader) {
                    uploader.upload();
                },
                tar: function(file, percentage) {
                    var per = Math.ceil(percentage * 90) + "%";
                    $timeout(function() {
                        $scope.status.uploadMasProgress = per;
                        $scope.status.uploadMasNow = true;
                    });
                },
                comp: function(file) {}
            };
        }
        /**
         * [audioVideo description]处理音视频属性
         * @return {[type]} [description]
         */
        function audioVideo() {
            $scope.list.AUDIOVIDEO = angular.isDefined($scope.list.AUDIOVIDEO) ? $scope.list.AUDIOVIDEO : "";
            $scope.list.AUDIOVIDEO = $scope.list.AUDIOVIDEO === "" ? [] : $scope.list.AUDIOVIDEO.split(","); //将音视频文件转换为数组格式
            //将音视频ID存入audioVideoidsArray对象，方便之后渲染
            angular.forEach($scope.list.AUDIOVIDEO, function(_data, index, array) {
                $scope.status.audioVideoidsArray.push({ id: _data });
            });
        }
        /**
         * [reWriteImg description]回写图片列表数据
         * @return {[type]} [description]
         */
        function reWriteImg() {
            var imgArray = ["FOCUSIMAGE", "LISTPICS", "FIGURE"];
            angular.forEach(imgArray, function(data, index) {
                if ($scope.list[data] !== 0) {
                    var arrayDocPic = [];
                    angular.forEach($scope.list[data], function(dataC, indexC) {
                        arrayDocPic.push({
                            "APPFILE": dataC.APPFILE,
                            "APPDESC": dataC.APPDESC,
                            'PERPICURL': dataC.PERPICURL
                        });
                    });
                    $scope.list[data] = arrayDocPic;
                }
            });
        }
        /**
         * [getLoadMore description]操作日志加载更多
         * @return {[type]} [description]
         */
        $scope.getLoadMore = function() {
            $scope.page.CURRPAGE++;
            getVersion();
        };



        /**
         * [deleteUploaderImg description]删除上传后的图片
         * @param  {[str]} attribute [description]要删除的属性
         * @param  {[num]} index     [description]下标
         * @return {[type]}           [description]
         */
        $scope.deleteUploaderImg = function(attribute, index) {
            if (attribute === 'LISTPICS') {
                $scope.list[attribute][index] ={};
            } else {
                $scope.list[attribute] = [];
            }
        };
        /**
         * [updateCKSelection description]trsCheckBox的回调函数
         * @param  {[str]} attribute [description]需要改变的属性
         * @return {[type]}           [description]
         */
        $scope.updateCKSelection = function(attribute) {
            $scope.list[attribute] = $scope.list[attribute] == 0 ? 1 : 0;
        };
        /**
         * [invalidTag description]检验每个关键词的长度
         * @param  {[str]}	tag		[description]关键词
         * @return {[type]}			[description]null
         */
        /**
         * [initKeyWords description]初始化关键词
         * @return {[type]} [description]
         */
        function initKeyWords() {
            if ($scope.list.KEYWORDS !== "") {
                var KEYWORDS = $scope.list.KEYWORDS.split(",");
                $scope.data.KEYWORDS = [];
                angular.forEach(KEYWORDS, function(data, index, array) {
                    $scope.data.KEYWORDS.push({
                        "name": data
                    });
                });
            } else {
                $scope.data.KEYWORDS = [];
            }
        }
        /**
         * [invalidTag description]检验单个关键词长度
         * @param  {[str]}  tag     [description]关键词
         * @return {[type]}         [description]null
         */
        $scope.invalidTag = function(tag) {
            var reg = /^[^<>\/]*$/;
            if (tag.name.length > 20) {
                $scope.isShowKeywordTips = true;
                $scope.keywordsTips = "单个关键词长度不能超过20";
            }
            if (!reg.test(tag.name)) {
                $scope.isShowKeywordTips = true;
                $scope.keywordsTips = "不能包含特殊字符";
            }
        };
        /**
         * [checkTag description]检验关键词的总个数和总记录长度
         * @param  {[str]}	tag		[description]关键词
         * @return {[type]}			[description]null
         */
        $scope.checkTag = function(tag) {
            var len = $scope.data.KEYWORDS.length;
            if (len == 10) {
                $scope.isShowKeywordTips = true;
                $scope.keywordsTips = "关键词个数不能超过10个";
                return false;
            } else {
                $scope.keywordsTips = "";
                $scope.isShowKeywordTips = false;
            }
            if (tag.name.indexOf(" ") > -1) {
                var spaceArr = tag.name.split(" ");
                $timeout(function() {
                    $scope.data.KEYWORDS.pop();
                    var containArr = [];
                    for (var j = 0; j < $scope.data.KEYWORDS.length; j++) {
                        containArr.push($scope.data.KEYWORDS[j].name);
                    }
                    for (var i = 0; i < spaceArr.length; i++) {
                        if (containArr.indexOf(spaceArr[i]) < 0 && spaceArr[i] !== '') {
                            $scope.data.KEYWORDS.push({ 'name': spaceArr[i] });
                            containArr.push(spaceArr[i]);
                        }
                    }
                });
            }
        };
        /**
         * [leave description]关键词input失焦
         * @param  {[str]}	tag		[description]关键词
         * @return {[type]}			[description]null
         */
        $scope.leave = function() {
            $scope.isShowKeywordTips = false;
        };
        /**
         * [enter description]关键词input聚焦
         * @param  {[str]}	tag		[description]关键词
         * @return {[type]}			[description]null
         */
        $scope.enter = function() {
            var reg = /^[^<>\/]*$/;
            if (angular.isDefined($scope.KEYWORDTEXT) && (!reg.test($scope.KEYWORDTEXT) || $scope.KEYWORDTEXT.length > 20)) {
                $scope.isShowKeywordTips = true;
            }
            /*if (angular.isDefined($scope.keywordsTips) && $scope.keywordsTips !== "") {
                $scope.isShowKeywordTips = true;
            }*/
        };
        /**
         * [getKeyWords description]获取关键词
         * @return {[type]} [description]null
         */
        function getKeyWords() {
            $scope.list.KEYWORDS = "";
            angular.forEach($scope.data.KEYWORDS, function(data, index, array) {
                if (index != ($scope.data.KEYWORDS.length - 1)) {
                    $scope.list.KEYWORDS += data.name + ",";
                } else {
                    $scope.list.KEYWORDS += data.name;
                }
            });
        }
        /**
         * [clearAllKeywords description]清除关键词
         * @return {[type]} [description]null
         */
        $scope.clearAllKeywords = function() {
            $scope.data.KEYWORDS = [];
        };
        /**
         * [getAudioVideoPlayer description]获得音视频的播放地址
         * @param  {[obj]} item  [description]音视频信息
         * @return {[type]}      [description]
         */
        $scope.getAudioVideoPlayer = function(item) {
            uploadAudioVideoService.getPlayerById(item.id).then(function(data) {
                if (angular.isDefined(data.err)) {
                    $timeout(function() {
                        $scope.getAudioVideoPlayer(item); //刷到视频上传成功为止
                    }, 10000);
                }
                item.value = data;
            });
        };
        /**
         * [deleteAudioVideo description]删除音视频
         * @param  {[obj]} item  [description]音视频信息
         * @return {[type]}      [description]
         */
        $scope.deleteAudioVideo = function(item) {
            trsconfirm.confirmModel("删除音视频", "确定要删除选中的音/视频？", function() {
                for (var i = 0; i < $scope.list.AUDIOVIDEO.length; i++) {
                    if (item.id === $scope.list.AUDIOVIDEO[i]) {
                        $scope.list.AUDIOVIDEO.splice(i, 1);
                        break;
                    }
                }
                for (var j = 0; j < $scope.status.audioVideoidsArray.length; j++) {
                    if (item.id === $scope.status.audioVideoidsArray[j].id) {
                        $scope.status.audioVideoidsArray.splice(i, 1);
                        break;
                    }
                }
            });
        };
        /**
         * [downloadAudioVideo description]下载音视频
         * @param  {[str]} id  [description]音视频id
         * @return {[type]}    [description]
         */
        $scope.downloadAudioVideo = function(id) {
            uploadAudioVideoService.download(id);
        };
        /**
         * [dealAttributeBeforeSave description]保存前处理保存属性
         * @return {[obj]} [description]list对象
         */
        function dealAttributeBeforeSave() {
            $scope.status.openBtn = false;
            getKeyWords();
            var list = angular.copy($scope.list);
            list.AUDIOVIDEO = $scope.list.AUDIOVIDEO.join(',');
            if (angular.isDefined(list.FGD_AUTHINFO[0]) && (!angular.isDefined(list.FGD_AUTHINFO[0].USERNAME) || list.FGD_AUTHINFO[0].USERNAME === "")) { //处理发稿单作者信息空数据提交问题
                list.FGD_AUTHINFO = [];
            }
            list = jsonArrayToStringService.jsonArrayToString(list);
            //处理发稿单作者信息空数据提交问题
            list.serviceid = "mlf_appmetadata";
            list.methodname = "saveVideoDoc";
            return list;
        }
        /**
         * [dealAttributeAfterSave description]保存成功后处理属性
         * @param  {[obj]} data [description]保存后后台返回值
         * @param  {[boolean]} flag [description]标识位
         * @return {[type]}      [description]
         */
        function dealAttributeAfterSave(data, flag) {
            $scope.status.openBtn = true;
            $state.params.chnldocid = $scope.list.CHNLDOCID = data.CHNLDOCID;
            $state.params.metadataid = $scope.list.METADATAID = data.METADATAID;
            if (flag) {
                storageListenerService.addListenerToApp("save");
                $state.transitionTo($state.current, $state.params, {
                    reload: false
                });
                trsconfirm.saveModel("保存成功", "", "success");
            }
        }
        /**
         * [save description]保存稿件
         * @return {[type]}    [description]null
         */
        $scope.save = function() {
            save(true).then(function() {
                getVersion($scope.list.METADATAID);
            });
        };
        /**
         * [save description]保存方法
         * @param  {[boolean]} flag [description]标示位
         * @return {[type]}      	[description]
         */
        function save(flag) {
            var deferred = $q.defer();
            if($scope.list.AUDIOVIDEO.length == 0 && $scope.list.AUDIOVIDEOURL == '') {
                trsconfirm.alertType("提交失败", "请添加视频", "error", false);
                return deferred.promise;
            }
            $validation.validate($scope.videoForm.authorForm);
            $validation.validate($scope.videoForm)
            	.success(function() {
	            	$scope.videoForm.$setPristine();
	                var list = dealAttributeBeforeSave();
	                trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), list, "post").then(function(data) {
	                	dealAttributeAfterSave(data, flag);
	                	deferred.resolve(data);
	                }, function(data) {
	                	deferred.reject(data);
	                });
	            }).error(function() {
	            	editingCenterService.checkSaveError($scope.videoForm); //定位输入错的表单位置
	                    $timeout(function() {
	                        trsconfirm.alertType("提交失败", "请检查填写项", "error", false);
	                    }, 300);
	            });
            return deferred.promise;
        }
        /**
         * [close description]关闭页面
         * @return {[type]} [description]
         */
        $scope.close = function() {
            editingCenterService.closeWinow($scope.videoForm.$dirty, '').then(function() {
                save().then(function() {
                    storageListenerService.addListenerToApp("save");
                    $window.open('about:blank', '_self').close();
                });
            }, function() {
            	$window.open('about:blank', '_self').close();
            });
        };
        /**
         * [appTrial description]APP送审操作
         * @return {[type]} [description]
         */
        $scope.appTrial = function() {
            save().then(function() {
                trial();
            });
        };
        /**
         * [trial description]稿件送审
         * @return {[type]} [description]
         */
        function trial() {
            trsconfirm.inputModel("送审", "请输入送审意见", function(content) {
                var params = {
                    "serviceid": "mlf_appoper",
                    "methodname": "trialMetaDatas",
                    "MetaDataIds": $scope.list.METADATAID,
                    "ChnlDocIds": $scope.list.CHNLDOCID,
                    "ChannelId": $state.params.channelid,
                    "Opinion": content
                };
                trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function(data) {
                    trsconfirm.alertType("送审成功", "", "success", false, function() {
                        storageListenerService.addListenerToApp("send");
                        $window.close();
                    });
                });
            });
        }
        /**
         * [appRevoke description]稿件撤稿
         * @return {[type]} [description]
         */
        $scope.appRevoke = function() {
            save().then(function(data) {
                revoke();
            });
        };
        /**
         * [revoke description]撤稿函数
         * @return {[type]} [description]
         */
        function revoke() {
            trsconfirm.inputModel("撤稿", "请输入撤稿意见", function(content) {
                var params = {
                    serviceid: "mlf_appoper",
                    methodname: "rejectionMetaDatas",
                    ChnlDocIds: $scope.list.CHNLDOCID,
                    MetaDataIds: $scope.list.METADATAID,
                    Opinion: content,
                    ChannelId: $state.params.channelid
                };
                trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function() {
                    trsconfirm.alertType("撤稿成功", "", "success", false, function() {
                        storageListenerService.addListenerToApp("revoke");
                        $window.close();
                    });
                });
            });
        }
        /**
         * [appSignDirect description]app直接签发
         * @return {[type]} [description]
         */
        $scope.appSignDirect = function() {
            save().then(function() {
                signDirect();
            });
        };
        /**
         * [signDirect description]直接签发
         * @return {[type]} [description]
         */
        function signDirect() {
            trsconfirm.confirmModel('签发', '确认发布稿件', function() {
                var methodname = ["appDaiBianPublish", "appDaiShenPublish", "appYiQianFaPublish"];
                var params = {
                    serviceid: "mlf_appoper",
                    methodname: methodname[$state.params.platform],
                    ObjectIds: $scope.list.CHNLDOCID,
                    ChnlDocIds: $scope.list.CHNLDOCID,
                    MetaDataIds: $scope.list.METADATAID,
                };
                trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "post").then(function(data) {
                    trsconfirm.alertType("签发成功", "", "success", false, function() {
                        storageListenerService.addListenerToApp("directSign");
                        $window.close();
                    });
                });
            });
        }
        /**
         * [appSignTiming description]定时签发
         * @return {[type]} [description]
         */
        $scope.appSignTiming = function() {
            save().then(function() {
                timeSign();
            });
        };
        /**
         * [timeSign description]定时签发函数
         * @return {[type]} [description]
         */
        function timeSign() {
            var methodname = ['appDaiBianTimingPublish', 'appDaiShenTimingPublish'];
            var params = {
                selectedArray: [$scope.list],
                isNewDraft: true,
                methodname: methodname[$state.params.platform],
                serviceid: "mlf_appoper",
            };
            editingCenterService.draftTimeSinged(params).then(function(data) {
                trsconfirm.alertType("定时签发成功", "", "success", false, function() {
                    storageListenerService.addListenerToApp("timeSign");
                    $window.close();
                });
            });
        }
        /**
         * [appPreview description]稿件预览
         * @return {[type]} [description]
         */
        $scope.appPreview = function() {
            save().then(function(data) {
                preview();
            });
        };
        /**
         * [preview description]预览方法
         * @return {[type]} [description]
         */
        function preview() {
            editingCenterService.draftPublish($state.params.chnldocid);
        }

    }]);
