"use strict";
angular.module('editCenterNewsModule', ["util.ueditor", "mgcrea.ngStrap.scrollspy"]).
controller('EditingCenterNewsController', ["$scope", "$filter", "$compile", "$window", "localStorageService", "$modal", "$state", "$timeout", "$location", "$anchorScroll", '$stateParams', '$validation', "$q", "trsHttpService", 'initAddMetaDataService', 'editingCenterAppService', "initVersionService", "jsonArrayToStringService", "trsconfirm", "initeditctrBtnsService", "editingCenterService", "storageListenerService", "ueditorService", "initAppRequiredBtnService", "appDictionaryBtnService", "filterEditctrBtnsService", "editcenterRightsService", "editIsLock", "trsSelectDocumentService", "trsspliceString", "uploadAudioVideoService",
    function($scope, $filter, $compile, $window, localStorageService, $modal, $state, $timeout, $location, $anchorScroll, $stateParams, $validation, $q, trsHttpService, initAddMetaDataService, editingCenterAppService, initVersionService, jsonArrayToStringService, trsconfirm, initeditctrBtnsService, editingCenterService, storageListenerService, ueditorService, initAppRequiredBtnService, appDictionaryBtnService, filterEditctrBtnsService, editcenterRightsService, editIsLock, trsSelectDocumentService, trsspliceString, uploadAudioVideoService) {
        initStatus();
        initData();

        function initStatus() {
            $scope.page = {
                CURRPAGE: 1,
                PAGESIZE: 20,
            };
            $scope.status = {
                support: {
                    content: "" //提交给辅助写作的纯文本
                },
                searchOffical: "",
                openBtn: true,
                bitFaceTit: "查看痕迹",
                isHasBigFace: false,
                listStyleBigPicture: 3, //列表样式大图
            };
            $scope.data = {
                copyVersion: [],
                listStyle: editingCenterAppService.initListStyle(),
                label: editingCenterAppService.initLabel(),
                commentSet: editingCenterAppService.initCommentSet(),
                docGenre: editingCenterAppService.initDocGenre(),
                relevantofficials: [],
                version: [],
                KEYWORDS: [],
                relNewsSelectedItems: [], //相关新闻集合
                relOfficerSelectedItems: [], //相关官员集合
            };
            $scope.params = {
                serviceid: "mlf_appmetadata",
                methodname: "getNewsDoc",
                ChnlDocId: $stateParams.chnldocid,
            };
            $scope.handleBtnClick = function(funname) {
                eval("$scope." + funname + "()");
            };
            $scope.status.hasVersionTime = angular.isDefined($stateParams.chnldocid) ? true : false;
            emitCloseWindow();
        }

        function initData() {
            getCutPictureWidthHeight();
            angular.isDefined($stateParams.chnldocid) ? initEditData() : initNewData();
            editcenterRightsService.getRightsofBigFace($stateParams.siteid, 'appsite.trace').then(function(data) {
                $scope.status.bigFaceRights = data;
                $scope.status.isHasBigFace = true;
            });
            initBtnArray();
        }
        /**
         * [initEditData description]初始化编辑页
         * @return {[type]} [description]
         */
        function initEditData() {
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), $scope.params, "get").then(function(data) {
                $scope.list = data;
                dealWithRelated(data);
                loadDirective();
                getVersion();
                initKeyWords();
                reWriteImg();
            });
            //稿件加锁
            $timeout(function() {
                editIsLock.lockDraft($stateParams.metadataid);
            }, 1700);
        }
        /**
         * [initNewData description]初始化新页面
         * @return {[type]} [description]
         */
        function initNewData() {
            $scope.list = initAddMetaDataService.initNews();
            loadDirective();
        }
        /**
         * [emitCloseWindow description]标签页关闭页面时，发送稿件解锁信息给其他页面，协助解锁该稿件
         * @return {[type]} [description]
         */
        function emitCloseWindow() {
            $window.onbeforeunload = function() {
                localStorageService.set("unLocakDraft", { metadataid: $stateParams.metadataid });
            };
        }
        /**
         * [dealWithRelated description]处理相关新闻和相关官员返回值在没有时候回返回分页信需要处理
         * @param  {[type]} data [description]
         * @return {[type]}      [description]
         */
        function dealWithRelated(data) {
            $scope.data.relNewsSelectedItems = !data.RELEVANTNEWS || data.RELEVANTNEWS.PAGER ? [] : data.RELEVANTNEWS; //相关新闻赋值
            $scope.data.relOfficerSelectedItems = !data.RELEVANTOFFICIALS || data.RELEVANTOFFICIALS.PAGER ? [] : data.RELEVANTOFFICIALS; //相关官员复制
        }
        /**
         * [getCutPictureWidthHeight description]获取图片编辑默认宽高
         * @return {[type]} [description]
         */
        function getCutPictureWidthHeight() {
            var params = {
                serviceid: 'mlf_appconfig',
                methodname: 'getPicsSize',
                objectid: $stateParams.siteid
            };
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function(data) {
                $scope.status.pictureSize = {
                    LISTPICSSIZE: data.LISTPICSIZE === "" ? "100,100" : data.LISTPICSIZE,
                    FOCUSIMAGESIZE: data.FOCUSIMAGESIZE === "" ? "100,100" : data.FOCUSIMAGESIZE,
                    FIGURESIZE: data.FIGURESIZE === "" ? "100,100" : data.FIGURESIZE,
                    LISTBIGPICSIZE: data.LISTBIGPICSIZE === "" ? "100,100" : data.LISTBIGPICSIZE,
                };
            });
        }
        /**
         * [selectListStyle description]选择列表样式
         * @param  {[obj]} listStyle  [description]列表样式对象
         * @return {[type]}           [description]
         */
        $scope.selectListStyle = function(listStyle) {
            $scope.list.LISTSTYLE = listStyle.value;
        };
        /**
         * [updateCKSelection description]trsCheckBox的回调函数
         * @param  {[str]} attribute [description]需要改变的属性
         * @return {[type]}           [description]
         */
        $scope.updateCKSelection = function(attribute, pictureType) {
            $scope.list[attribute] = $scope.list[attribute] == 0 ? 1 : 0;
        };
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
         * 新闻稿重构以及新增代码
         * 
         */
        function loadDirective() {
            LazyLoad.js(["./lib/ueditor2/ueditor.config.js?v=11.0", "./lib/ueditor2/ueditor.all.js?v=11.0",'./components/util/ueditor/dialogs/material/registerDialog.js','./components/util/ueditor/dialogs/material/registerDialogImg.js'], function() {
                var ueditor = '<ueditor form="newsForm" versionid = "data.lastVersionid" list="list"></ueditor>';
                ueditor = $compile(ueditor)($scope);
                $($(angular.element(document)).find('ueditorLocation')).append(ueditor);
                var ue = UE.getEditor('ueditor');
                $scope.status.support.content = $scope.list.CONTENT;
                ue.ready(function() {
                    ue.addListener("keydown", function(type, event) {
                        if (event.keyCode === 13) {
                            //获取纯文本
                            // $scope.status.support.content = ue.getContentTxt();
                        }
                    });
                });
                var supportCreation = '<support-creation></support-creation>';
                supportCreation = $compile(supportCreation)($scope);
                $($(angular.element(document)).find('supportcreation')).append(supportCreation);
            });
            /*var ueditor = '<ueditor list="list"></ueditor>';
            ueditor = $compile(ueditor)($scope);
            $($(angular.element(document)).find('ueditorLocation')).append(ueditor);*/
            var draftList = '<editor-dir meta-data-id="{{list.METADATAID}}" editor-json="list.FGD_EDITINFO" show-all-tips="showAllTips" editor-form="newsForm"></editor-dir>' +
                '<editor-auth-dir author="list.FGD_AUTHINFO"></editor-auth-dir>';
            draftList = $compile(draftList)($scope);
            $($(angular.element(document)).find('editor')).append(draftList);
        }
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
        //检验关键词的总个数和总记录长度
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
                        if (containArr.indexOf(spaceArr[i]) < 0 && spaceArr[i] != '') {
                            $scope.data.KEYWORDS.push({ 'name': spaceArr[i] });
                            containArr.push(spaceArr[i]);
                        }
                    }
                });
            }
        };
        $scope.leave = function() {
            $scope.isShowKeywordTips = false;
        };
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
         * @return {[type]} [description]
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
        //空格增加关键词
        $scope.addkeywords = function(e) {
            if (e.keyCode == 32 && $scope.list.KEYWORDS.indexOf($scope.keywordTxt) < 0) {
                $scope.data.KEYWORDS.push($scope.keywordTxt);
                $scope.keywordTxt = "";
            }
        };
        //删除关键词
        $scope.delete = function(record) {
            $scope.list.KEYWORDS.splice(record, 1);
        };
        /*点击保存*/
        $scope.save = function() {
            save(true).then(function() {
                getVersion($scope.list.METADATAID);
            });
        };
        /**
         * [saveContent description]保存正文
         * @return {[type]} [description]
         */
        function saveContent() {
            ueditorService.saveContent($scope.list);
        }
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
                    "ChannelId": $stateParams.channelid,
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
                    methodname: methodname[$stateParams.platform],
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
                methodname: methodname[$stateParams.platform],
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
            editingCenterService.draftPublish($stateParams.chnldocid);
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
                    ChannelId: $stateParams.channelid
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
         * [savePublish description]保存并发布
         * @return {[type]} [description]
         */
        $scope.savePublish = function() {
            save().then(function(data) {
                signDirect();
            });
        };
        /**
         * [close description]关闭页面
         * @return {[type]} [description]
         */
        $scope.close = function() {
            editingCenterService.closeWinow($scope.newsForm.$dirty, ueditorService.contentTranscoding($scope.list) != ueditorService.bindContent()).then(function() {
                save().then(function() {
                    storageListenerService.addListenerToApp("save");
                    editIsLock.normalLock($stateParams.metadataid).then(function(data) {
                        $window.open('about:blank', '_self').close();
                    });
                });
            }, function() {
                angular.isDefined($stateParams.metadataid) ?
                    editIsLock.normalLock($stateParams.metadataid).then(function(data) {
                        $window.open('about:blank', '_self').close();
                    }) : $window.open('about:blank', '_self').close();
            });
        };
        /**
         * [dealAttributeBeforeSave description]保存前处理保存属性
         * @return {[obj]} [description]list对象
         */
        function dealAttributeBeforeSave() {
            $scope.status.openBtn = false;
            getKeyWords();
            var list = angular.copy($scope.list);
            list.LISTPICS = angular.copy(jsonArrayToStringService.clearEmptyArray(list.LISTPICS));
            list.RELEVANTNEWSIDS = trsspliceString.spliceString($scope.data.relNewsSelectedItems, 'METADATAID', ","); //相关新闻字段
            list.RELEVANTOFFICIALSIDS = trsspliceString.spliceString($scope.data.relOfficerSelectedItems, 'METADATAID', ","); //相关官员字段
            if (angular.isDefined(list.FGD_AUTHINFO[0]) && (!angular.isDefined(list.FGD_AUTHINFO[0].USERNAME) || list.FGD_AUTHINFO[0].USERNAME === "")) { //处理发稿单作者信息空数据提交问题
                list.FGD_AUTHINFO = [];
            }
            list = jsonArrayToStringService.jsonArrayToString(list);
            //处理发稿单作者信息空数据提交问题
            list.serviceid = "mlf_appmetadata";
            list.methodname = "saveNewsDoc";
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
            $stateParams.chnldocid = $scope.list.CHNLDOCID = data.CHNLDOCID;
            $stateParams.metadataid = $scope.list.METADATAID = data.METADATAID;
            if (flag) {
                storageListenerService.addListenerToApp("save");
                $state.transitionTo($state.current, $stateParams, {
                    reload: false
                });
                trsconfirm.saveModel("保存成功", "", "success");
            } else {
                $scope.params.MetaDataIds = $scope.list.METADATAID;
                $scope.params.CHNLDOCIDS = $scope.list.CHNLDOCID;
                $scope.params.ObjectIds = $scope.list.CHNLDOCID;
                $scope.params.serviceid = "mlf_appoper";
            }
        }
        /**
         * [save description]保存方法
         * @param  {[boolean]} flag [description]标示位
         * @return {[type]}      [description]
         */
        function save(flag) {
            var deferred = $q.defer();
            var ue = UE.getEditor('ueditor');
            saveContent();
            $validation.validate($scope.newsForm.authorForm);
            $validation.validate($scope.newsForm)
                .success(function() {
                    $scope.newsForm.$setPristine();
                    var list = dealAttributeBeforeSave();
                    trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), list, "post").then(function(data) {
                        dealAttributeAfterSave(data, flag);
                        deferred.resolve(data);
                    }, function(data) {
                        deferred.reject(data);
                    });
                }).error(function() {
                    editingCenterService.checkSaveError($scope.newsForm); //定位输入错的表单位置
                    $timeout(function() {
                        trsconfirm.alertType("提交失败", "请检查填写项", "error", false);
                    }, 300);
                });
            return deferred.promise;
        }
        /**
         * [getVersion description]获取流程版本与操作日志
         * @return {[type]} [description]
         */
        function getVersion(id) {
            var metadataid = angular.isDefined(id) ? id : $stateParams.metadataid;
            editingCenterService.getEditVersionTime(metadataid, $scope.page, $scope.data.copyVersion).then(function(data) {
                $scope.data.version = data;
                $scope.page = data.page;
                $scope.data.copyVersion = data.copyArray;
                $scope.status.hasVersionTime = true;
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
                $scope.list[attribute][index] = {};
            } else {
                $scope.list[attribute] = [];
            }
        };
        /**
         * [getKeywordsOrAbstract description]提取关键词或摘要
         * @param  {[str]} type [description]关键词类型或摘要
         * @return {[type]}      [description]
         */
        $scope.getKeywordsOrAbstract = function(type) {
            editingCenterService.getKeywordsOrAbstract(type, ueditorService.bindContent()).then(function(data) {
                if (type === "keywords") {
                    if (data !== '""') {
                        var arr = [];
                        var keywordsArray = data.substring(1, data.length - 1).split(";");
                        angular.forEach(keywordsArray, function(value, key) {
                            arr.push({
                                name: value,
                            });
                        });
                        $scope.data.KEYWORDS = $scope.data.KEYWORDS.concat(arr);
                        $scope.data.KEYWORDS = $filter('unique')($scope.data.KEYWORDS, "name");
                    } else {
                        return;
                    }
                }
                if (type === "abstract")
                    $scope.list.ABSTRACT = data.substring(1, data.length - 1);
            }, function(data) {

            });
        };
        /**
         * [clearAllKeywords description]清楚关键词
         * @return {[type]} [description]
         */
        $scope.clearAllKeywords = function() {
            $scope.data.KEYWORDS = [];
        };
        /**
         * [initBtnArray description]初始化功能按钮
         * @return {[type]} [description]
         */
        function initBtnArray() {
            //所需的按钮
            $scope.data.appRequiredBtns = initAppRequiredBtnService.initAppRequiredBtns()[$stateParams.platform];
            //根据不同平台调用不同权限方法
            $scope.data.rightsMethod = ['app.daibian', 'app.daishen', 'app.yiqianfa'];
            initeditctrBtnsService.initAppData($stateParams.channelid, $scope.data.rightsMethod[$stateParams.platform]).then(function(data) {
                //字典按钮
                $scope.data.dictionaryBtn = [appDictionaryBtnService.initAppCompBtn(), appDictionaryBtnService.initAppPendBtn(), appDictionaryBtnService.initAppSignBtn()];
                $scope.status.btnStatus = initeditctrBtnsService.initBtns(data, $scope.data.dictionaryBtn[$stateParams.platform]);
                //最终得到的按钮
                $scope.data.arrayBtn = filterEditctrBtnsService.filterBtn($scope.status.btnStatus, $scope.data.appRequiredBtns);
                addBtn();
            });
        }
        /**
         * [addBtn description]新增保存关闭按钮
         */
        function addBtn() {
            var OPERDESC = ['保存', '保存', '保存并发布'];
            var OPERFUN = ['save', 'save', 'savePublish'];
            $scope.data.arrayBtn.unshift({
                RIGHTINDEX: "save",
                OPERDESC: OPERDESC[$stateParams.platform],
                OPERNAME: "",
                OPERFUN: OPERFUN[$stateParams.platform]
            });
            $scope.data.arrayBtn.push({
                RIGHTINDEX: "close",
                OPERDESC: "关闭",
                OPERNAME: "",
                OPERFUN: "close"
            });
        }
        /**
         * [visualChooseWindow description]可视化选择弹窗，选择相关新闻
         * @return {[type]} [description]
         */
        $scope.visualChooseWindow = function() {
            trsSelectDocumentService.trsSelectDocument({
                siteid: $state.params.siteid,
                relNewsData: angular.copy($scope.data.relNewsSelectedItems),
                position: $stateParams.status,
                showMetadaId: true
            }, function(result) {
                angular.forEach(result, function(value, key) {
                    value.METADATAID = value.metadataId;
                    value.TITLE = value.title;
                });
                $scope.data.relNewsSelectedItems = result;
            });
        };
        /**
         * [relNesDelete description]删除相关新闻
         * @param  {[str]} curIndex  [description]对应的下标值
         * @return {[type]}          [description]
         */
        $scope.relNesDelete = function(curIndex) {
            $scope.data.relNewsSelectedItems.splice($scope.data.relNewsSelectedItems.indexOf(curIndex), 1);
        };
        /**
         * [visualChooseOfficer description]选择相关官员
         * @return {[type]} [description]
         */
        $scope.visualChooseOfficer = function() {
            trsSelectDocumentService.trsSelectDocument({
                siteid: $state.params.siteid,
                relNewsData: angular.copy($scope.data.relOfficerSelectedItems),
                position: $stateParams.status,
                showMetadaId: true
            }, function(result) {
                angular.forEach(result, function(value, key) {
                    value.METADATAID = value.metadataId;
                    value.NAME = value.name;
                });
                $scope.data.relOfficerSelectedItems = result;
            }, editingCenterAppService.relatedOfficerParams());
        };
        /**
         * [relNesDelete description]删除相关官员
         * @param  {[str]} curIndex  [description]对应的下标值
         * @return {[type]}          [description]
         */
        $scope.relOfficerDelete = function(curIndex) {
            $scope.data.relOfficerSelectedItems.splice($scope.data.relOfficerSelectedItems.indexOf(curIndex), 1);
        };

    }
]);
