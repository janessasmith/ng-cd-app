"use strict";
angular.module('wechatPictureModule', []).
controller('WechatPictureCtrl', ['$scope', "$compile", "$state", "$stateParams", "$timeout", "$q", "$filter", "$validation", "$window", "trsHttpService", "jsonArrayToStringService", "editingCenterService", "trsconfirm", "initWeiXinDataService", "WeiXininitService", "storageListenerService","editingCenterWechatService", 
    function($scope, $compile, $state, $stateParams, $timeout, $q, $filter, $validation, $window, trsHttpService, jsonArrayToStringService, editingCenterService, trsconfirm, initWeiXinDataService, WeiXininitService, storageListenerService,editingCenterWechatService) {
        initStatus();
        initData();

        function initStatus() {
            $scope.page = {
                CURRPAGE: 1,
                PAGESIZE: 20
            };
            $scope.status = {
                hasVersionTime: false, //是否存在流程版本,
                openBtn: true,
            };
            $scope.data = {
                version: [],
                copyVersion: [],
                lastVersionid: "",
                DocGenre: WeiXininitService.initDocGenre(),
                imageMaxSize:editingCenterWechatService.imageMaxsize,//上传图片最大限制
            };
        }

        function initData() {
            if ($state.params.metadataid) { //编辑
                initEditData(); 
            } else { //新建
                $scope.list = initWeiXinDataService.initPic(); 
                loadDirective(); 
            }
        }
        /**
         * [initEditData description]初始化编辑页面
         * @return {[type]} [description]
         */
        function initEditData() {
            var params = {
                'serviceid': "nb_wechatdoc",
                'methodname': "getWeChatPicsDoc",
                'WXChannelId': $state.params.wxchannelid,
                'MetaDataId': $state.params.metadataid
            };
            $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function(data) {
                $scope.list = data;
                //初始化处理概览图片,仅编辑时生效
                reWriteImg(); 
                //获取流程版本
                getVersion().then(function(data) {
                    loadDirective();
                });
            });
        }
        /**
         * [reWriteImg description]回写图片列表数据
         * @return {[type]} [description]
         */
        function reWriteImg() {
            var imgArray = ["DOC_PICTURELIST"]; //ATTACHFILE
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
         * [loadDirective description]新增代码
         * @param  {[type]}      [description] null
         * @return {[type]}      [description] null
         */
        function loadDirective() {
            var draftList = '<editor-dir meta-data-id="{{list.METADATAID}}" editor-json="list.FGD_EDITINFO" show-all-tips="showAllTips" editor-form="picForm"></editor-dir>' +
                '<editor-auth-dir author="list.FGD_AUTHINFO"></editor-auth-dir>';
            draftList = $compile(draftList)($scope);
            $($(angular.element(document)).find('editor')).append(draftList);
        }

        /**
         * [deleteUploaderImg description]删除上传后的图片
         * @param  {[str]} attribute [description]要删除的属性
         * @return {[type]}           [description] null
         */
        $scope.deleteUploaderImg = function(attribute) {
            $scope.list[attribute] = [];
        };
        /**
         * [updateCKSelection description]不发稿费选择按钮
         * @param  {[str]} variable [description]按钮
         * @return {[type]}      [description] null
         */
        $scope.updateCKSelection = function(variable) {
            $scope.list[variable] = $scope.list[variable] == 1 ? 0 : 1;
        };
        /**
         * [getLoadMore description]操作日志加载更多
         * @return {[type]} [description]
         */
        $scope.getLoadMore = function() {
            $scope.page.CURRPAGE++;
            getVersion();
        };


        $scope.save = function() {
            save(true).then(function() {
                getVersion($scope.list.METADATAID);
            });
        };
        /**
         * [save description]稿件保存方法
         * @param  {[Boolean]} flag [description]标识
         * @return {[type]}      [description]
         */
        function save(flag) {
            var deferred = $q.defer();
            $validation.validate($scope.picForm.authorForm);
            $validation.validate($scope.picForm).success(function() {
                $scope.picForm.$setPristine();
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
                editingCenterService.checkSaveError($scope.picForm);
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
            $scope.list.Methodname = "saveWeChatImgDoc";
            $scope.list.APPFILE = $scope.list.DOC_PICTURELIST[0].APPFILE;
            var list = angular.copy($scope.list);
            //处理发稿单作者信息空数据提交问题
            if (angular.isDefined(list.FGD_AUTHINFO[0]) && (!angular.isDefined(list.FGD_AUTHINFO[0].USERNAME) || list.FGD_AUTHINFO[0].USERNAME === "")) {
                list.FGD_AUTHINFO = [];
            }
            //处理发稿单作者信息空数据提交问题
            // list.ATTACHFILE = angular.copy(jsonArrayToStringService.clearEmptyObjects(list.ATTACHFILE, "APPFILE"));
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
            $scope.list.METADATAID = data.METADATAID;
            $scope.list.CHNLDOCID = data.CHNLDOCID;
            $stateParams.chnldocid = $scope.list.CHNLDOCID;
            $stateParams.metadataid = $scope.list.METADATAID;
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
            editingCenterService.closeWinow($scope.picForm.$dirty, '', false).then(function() {
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
