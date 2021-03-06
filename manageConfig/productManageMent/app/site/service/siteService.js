/*
author:you 2015-1-7
 */
"use strict";
angular.module("mangeProAppSiteServiceModule", [])
    .controller("mangeProAppSiteModCtrl", ["$scope", "$modalInstance", "$stateParams", "params", "productMangageMentAppService", "trsHttpService", "trsconfirm", function($scope, $modalInstance, $stateParams, params, productMangageMentAppService, trsHttpService, trsconfirm) {
        initStatus();
        // console.log(params);
        $scope.cancel = function() {
            $modalInstance.dismiss("cancel");
        };
        $scope.confirm = function() {
            if ($scope.isSiteExist == '"true"') {
                trsconfirm.alertType("该站点名已经存在", "", "error", false);
                return;
            }
            $scope.newsite.LISTPICSIZE = $scope.list.listWidth + "," + $scope.list.listHeight;
            $scope.newsite.FOCUSIMAGESIZE = $scope.focus.focusWidth + "," + $scope.focus.focusHeight;
            $scope.newsite.FIGURESIZE = $scope.figure.figureWidth + "," + $scope.figure.figureHeight;
            $scope.newsite.LISTBIGPICSIZE = $scope.lagerImage.imageWidth + "," + $scope.lagerImage.imageHeight; //处理大图问题
            $scope.newsite.SiteName = $scope.newsite.SiteDesc;
            $scope.newsite.SiteOrder = $scope.allSitesSelected.value;
            $scope.newsite.ObjectId = angular.isDefined($scope.newsite.ObjectId) ? parseInt($scope.newsite.ObjectId) : 0;
            $scope.newsite.TempId = JSON.stringify({
                "CHNLTEMPID": angular.isDefined($scope.temp) ? parseInt($scope.temp.TEMPID) : 0,
                "OTHERTEMPID": angular.isDefined($scope.otherTemp) ? parseInt($scope.otherTemp.TEMPID) : 0,
                "DOCTEMPID": angular.isDefined($scope.xilanTemp) ? parseInt($scope.xilanTemp.TEMPID) : 0,
            });
            $scope.newsite.repeatUseTime = $scope.newsite.repeatUseTime === '' ? 0 : $scope.newsite.repeatUseTime;
            $modalInstance.close($scope.newsite);
        };
        /**
         * [queryTemplate description]模板弹窗打开
         * @param  {[type]} TEMPLATETYPE [description]
         * @return {[type]}              [description]
         */
        function queryTemplate(TEMPLATETYPE, TEMP) {
            var params = {
                ObjectType: "103",
                ObjectId: $stateParams.site,
                TEMPLATETYPE: TEMPLATETYPE,
                TempName: "",
            };
            productMangageMentAppService.bindTemplate(params, function(result) {
                $scope[TEMP] = result;
            });
        }
        /**
         * [channlViews description]站点首页模板点击
         * @return {[type]} [description]
         */
        $scope.channlViews = function() {
            queryTemplate(1, "temp");
        };
        /**
         * [channlOtherViews description]其他首页模板点击
         * @return {[type]} [description]
         */
        $scope.channlOtherViews = function() {
            queryTemplate(1, "otherTemp");
        };
        /**
         * [defaultArticleViews description]默认文章模板点击
         * @return {[type]} [description]
         */
        $scope.defaultArticleViews = function() {
            queryTemplate(2, "xilanTemp");
        };
        //检查是否检查稿件属性
        $scope.checkAttr = function() {
            $scope.newsite.CheckFgdAttribute = $scope.newsite.CheckFgdAttribute === 1 ? 0 : 1;
        };
        $scope.examineEngName = function() {
            var examParams = {
                serviceid: "mlf_websiteconfig",
                methodname: "checkWebSitePath",
                DataPath: $scope.newsite.DataPath
            };
            examParams.SiteId = angular.isDefined($scope.newsite.siteId) ? $scope.newsite.siteId : 0;
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), examParams, "get").then(function(data) {
                $scope.examEng = data;
            });
        };

        /**
         * [checkSiteName description] 校验站点名是否已经存在
         * @return {[type]} [description]
         */
        $scope.checkSiteName = function() {
            if ($scope.newsite.SiteDesc == $scope.thisSiteName || $scope.newsite.SiteDesc === "") return;
            var params = {
                serviceid: "mlf_appconfig",
                methodname: "checkSiteNameExists",
                SITENAME: $scope.newsite.SiteDesc,
                SITEID: $scope.thisSiteId || "0"
            };
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, 'get').then(function(data) {
                $scope.isSiteExist = data;
            });
        };

        function initStatus() {
            $scope.list = {
                listWidth: "",
                listHeight: ""
            };
            $scope.focus = {
                focusWidth: "",
                focusHeight: ""
            };
            $scope.figure = {
                figureWidth: "",
                figureHeight: ""
            };
            $scope.lagerImage = {
                imageWidth: "",
                imageHeight: "",
            };
            $scope.title = params.title;
            $scope.allSites = [];
            $scope.isSiteExist = '"false"'; //校验站点名是否已经存在
            angular.forEach(params.allSite, function(data, index, array) {
                $scope.allSites.push({
                    name: data.SITEDESC,
                    value: data.SITEORDER
                });
            });
            $scope.allSites.unshift({
                name: "最前面",
                value: -1
            });
            if (params.siteInfo !== "") {
                $scope.newsite = params.siteInfo;
                $scope.temp = params.siteInfo.temp;
                $scope.otherTemp = params.siteInfo.otherTemp;
                $scope.xilanTemp = params.siteInfo.xilanTemp;
                $scope.thisSiteName = params.SiteName;
                $scope.thisSiteId = params.ObjectId;
                //处理编辑站点排序默认选中站点开始
                var i = 0;
                while (i < $scope.allSites.length) {
                    //去除本站点在排序列表上展现，并且将本站点的前一个站点设为默认位置。
                    if ($scope.allSites[i].value === params.siteInfo.SiteOrder) {
                        $scope.allSites.splice(i, 1);
                        $scope.allSitesSelected = angular.copy($scope.allSites[i - 1]);
                    } else {
                        i++;
                    }
                }
                if (angular.isDefined(params.siteInfo.picsize)) {
                    $scope.list.listWidth = params.siteInfo.picsize.LISTPICSIZE.substr(0, params.siteInfo.picsize.LISTPICSIZE.indexOf(','));
                    $scope.list.listHeight = params.siteInfo.picsize.LISTPICSIZE.substr(params.siteInfo.picsize.LISTPICSIZE.indexOf(',') + 1);
                    $scope.focus.focusWidth = params.siteInfo.picsize.FOCUSIMAGESIZE.substr(0, params.siteInfo.picsize.FOCUSIMAGESIZE.indexOf(','));
                    $scope.focus.focusHeight = params.siteInfo.picsize.FOCUSIMAGESIZE.substr(params.siteInfo.picsize.FOCUSIMAGESIZE.indexOf(',') + 1);
                    $scope.figure.figureWidth = params.siteInfo.picsize.FIGURESIZE.substr(0, params.siteInfo.picsize.FIGURESIZE.indexOf(','));
                    $scope.figure.figureHeight = params.siteInfo.picsize.FIGURESIZE.substr(params.siteInfo.picsize.FIGURESIZE.indexOf(',') + 1);
                    $scope.lagerImage.imageWidth = params.siteInfo.picsize.LISTBIGPICSIZE?params.siteInfo.picsize.LISTBIGPICSIZE.substr(0, params.siteInfo.picsize.LISTBIGPICSIZE.indexOf(',')):200;
                    $scope.lagerImage.imageHeight = params.siteInfo.picsize.LISTBIGPICSIZE?params.siteInfo.picsize.LISTBIGPICSIZE.substr(params.siteInfo.picsize.LISTBIGPICSIZE.indexOf(',') + 1):200;//处理大图
                }
            } else {
                $scope.allSitesSelected = angular.copy($scope.allSites[0]);
                $scope.newsite = {
                    CheckFgdAttribute: 0,
                    repeatUseTime: 0,
                };
            }
        }
    }]);
