"use strict";
angular.module('wechatGraphicModule', []).
controller('WechatGraphicCtrl', ['$scope', '$compile', "$state", "$stateParams", "$timeout", "$q", "$filter", "$validation", "$window", "trsHttpService", "ueditorService", "jsonArrayToStringService", "editingCenterService", "trsconfirm", "initWeiXinDataService", "WeiXininitService", "storageListenerService", "initWechatNewsService", "initeditctrBtnsService", "wechatBtnService", "filterEditctrBtnsService", "editcenterRightsService", "editIsLock", "localStorageService",
    function($scope, $compile, $state, $stateParams, $timeout, $q, $filter, $validation, $window, trsHttpService, ueditorService, jsonArrayToStringService, editingCenterService, trsconfirm, initWeiXinDataService, WeiXininitService, storageListenerService, initWechatNewsService, initeditctrBtnsService, wechatBtnService, filterEditctrBtnsService, editcenterRightsService, editIsLock, localStorageService) {
        var ue; //百度编辑器
        initStatus();
        initData();

        function initStatus() {
            $scope.page = {
                CURRPAGE: 1,
                PAGESIZE: 20
            };
            $scope.status = {
                support: {
                    content: "" //提交给辅助写作的纯文本
                },
                hasVersionTime: false, //是否存在流程版本,
                wechatTemplate: "",
                bitFaceTit: "查看痕迹",
                isHasBigFace: false,
                openBtn: true,
                showSection: true
            };
            $scope.data = {
                version: [],
                copyVersion: [],
                lastVersionid: "",
                DocGenre: WeiXininitService.initDocGenre(),
            };
            emitCloseWindow();
        }
        function initData() {
            if ($stateParams.metadataid) { //编辑
                initEditData();                
            } else { //新建
                $scope.list = initWeiXinDataService.initNews();
                loadDirective();
                initKeyWords();
            }    
        }

        /**
         * [initEditData description]初始化编辑页面
         * @return {[type]} [description]
         */
        function initEditData() {
            var params = {
                "serviceid": "nb_wechatdoc",
                "methodname": "getWeChatPicsDoc",
                "MetaDataId": $state.params.metadataid,
                "WXChannelId": $stateParams.wxchannelid
            };
            $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function(data) {
                $scope.list = data;
                $scope.status.isHasBigFace = true;
                //初始化处理概览图片,仅编辑时生效
                reWriteImg();
                //获取流程版本
                getVersion().then(function(data) {
                    loadDirective();
                });
                initKeyWords();
            });
            //稿件加锁
            $timeout(function() {
                editIsLock.lockDraft($stateParams.metadataid);
            }, 1700);
            showBigFaceRights();
        }
        /**
         * [emitCloseWindow description]标签页关闭页面时，发送稿件解锁信息给其他页面，协助解锁该稿件
         * @return {[type]} [description]
         */
        function emitCloseWindow() {
            window.onbeforeunload = function() {
                localStorageService.set("unLocakDraft", { metadataid: $stateParams.metadataid });
            };
        }
        /**
         * [getBigFaceRights description]展示查看痕迹按钮
         * @return {[type]} [description]
         */
        function showBigFaceRights() {
            editcenterRightsService.initWeixinListBtn('wechat.trace', $stateParams.wxchannelid).then(function(data) {
                $scope.status.bigFaceRights = data;
            });
        }
        //初始化关键词
        function initKeyWords() {
            if (angular.isDefined($scope.list.KEYWORDS) && $scope.list.KEYWORDS !== "") {
                var KEYWORDS = $scope.list.KEYWORDS.split(";");
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
                        if (containArr.indexOf(spaceArr[i]) < 0 && spaceArr[i] !== '') {
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
        };

        //组装关键词为数组开始
        function getKeyWords() {
            $scope.list.KEYWORDS = "";
            angular.forEach($scope.data.KEYWORDS, function(data, index, array) {
                if (index != ($scope.data.KEYWORDS.length - 1)) {
                    $scope.list.KEYWORDS += data.name + ";";
                } else {
                    $scope.list.KEYWORDS += data.name;
                }
            });
        }
        //组装关键词为数组结束

        //不发稿费选择按钮
        $scope.updateCKSelection = function(variable) {
            $scope.list[variable] = $scope.list[variable] == 1 ? 0 : 1;
        };

        function saveContent() {
            ueditorService.saveContent($scope.list);
        }

        $scope.save = function() {
            var ue = UE.getEditor('ueditor');
            save(true).then(function() {
                getVersion($scope.list.METADATAID);
                var params = {
                    "serviceid": "nb_wechatdoc",
                    "methodname": "getWeChatDocNews",
                    "MetaDataId": $scope.list.METADATAID,
                    "WXChannelId": $state.params.wxchannelid,
                };
                $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function(data) {
                    ue.ready(function() {
                        ue.setContent(data.HTMLCONTENT);
                        ueditorService.saveToLocal($scope.list.METADATAID, $scope.data.lastVersionid);
                        //新建稿件完成，加载查看痕迹按钮
                        editcenterRightsService.initWeixinListBtn('wechat.trace', $stateParams.wxchannelid).then(function(data) {
                            $scope.status.bigFaceRights = data;
                            $scope.status.isHasBigFace = true;
                        });
                    });
                });
            });
        };


        /**
         * [save description]稿件保存方法
         * @param  {[Boolean]} flag [description]标识
         * @return {[type]}      [description]
         */
        function save(flag) {
            var deferred = $q.defer();
            var ue = UE.getEditor('ueditor');
            saveContent();
            $validation.validate($scope.newsForm.authorForm);
            $validation.validate($scope.newsForm)
                .success(function() {
                    ueditorService.saveToLocal($scope.list.METADATAID);
                    $scope.newsForm.$setPristine();
                    /*editcenterRightsService.initWeixinListBtn('wechat.trace', $stateParams.wxchannelid).then(function(data) {
                        $scope.status.bigFaceRights = data;
                        $scope.status.isHasBigFace = true;
                    });*/
                    var list = manageSaveObjBeforeSave();
                    $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getWCMRootUrl(),
                        list, "post").then(function(data) {
                        manageDataAfterSave(data, flag);
                        deferred.resolve(data);
                    }, function(data) {
                        $scope.status.openBtn = true;
                        deferred.reject(data);
                    });
                })
                .error(function(msg) {
                    $scope.showAllTips = true;
                    editingCenterService.checkSaveError($scope.newsForm);
                    trsconfirm.saveModel("保存失败", "请检查填写项", "error");
                });
            return deferred.promise;
        }

        /**
         * [manageSaveObjBeforeSave description]在保存前处理保存对象
         * @return {[type]} [description]
         */
        function manageSaveObjBeforeSave() {
            getKeyWords();
            $scope.status.openBtn = false;
            $scope.list.serviceid = "nb_wechatdoc"; //在编辑时后台为返回服务名
            $scope.list.Methodname = "saveWeChatImgNewsDoc";
            $scope.list.APPFILE = $scope.list.SRCFILE = $scope.list.DOC_PICTURELIST[0].APPFILE;
            var list = angular.copy($scope.list);


            //处理发稿单作者信息空数据提交问题
            if (angular.isDefined(list.FGD_AUTHINFO[0]) && (!angular.isDefined(list.FGD_AUTHINFO[0].USERNAME) || list.FGD_AUTHINFO[0].USERNAME === "")) {
                list.FGD_AUTHINFO = [];
            }
            //处理发稿单作者信息空数据提交问题
            // list.ATTACHFILE = angular.copy(jsonArrayToStringService.clearEmptyObjects(list.ATTACHFILE, "APPFILE"));
            //JSON对象数组转字符串
            list = jsonArrayToStringService.jsonArrayToString(list);
            list.HTMLCONTENT = list.HTMLCONTENT.replace(/_ueditor_page_break_tag_/g, "<hr class='pagebreak' noshade='noshade' size='5' style='-webkit-user-select: none;'>");
            return list;
        }

        /**
         * [manageDataAfterSave description]保存操作完成后进行数据处理
         * @param  {[type]} data [description]保存后的返回值
         * @param  {[type]} flag [description]调用保存服务后是否弹出成功窗口判断
         * @return {[type]}      [description]
         */
        function manageDataAfterSave(data, flag) {
            $scope.status.openBtn = true;
            if(!$state.params.metadataid) showBigFaceRights();
            $stateParams.metadataid = $scope.list.METADATAID = data.METADATAID;
            $stateParams.chnldocid = $scope.list.CHNLDOCID = data.CHNLDOCID;
            if (flag) {
                storageListenerService.addListenerToWeixin("save");
                $state.transitionTo($state.current, $stateParams, {
                    reload: false
                });
                trsconfirm.saveModel("保存成功", "", "success");
            }
        }

        //动态加载指令
        function loadDirective() {
            LazyLoad.js(["./lib/ueditor2/ueditor.config.js?v=11.0", "./lib/ueditor2/ueditor.all.js?v=11.0"], function() {
                var ueditor = '<ueditor form="newsForm" versionid = "data.lastVersionid" list="list"></ueditor>';
                ueditor = $compile(ueditor)($scope);
                $($(angular.element(document)).find('ueditorLocation')).append(ueditor);
                ue = UE.getEditor('ueditor');
                $scope.status.support.content = $scope.list.CONTENT;
                ue.ready(function() {
                    ue.addListener("keydown", function(type, event) {
                        if (event.keyCode === 13) {
                            //获取纯文本
                            $scope.status.support.content = ue.getContentTxt();
                        }
                    });
                });
                var supportCreation = '<support-creation></support-creation>';
                supportCreation = $compile(supportCreation)($scope);
                $($(angular.element(document)).find('supportcreation')).append(supportCreation);
            });
            var draftList = '<editor-dir meta-data-id="{{list.METADATAID}}" editor-json="list.FGD_EDITINFO" show-all-tips="showAllTips" editor-form="newsForm"></editor-dir>' +
                '<editor-auth-dir author="list.FGD_AUTHINFO"></editor-auth-dir>';
            draftList = $compile(draftList)($scope);
            $($(angular.element(document)).find('editor')).append(draftList);
        }

        /**
         * [getVersion description]获取流程版本与操作日志
         * @return {[type]} [description]
         */
        function getVersion(id) {
            var deferred = $q.defer();
            var metadataid = angular.isDefined(id) ? id : $stateParams.metadataid;
            editingCenterService.getEditVersionTime(metadataid, $scope.page, $scope.data.copyVersion).then(function(data) {
                $scope.data.version = data;
                $scope.page = data.page;
                $scope.data.copyVersion = data.copyArray;
                $scope.status.hasVersionTime = true;
                $scope.data.lastVersionid = data.lastVersionid;
                deferred.resolve();
            });
            return deferred.promise;
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
         * [getKeywordsOrAbstract description]获得关键词或者摘要
         * @param  {[str]} type [description]种类
         * @return {[type]}      [description]
         */
        $scope.getKeywordsOrAbstract = function(type) {
            editingCenterService.getKeywordsOrAbstract(type, ueditorService.bindContent()).then(function(data) {
                if (type === "keywords") {
                    if (data !== '""') {
                        var keywordsArray = data.substring(1, data.length - 1).split(";");
                        var arr = [];
                        angular.forEach(keywordsArray, function(value, key) {
                            arr.push({
                                name: value
                            });
                        });
                        $scope.data.KEYWORDS = $scope.data.KEYWORDS.concat(arr);
                        $scope.data.KEYWORDS = $filter('unique')($scope.data.KEYWORDS, "name");
                    } else {
                        return;
                    }
                }
                if (type === "abstract")
                    $scope.list.DOCABSTRACT = data.substring(1, data.length - 1);
            }, function(data) {});
        };

        /**
         * [clearAllKeywords description]清空关键词
         * @return {[type]} [description]
         */
        $scope.clearAllKeywords = function() {
            $scope.data.KEYWORDS = [];
        };


        /**
         * [close description]页面关闭
         * @return {[type]} [description]
         */
        $scope.close = function() {
            editingCenterService.closeWinow($scope.newsForm.$dirty, ueditorService.contentTranscoding($scope.list) != ueditorService.bindContent(), false).then(function() {
                save().then(function() {
                    storageListenerService.addListenerToWeixin("save");
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
         * [getSuggestions description]获取suggestion
         * @param  {[str]} viewValue [description]输入框内输入值
         * @return {[type]}           [description]
         */
        $scope.getSuggestions = function(viewValue) {
            var searchUsers = {
                serviceid: "mlf_website",
                methodname: "getReleaseSource",
                SrcName: viewValue,
                SiteId: $stateParams.siteid,
            };
            if (viewValue !== '') {
                return trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), searchUsers, "post").then(function(data) {
                    return data;
                });
            }
        };
        /**
         * [description]Suggestion 监听
         */
        $scope.$watch('list.DOCSOURCENAME', function(newValue, oldValue, scope) {
            if (!angular.isObject(newValue)) {
                $scope.status.isRequest = true;
                newValue = {
                    SRCNAME: newValue,
                    SOURCEID: "0"
                };
            }
            if (angular.isDefined($scope.list)) {
                $scope.list.DOCSOURCENAME = newValue;
            }
        });

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
        //获取微信模板
        $scope.getSection = function() {
            $timeout(function() {
                ue.execCommand('inserthtml', angular.copy($scope.status.wechatTemplate));
                ue.fireEvent("contentChange");
            });
        };

        /**
         * [hideSection description] 查看痕迹时隐藏微信模板
         * @param  {[type]} list [description]
         * @return {[type]}      [description]
         */
        $scope.hideSection = function(list) {
            $scope.bigFace(list);
            if ($scope.status.bitFaceTit == "关闭痕迹") {
                $scope.status.showSection = false;
            } else {
                $scope.status.showSection = true;
            }
        };

        /**
         * [reWriteImg description]回写图片列表数据
         * @return {[type]} [description]
         */
        function reWriteImg() {
            var imgArray = ["DOC_PICTURELIST"];
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
         * [deleteUploaderImg description]删除上传后的图片
         * @param  {[str]} attribute [description]要删除的属性
         * @return {[type]}           [description]
         */
        $scope.deleteUploaderImg = function(attribute) {
            $scope.list[attribute] = [];
        };

    }
]);
