"use strict";
/**
 * Created by MRQ on 2016/1/8.
 */
angular.module("mangeProChannelCtrlModule", [])
    .controller('channelDeleteCtrl', ['$scope', "$modalInstance", "item", "successFn", "productMangageMentWebsiteService", function($scope, $modalInstance, item, successFn, productMangageMentWebsiteService) {
        init();
        $scope.cancel = function() {
            $scope.$close();
        };
        $scope.confirm = function() {
            $modalInstance.close({});
        };
        $scope.deleteToggle = function() {
            $scope.isDeleteFirst = true;
        };

        function init() {
            $scope.item = item;
            $scope.isDeleteFirst = false;
        }
    }])
    .controller("channelModifyCtrl", ["$scope", "$stateParams", "$modalInstance", "$modal", "$validation", "column", "successFn", "initManageConSelectedService", "productMangageMentWebsiteService", "websiteChannel", "trsHttpService", "trsconfirm", function($scope, $stateParams, $modalInstance, $modal, $validation, column, successFn, initManageConSelectedService, productMangageMentWebsiteService, websiteChannel, trsHttpService, trsconfirm) {
        initStatus();
        $scope.cancel = function() {
            $modalInstance.dismiss();
        };
        $scope.confirm = function() {
            $validation.validate($scope.createChlForm).success(function() {
                if($scope.isChnlExist=='"true"') {
                    trsconfirm.alertType("栏目唯一标识已经存在", "", "error", false);
                    return;
                }
                $scope.channel.CHNLORDER = $scope.selectedWebChannel.value;
                $modalInstance.close($scope.channel);
            }).error(function() {
                $scope.showAllTips = true;
                trsconfirm.alertType("提交失败", "请检查表单", "info", false, function() {});
            });
        };
        //检测存放位置
        $scope.examinePos = function() {
            $scope.isShowTipsSiteName = false;
            var posParams = {
                serviceid: "mlf_websiteconfig",
                methodname: "checkChannelPath",
                Siteid: $stateParams.site,
                ChannelId: $scope.channel.OBJECTID,
                DataPath: $scope.channel.DATAPATH
            };
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), posParams, "get").then(function(data) {
                $scope.savePos = data;
            });
        };
        /**
         * [checkTempName description] 校验唯一标识是否已经存在
         * @return {[type]} [description]
         */
        $scope.checkIdentify  = function() {
            // if($scope.channel.CHNLNAME == $scope.thisChnlName || $scope.channel.CHNLNAME === "") return;
            if($scope.channel.CHNLNAME==='') return;
            var params = {
                serviceid: "mlf_appconfig",
                methodname: "checkChannelNameExists",
                CHNLNAME: $scope.channel.CHNLNAME,
                SITEID: $stateParams.site,
                CHANNELID: $scope.thisChnlId || "0"
            };
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, 'get').then(function(data) {
                $scope.isChnlExist = data;
            });
        };

        function initEditData() {
            $scope.params = {
                serviceid: "mlf_websiteconfig",
                methodname: "findChannelById",
                TopChannelId: '0',
                ChannelId: websiteChannel.CHANNELID
            };
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), $scope.params, "get").then(function(data) {
                $scope.channel = {
                    OBJECTID: data.CHANNELID,
                    SITEID: $stateParams.site,
                    CHNLNAME: data.CHNLNAME,
                    CHNLDESC: data.CHNLDESC,
                    PARENTID: data.PARENTID,
                    CHNLORDER: -1,
                    DATAPATH: data.DATAPATH,
                    ROOTDOMAIN: data.ROOTDOMAIN,
                    TEMPID: {
                        CHNLTEMPID: 0,
                        OTHERTEMPID: 0,
                        DOCTEMPID: 0
                    }
                };
                $scope.thisChnlName = data.CHNLNAME;
                $scope.thisChnlId = data.CHANNELID;
                $scope.channel.TEMPID.CHNLTEMPID = angular.isDefined(data.GAILANTEMP[0]) ? data.GAILANTEMP[0].TEMPID : "0";
                $scope.channel.TEMPID.OTHERTEMPID = angular.isDefined(data.OTHERTEMP[0]) ? data.OTHERTEMP[0].TEMPID : "0";
                $scope.channel.TEMPID.DOCTEMPID = angular.isDefined(data.DOCTEMP[0]) ? data.DOCTEMP[0].TEMPID : "0";
                $scope.tempName.channelTempName = angular.isDefined(data.GAILANTEMP[0]) ? data.GAILANTEMP[0].TEMPNAME : "";
                $scope.tempName.otherTempName = angular.isDefined(data.OTHERTEMP[0]) ? data.OTHERTEMP[0].TEMPNAME : "";
                $scope.tempName.articleTempName = angular.isDefined(data.DOCTEMP[0]) ? data.DOCTEMP[0].TEMPNAME : "";
                var i = 0;
                while (i < $scope.websiteChannelsJson.length) {
                    if ($scope.websiteChannelsJson[i].value === data.CHNLORDER) {
                        $scope.websiteChannelsJson.splice(i, 1);
                        $scope.selectedWebChannel = angular.copy($scope.websiteChannelsJson[i - 1]);
                    } else {
                        i++;
                    }
                }
            });
        }

        function initStatus() {
            $scope.channel = {
                OBJECTID: 0,
                SITEID: $stateParams.site,
                CHNLNAME: "",
                CHNLDESC: "",
                PARENTID: "0",
                CHNLORDER: -1,
                DATAPATH: "",
                ROOTDOMAIN: "",
                TEMPID: {
                    CHNLTEMPID: 0,
                    OTHERTEMPID: 0,
                    DOCTEMPID: 0
                }
            };
            $scope.tempName = {
                channelTempName: "",
                otherTempName: "",
                articleTempName: ""
            };
            $scope.column = column;
            $scope.isChnlExist = '"false"'; //校验唯一标识是否已经存在
            initAllChannels();
        }

        function initAllChannels() {
            initManageConSelectedService.getWebsiteAllChannels($stateParams.site).then(function(data) {
                $scope.websiteChannelsJson = data;
                $scope.websiteChannelsJson.unshift({
                    name: "最前面",
                    value: -1
                });
                $scope.selectedWebChannel = angular.copy($scope.websiteChannelsJson[0]);
                websiteChannel !== "" ? initEditData() : "";
            });
        }
        //获取前一级栏目
        $scope.querySelectChl = function() {
            $scope.channel.CHNLORDER = $scope.selectedWebChannel.value;
        };
        /**
         * [chnlOtherTemplate description]栏目其他模板点击
         * @return {[type]} [description]
         */
        $scope.chnlOtherTemplate = function() {
            queryTemplate(1, 'OTHERTEMPID', 'otherTempName');

        };
        /**
         * [chnlTemplate description]栏目模板点击
         * @return {[type]} [description]
         */
        $scope.chnlTemplate = function() {
            queryTemplate(1, 'CHNLTEMPID', 'channelTempName');
        };
        /**
         * [defaultArticleTemplate description]默认模板点击
         * @return {[type]} [description]
         */
        $scope.defaultArticleTemplate = function() {
            queryTemplate(2, 'DOCTEMPID', 'articleTempName');
        };
        /**
         * [queryTemplate description]模板弹窗打开
         * @param  {[type]} TEMPLATETYPE [description]
         * @return {[type]}              [description]
         */
        function queryTemplate(TEMPLATETYPE, ID, Name) {
            var params = {
                ObjectType: $scope.channel.OBJECTID > 0 ? '101' : '103',
                ObjectId: $scope.channel.OBJECTID > 0 ? $scope.channel.OBJECTID : $scope.channel.SITEID,
                TEMPLATETYPE: TEMPLATETYPE,
                TempName: "",
                selectedTempId: $scope.channel.TEMPID[ID],
                selectedTempName: $scope.tempName[Name],
            };
            productMangageMentWebsiteService.bindTemplate(params, function(result) {
                $scope.channel.TEMPID[ID] = result.TEMPID;
                $scope.tempName[Name] = result.TEMPNAME;
            });
        }
    }]);
