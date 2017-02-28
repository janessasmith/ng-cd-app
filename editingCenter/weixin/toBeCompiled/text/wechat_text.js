"use strict";
angular.module('wechatTextModule', []).
controller('WechatTextCtrl', ['$scope', "$compile", "$state", "$stateParams", "$timeout", "$q", "$filter", "$validation", "$window", "trsHttpService", "jsonArrayToStringService", "editingCenterService", "trsconfirm", "initWeiXinDataService", "WeiXininitService", "storageListenerService", "initWechatNewsService", "wechatBtnService", "filterEditctrBtnsService", "editcenterRightsService", "globleParamsSet", "ueditorService",
    function($scope, $compile, $state, $stateParams, $timeout, $q, $filter, $validation, $window, trsHttpService, jsonArrayToStringService, editingCenterService, trsconfirm, initWeiXinDataService, WeiXininitService, storageListenerService, initWechatNewsService, wechatBtnService, filterEditctrBtnsService, editcenterRightsService, globleParamsSet, ueditorService) {
        var ue;
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
                bitFaceTit: "查看痕迹",
                isHasBigFace: false,
                btnRights: [], //按钮权限
                openBtn: true,
                showSection: true
            };
            $scope.data = {
                version: [],
                copyVersion: [],
                lastVersionid: "",
                DocGenre: WeiXininitService.initDocGenre(),
                noPayment: 1, //不发稿费
                payMent: 0, //发稿费
            };
        }

        function initData() {
            $state.params.metadataid ? initEditData() : initNewData();
            // if ($state.params.metadataid) {
            //     //编辑
            //     editText();
            // } else {
            //     //新建
            // }
        }
        /**
         * [initNewData description]初始化新建页面
         * @return {[type]} [description]
         */
        function initNewData() {
            $scope.list = initWeiXinDataService.initText();
            loadDirective();
        }
        /**
         * [initEditData description]初始化编辑页面
         * @return {[type]} [description]
         */
        function initEditData() {
            var params = {
                "serviceid": "nb_wechatdoc",
                "methodname": "getWeChatDocNews",
                "WXChannelId": $state.params.wxchannelid,
                "MetaDataId": $state.params.metadataid
            };
            $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function(data) {
                $scope.list = data;
                // reWriteImg();
                //获取流程版本
                getVersion().then(function(data) {
                    loadDirective();
                });
            });
            showBigFaceRights();
        }
        /**
         * [getVersion description]获取流程版本与操作日志
         * @param  {[type]} id     [description] 稿件id
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
         * [getBigFaceRights description]展示查看痕迹按钮
         * @return {[type]} [description]
         */
        function showBigFaceRights() {
            $scope.status.isHasBigFace = true;
            editcenterRightsService.initWeixinListBtn('wechat.trace', $stateParams.wxchannelid).then(function(data) {
                $scope.status.bigFaceRights = data;
            });
        }
        /**
         * [loadDirective description]新增代码
         * @param  {[type]}      [description] null
         * @return {[type]}      [description] null
         */
        function loadDirective() {
            LazyLoad.js(["./lib/ueditor2/ueditor.config.js?v=11.0", "./lib/ueditor2/ueditor.all.js?v=11.0"], function() {
                var ueditor = '<ueditor form="textForm" versionid = "data.lastVersionid" list="list"></ueditor>';
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
            var draftList = '<editor-dir meta-data-id="{{list.METADATAID}}" editor-json="list.FGD_EDITINFO" show-all-tips="showAllTips" editor-form="textForm"></editor-dir>' +
                '<editor-auth-dir author="list.FGD_AUTHINFO"></editor-auth-dir>';
            draftList = $compile(draftList)($scope);
            $($(angular.element(document)).find('editor')).append(draftList);
        }


        /**
         * [updateCKSelection description]不发稿费选择按钮
         * @param  {[str]} variable [description]按钮
         * @return {[type]}      [description] null
         */
        $scope.updateCKSelection = function(variable) {
            $scope.list[variable] = $scope.list[variable] == $scope.data.noPayment ? $scope.data.payMent : $scope.data.noPayment;
        };
        /**
         * [getLoadMore description]操作日志加载更多
         * @return {[type]} [description]
         */
        $scope.getLoadMore = function() {
            $scope.page.CURRPAGE++;
            getVersion();
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


        $scope.save = function() {
            save(true).then(function() {
                getVersion($scope.list.METADATAID);
            });
        };
        /**
         * [saveContent description]list.htmlContent处理
         */
        function saveContent() {
            ueditorService.saveContent($scope.list);
        }
        /**
         * [save description]稿件保存方法
         * @param  {[Boolean]} flag [description]标识
         * @return {[type]}      [description]
         */
        function save(flag) {
            var deferred = $q.defer();
            var ue = UE.getEditor('ueditor');
            saveContent();
            $validation.validate($scope.textForm.authorForm);
            $validation.validate($scope.textForm).success(function() {
                // $scope.textForm.$setPristine();
                var list = manageSaveObjBeforeSave();
                $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getWCMRootUrl(),
                    list, "post").then(function(data) {
                    manageDataAfterSave(data, flag);
                    deferred.resolve(data);
                }, function(data) {
                    $scope.status.openBtn = true;
                    deferred.reject(data);
                });
            }).error(function(msg) {
                $scope.showAllTips = true;
                editingCenterService.checkSaveError($scope.textForm);
                trsconfirm.saveModel("保存失败", "请检查填写项", "error");
            });
            return deferred.promise;
        }
        /**
         * [manageSaveObjBeforeSave description]在保存前处理保存对象
         * @return {[type]} [description]
         */
        function manageSaveObjBeforeSave() {
            $scope.status.openBtn = false;
            $scope.list.serviceid = "nb_wechatdoc"; //在编辑时后台为返回服务名
            $scope.list.Methodname = "saveWeChatNewsDoc";
            var list = angular.copy($scope.list);
            //处理发稿单作者信息空数据提交问题
            if (angular.isDefined(list.FGD_AUTHINFO[0]) && (!angular.isDefined(list.FGD_AUTHINFO[0].USERNAME) || list.FGD_AUTHINFO[0].USERNAME === "")) {
                list.FGD_AUTHINFO = [];
            }
            //JSON对象数组转字符串
            list = jsonArrayToStringService.jsonArrayToString(list);
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
            if (!$state.params.metadataid) showBigFaceRights(); //新建保存后显示查看痕迹按钮
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

        /**
         * [close description]页面关闭
         * @return {[type]} [description]
         */
        $scope.close = function() {
            editingCenterService.closeWinow($scope.textForm.$dirty, '', false).then(function() {
                save().then(function() {
                    storageListenerService.addListenerToWeixin("save");
                    $window.open('about:blank', '_self').close();
                });
            }, function() {
                $window.open('about:blank', '_self').close();
            });
        };
    }
]);
