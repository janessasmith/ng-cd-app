    "use strict";
    angular.module('dailyselectionNewsModule', ["util.ueditor", "mgcrea.ngStrap.scrollspy"]).
    controller('dailyselectionlNewsController', ["$scope", '$sce', "$modal", "$compile", "$window", "$state", "$timeout", "$location", "$anchorScroll", '$stateParams', '$validation', "$filter", "trsHttpService", 'initiWoDataService', 'SweetAlert', "initVersionService", "jsonArrayToStringService", "trsResponseHandle", "trsconfirm", "$q", "initSingleSelecet", "iWoService", "myManuscriptService", "editingCenterService", "initeditctrBtnsService", "filterEditctrBtnsService", "iWoinitBtnService", "iWoBtnService", 'storageListenerService', "localStorageService", "editcenterRightsService", "ueditorService",
        function($scope, $sce, $modal, $compile, $window, $state, $timeout, $location, $anchorScroll, $stateParams, $validationProvider, $filter, trsHttpService, initiWoDataService, SweetAlert, initVersionService, jsonArrayToStringService, trsResponseHandle, trsconfirm, $q, initSingleSelecet, iWoService, myManuscriptService, editingCenterService, initeditctrBtnsService, filterEditctrBtnsService, iWoinitBtnService, iWoBtnService, storageListenerService, localStorageService, editcenterRightsService, ueditorService) {
            initStatus();
            initData();

            function initStatus() {
                $scope.page = {
                    CURRPAGE: 1,
                    PAGESIZE: 20
                };
                // console.log($scope.page);
                $scope.status = {
                    support: {
                        content: "" //提交给辅助写作的纯文本
                    },
                    openBtn: true,
                    mediaTypes: [],
                    selectMediaTypes: {},
                    isRequest: false,
                    bitFaceTit: '查看痕迹',
                    newsDocSaveMethod: ["savePersonalNews", "saveReceivedNews"],
                    titleRule: "maxlength=50",
                    hasVersionTime: false,
                };
                $scope.data = {
                    copyVersion: [],
                    comment: {
                        comment: [],
                        voiceObj: {},
                        hasMore: false,
                        currPage: 1,
                    },
                    lastVersionid: "",
                };
                // $anchorScroll.yOffset = 63;
                //初始化按钮点击
                $scope.handleBtnClick = function(funname) {
                    eval("$scope." + funname + "()");
                };
                //获取查看痕迹按钮权限
                editcenterRightsService.initIwoListBtn("iwo.trace").then(function(data) {
                    $scope.status.bigFaceRigths = data;
                });
            }

            function initData() {
                storageListenerService.removeListener("iwo");
                initMediaTypes();
                if ($stateParams.metadataid) {
                    //编辑
                    $scope.params = {
                        "serviceid": "mlf_myrelease",
                        "methodname": "getNewsDoc",
                        "MetaDataId": $stateParams.metadataid
                    };
                    //编辑显示大花脸
                    $scope.bigFaceHide = false;
                    iWoService.initData().then(function(data) {
                        //初始化页面参数
                        $scope.DOCGENRES = data.DocGenre;
                        $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), $scope.params, "get").then(function(data) {
                            $scope.list = data;
                            $scope.list.MEDIATYPES = data.MEDIATYPES_DB;
                            //获取流程版本与操作日志
                            getVersion().then(function(data) {
                                loadDirective();
                            });
                            initKeyWords();
                        });
                        //获取评审意见
                        getComment($stateParams.metadataid, $scope.data.comment.currPage);
                    });
                } else {
                    //新建
                    $scope.bigFaceHide = true;
                    $scope.list = initiWoDataService.initNews();
                    initDocgenre();
                    loadDirective();
                    initKeyWords();
                }
                initArrayBtn();
            }
            //锚点切换开始
            // $scope.goto = function(id) {
            //     $location.hash(id);
            //     $anchorScroll();
            // };
            /**
             * [close description]页面关闭
             * @return {[type]} [description]
             */
            $scope.close = function() {
                editingCenterService.closeWinow($scope.newsForm.$dirty, ueditorService.contentTranscoding($scope.list) != ueditorService.bindContent()).then(function() {
                    save().then(function() {
                        storageListenerService.addListenerToIwo("newsSaved");
                        var opened = $window.open('about:blank', '_self');
                        opened.close();
                    });
                }, function() {
                    var opened = $window.open('about:blank', '_self');
                    opened.close();
                });

            };
            //空格增加关键词
            $scope.addkeywords = function(e) {
                if (e.keyCode == 32 && $scope.list.KEYWORDS.indexOf($scope.keywordTxt) < 0) {
                    $scope.data.KEYWORDS.push($scope.keywordTxt);
                    $scope.keywordTxt = "";
                }
            };

            $scope.removeRelate = function(index, type) {
                if (type == "rN") {
                    $scope.list.RELEVANTNEWS.splice(index, 1);
                } else if (type == "rOf") {
                    $scope.list.RELEVANTOFFICIALS.splice(index, 1);
                }
            };

            //删除关键词
            $scope.delete = function(record) {
                $scope.list.KEYWORDS.splice(record, 1);
            };
            //更新状态
            $scope.updateSelection = function(item) {
                $scope.list.MEDIATYPES = item.value;
            };
            $scope.oringin = function(list) {
                $scope.newsForm.$dirty = true;
                list.ORIGINAL = list.ORIGINAL === '1' ? '0' : '1';
                if (angular.isUndefined($stateParams.chnldocid) && list.ORIGINAL === '1') {
                    list.ISNOPAYMENT = '0'; //判断为原创稿的话需要默认发稿费  
                }
            };

            $scope.updateCKSelection = function(list) {
                list.ISNOPAYMENT === '1' ? list.ISNOPAYMENT = '0' : list.ISNOPAYMENT = '1';
            };
            /**
             * [manageSaveObjBeforeSave description]在保存前处理保存对象
             * @return {[type]} [description]
             */
            function manageSaveObjBeforeSave() {
                getKeyWords();
                $scope.list.serviceid = "mlf_report"; //在编辑时后台为返回服务名
                $scope.list.METHODNAME = $scope.status.newsDocSaveMethod[$stateParams.status];
                $scope.list.PLATEFORM = $stateParams.status;
                $scope.list.ReportId = $stateParams.reportId;
                $scope.list.DOCRELTIME = $filter('date')(new Date(), "yyyy-MM-dd HH:mm").toString();
                var list = angular.copy($scope.list);

                //删除多余字段开始
                delete list.RELEVANTNEWS;
                delete list.RELEVANTOFFICIALS;
                delete list.OBJ_VERSION;
                delete list.LOG_OPERATION;
                delete list.FZ_DOCS;
                //删除多余字段结束
                //处理发稿单作者信息空数据提交问题
                if (angular.isDefined(list.FGD_AUTHINFO[0]) && (!angular.isDefined(list.FGD_AUTHINFO[0].USERNAME) || list.FGD_AUTHINFO[0].USERNAME === "")) {
                    list.FGD_AUTHINFO = [];
                }
                //处理发稿单作者信息空数据提交问题

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
                $scope.list.METADATAID = data.METADATAID;
                $scope.list.CHNLDOCID = data.CHNLDOCID;
                $stateParams.chnldocid = $scope.list.CHNLDOCID;
                $stateParams.metadataid = $scope.list.METADATAID;
                $scope.data.incomeData = [{
                    'TITLE': $scope.list.TITLE,
                    'CHNLDOCID': $stateParams.chnldocid,
                    'METADATAID': $stateParams.metadataid
                }];
                if (flag) {
                    storageListenerService.addListenerToIwo("newsSaved");
                    $state.transitionTo($state.current, $stateParams, {
                        reload: false
                    });
                    trsconfirm.saveModel("保存成功", "", "success");

                } else {
                    $scope.params = {};
                }
            }


            function saveContent() {
                ueditorService.saveContent($scope.list);
                // console.log($scope.list.CONTENT+'走你');
            }
            //保存
            $scope.save = function(type) {
                var ue = UE.getEditor('ueditor');
                trsconfirm.sensitiveWords($stateParams.chnldocid, function() {
                    save(true).then(function() {
                        getVersion($scope.list.METADATAID);
                        var params = {
                            "serviceid": "mlf_myrelease",
                            "methodname": "getNewsDoc",
                            "MetaDataId": $scope.list.METADATAID
                        };
                        $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function(data) {
                            ue.ready(function() {
                                ue.setContent(data.HTMLCONTENT);
                                ueditorService.saveToLocal($scope.list.METADATAID, $scope.data.lastVersionid);
                                //新建稿件完成，加载查看痕迹按钮
                                editcenterRightsService.initIwoListBtn("iwo.trace").then(function(data) {
                                    $scope.status.bigFaceRigths = data;
                                    $scope.bigFaceHide = false;
                                });
                            });
                        });
                    });
                }, function() {});
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
                $timeout(function() {
                    $validationProvider.validate($scope.newsForm.authorForm);
                    $validationProvider.validate($scope.newsForm)
                        .success(function() {
                            ueditorService.saveToLocal($scope.list.METADATAID);
                            $scope.newsForm.$setPristine();
                            $scope.status.openBtn = false;
                            var list = manageSaveObjBeforeSave();
                            $scope.loadingPromise = trsHttpService.httpServer("/wcm/mlfcenter.do",
                                list, "post").then(function(data) {
                                $scope.status.openBtn = true;
                                manageDataAfterSave(data, flag);
                                deferred.resolve(data);
                            }, function(data) {
                                $scope.status.openBtn = true;
                                deferred.reject(data);
                            });
                        }).error(function(msg) {
                            $scope.showAllTips = true;
                            editingCenterService.checkSaveError($scope.newsForm);
                            trsconfirm.saveModel("保存失败", "请检查填写项", "error");
                        });
                });
                return deferred.promise;

            }
            //保存结束
            //多渠道提交触发
            $scope.iWoSubmit = function() {
                trsconfirm.sensitiveWords($stateParams.chnldocid, function() {
                    var methodname = ['personalSubmitMedia', 'receivedSubmitMedia'];
                    save(false).then(function() {
                        saveSubmit(methodname[$stateParams.status]);
                    });
                }, function() {

                });
            };
            //多渠道提交触发结束
            //多渠道提交函数
            function saveSubmit(methodname) {
                myManuscriptService.submit($scope.data.incomeData, function() {
                    storageListenerService.addListenerToIwo("newsSubmit");
                    var opened = $window.open('about:blank', '_self');
                    opened.close();
                }, function() {

                }, methodname);
            }
            //多渠道提交函数结束
            //共享触发（个人稿库+已收稿库）
            $scope.iWoshare = function() {
                trsconfirm.sensitiveWords($stateParams.chnldocid, function() {
                    save(false).then(function(data) {
                        saveShare(data.METADATAID, data.CHNLDOCID);
                    });
                }, function() {

                });
            };
            //共享触发结束
            //共享函数开始
            function saveShare(metadataid, chnldocid) {
                var shareMethod = ['personalMyShare', 'receivedMyShare'];
                editingCenterService.share(function(data) {
                    data.serviceid = 'mlf_myrelease';
                    data.methodname = shareMethod[$stateParams.status];
                    data.ChnlDocIds = chnldocid;
                    data.MetaDataIds = metadataid;
                    $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), data, "post")
                        .then(function(data) {
                            trsconfirm.alertType("共享成功", "", "success", false, function() {
                                storageListenerService.addListenerToIwo("newsShared");
                                var opened = $window.open('about:blank', '_self');
                                opened.close();
                            });
                        });
                });
            }
            //共享函数结束
            // 传稿(个人稿库+已收稿库)
            $scope.iWoTransfer = function() {
                trsconfirm.sensitiveWords($stateParams.chnldocid, function() {
                    save(false).then(function() {
                        draft();
                    });
                }, function() {

                });
            };
            //传稿触发结束
            //传稿函数
            function draft() {
                var menthod = ['personalTransferMetaDatas', 'receivedTransferMetaDatas'];
                myManuscriptService.draft("传稿", $scope.data.incomeData, function() {
                    storageListenerService.addListenerToIwo("newsPassed");
                    var opened = $window.open('about:blank', '_self');
                    opened.close();
                }, function() {

                }, menthod[$stateParams.status]);
            }
            //传稿函数结束
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
            $scope.$watch('list.NEWSSOURCES', function(newValue, oldValue, scope) {
                if (!angular.isObject(newValue)) {
                    $scope.status.isRequest = true;
                    newValue = {
                        SOURCEID: "0",
                        SRCNAME: newValue
                    };
                }
                if (angular.isDefined($scope.list)) {
                    $scope.list.NEWSSOURCES = newValue;
                }
            });
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
            //初始化权限按钮
            function initArrayBtn() {
                $scope.methodnameArray = ['iwo.personal', 'iwo.received'];
                $scope.dictionaryArray = [iWoBtnService.initIwoPersonBtn(), iWoBtnService.initIwoReceiveBtn()];
                $scope.iWoBtns = iWoinitBtnService.initBtnArrays()[$stateParams.status];
                initeditctrBtnsService.initIwoData($scope.methodnameArray[$stateParams.status]).then(function(data) {
                    $scope.btnStatus = initeditctrBtnsService.initBtns(data, $scope.dictionaryArray[$stateParams.status]);
                    $scope.arrayBtn = filterEditctrBtnsService.filterBtn($scope.btnStatus, $scope.iWoBtns);
                    addBtn();
                });
            }
            //新增保存关闭按钮
            function addBtn() {
                $scope.arrayBtn.unshift({
                    RIGHTINDEX: "save",
                    OPERDESC: "保存",
                    OPERNAME: "保存",
                    OPERFUN: "save"
                });
                $scope.arrayBtn.push({
                    RIGHTINDEX: "close",
                    OPERDESC: "关闭",
                    OPERNAME: "",
                    OPERFUN: "close"
                });
            }
            /**
             * [politicalCommonSense description]正文政治常识校验
             * @return {[type]} [description]
             */
            $scope.politicalCommonSense = function() {
                editingCenterService.checkoutDraft(ueditorService.bindContent()).then(function(data) {
                    if (data.content[0].resultInfo.length > 0) {
                        var ue = UE.getEditor('ueditor');
                        ue.setContent(ueditorService.handlingSensitiveInf(data, ue.getContent()));
                    }
                });
            };
            //动态加载指令
            function loadDirective() {
                LazyLoad.js(["./lib/ueditor2/ueditor.config.js?v=9.0", "./lib/ueditor2/ueditor.all.js?v=9.0"], function() {
                    var ueditor = '<ueditor form="newsForm" versionid = "data.lastVersionid" list="list"></ueditor>';
                    // $scope.button = { title: "政治常识校对", name: "polComSense" };
                    // var ueditor = '<ueditor custom-button-fn="politicalCommonSense()" custom-button="button" form="newsForm" versionid = "data.lastVersionid" list="list"></ueditor>';
                    ueditor = $compile(ueditor)($scope);
                    $($(angular.element(document)).find('ueditorLocation')).append(ueditor);
                    var ue = UE.getEditor('ueditor');
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
                /*var ueditor = '<ueditor list="list"></ueditor>';
                ueditor = $compile(ueditor)($scope);
                $($(angular.element(document)).find('ueditorLocation')).append(ueditor);*/
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
                var metadataid = angular.isDefined(id) ? id : $stateParams.metadataid
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
             * [getComment description]获取评审意见
             * @return {[type]} [description]
             */
            function getComment(id, currPage) {
                editingCenterService.getComment(id, currPage).then(function(data) {
                    if (angular.isDefined($scope.data.comment.comment[$scope.data.comment.comment.length - 1]) && $filter('date')($scope.data.comment.comment[$scope.data.comment.comment.length - 1].day, "yyyy-MM-dd").toString() == $filter('date')(data.comment[0].day, "yyyy-MM-dd").toString()) {
                        $scope.data.comment.comment[$scope.data.comment.comment.length - 1].times = $scope.data.comment.comment[$scope.data.comment.comment.length - 1].times.concat(data.comment[0].times);
                        data.comment.shift();
                    }
                    $scope.data.comment['comment'] = $scope.data.comment['comment'].concat(data.comment);
                    $scope.data.comment.hasMore = data.hasMore;
                    for (var i in data.voiceObj) {
                        $scope.data.comment.voiceObj[i] = data.voiceObj[i];
                    }
                });
            }
            /**
             * [getComment description]获取评审意见
             * @return {[type]} [description]
             */
            $scope.getLoadMoreComment = function() {
                $scope.data.comment.currPage += 1;
                getComment($stateParams.metadataid, $scope.data.comment.currPage);
            };
            /**
             * [trustUrl description]信任url
             */
            $scope.trustUrl = $sce.trustAsResourceUrl;
            /**
             * [initMediaTypes description]初始化渠道类型
             * @return {[type]} [description]
             */
            function initMediaTypes() {
                initSingleSelecet.getChannelList().then(function(data) {
                    $scope.status.mediaTypes = data;
                });
            }
            /**
             * [initDocgenre description]初始化稿件体裁
             * @return {[type]} [description]
             */
            function initDocgenre() {
                iWoService.initData().then(function(data) {
                    $scope.DOCGENRES = data.DocGenre;
                    $scope.list.DOCGENRE = angular.copy($scope.DOCGENRES[0]);
                });
            }
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
                        $scope.list.ABSTRACT = data.substring(1, data.length - 1);
                }, function(data) {});
            };

            /**
             * [clearAllKeywords description]清空关键词
             * @return {[type]} [description]
             */
            $scope.clearAllKeywords = function() {
                $scope.data.KEYWORDS = [];
            };
        }
    ]);
