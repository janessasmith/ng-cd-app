'use strict';
angular.module("createColumnDistributionModule", ["mgcrea.ngStrap.datepicker"])
    .controller('createColumnDistributionCtrl', ['$scope', '$stateParams', '$modalInstance', '$filter', '$timeout', '$validation', 'trsHttpService', 'productMangageMentWebsiteService', 'item', 'trsconfirm', 'trsspliceString', function($scope, $stateParams, $modalInstance, $filter, $timeout, $validation, trsHttpService, productMangageMentWebsiteService, item, trsconfirm, trsspliceString) {
        initStatus();
        initData();
        /**
         * [initStatus description]初始化状态
         * @return {[type]} [description]
         */
        function initStatus() {
            $scope.item = {
                selectedType: [],
                selectedStatus: [],
                selectedMode: "TransmitType=1"
            };
        }

        /**
         * [initData description] 初始化数据
         * @return {[type]} [description]
         */
        function initData() {
            initDropDown();
            if(angular.isDefined(item)) {
                $scope.item = item;
                initEditItem($scope.item);
            }
            else {
                $scope.item.objectId = "0";
            }
        }

        /**
         * [initDropDown description] 初始化下拉框
         * @return {[type]} [description]
         */
        function initDropDown() {
            $scope.publish = [{
                name: "发布",
                value: "1"
            }, {
                name: "不发布",
                value: "0"
            }];
            $scope.publishType = angular.copy($scope.publish[0]);
        }

        /**
         * [initEditItem description] 编辑时请求原有的数据
         * @param  {[type]} item [description]
         * @return {[type]}      [description]
         */
        function initEditItem(item) {
            var params = {
                "serviceid": "mlf_websiteconfig",
                "methodname": "findChannelSynById",
                "ObjectId": item.CHANNELSYNID
            };
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "post").then(function(data) {
                $scope.item = {
                    objectId: data.CHANNELSYNID,
                    selectedType: data.SYNTYPES.split(","),
                    operAfter: data.OPERAFTER,
                    selectedStatus: data.STATUSES.split(","),
                    selectedMode: data.ATTRIBUTE,
                    selectedChnls: data.TOCHANNEL,
                    fromDate: new Date(data.SDATE).getTime(),
                    untilDate: new Date(data.EDATE).getTime(),
                    selectedDate: new Date(data.DOCSDATE).getTime(),
                    nowDate: new Date(data.DOCEDATE).getTime()
                };
            });
        }

        /**
         * [cancel description] 取消
         * @return {[type]} [description]
         */
        $scope.cancel = function() {
            $modalInstance.dismiss();
        };

        /**
         * [save description] 保存
         * @param  {[type]} item [description]
         * @return {[type]}      [description]
         */
        $scope.confirm = function() {
            $validation.validate($scope.columndistrForm).
            success(function() {
                if(angular.isUndefined($scope.item.selectedChnls)) {
                    trsconfirm.alertType("提交失败", "请选择目标栏目", "error", false);
                    return;
                }
                $scope.item.fromDate = $filter('date')($scope.item.fromDate, "yyyy-MM-dd").toString();
                $scope.item.untilDate = $filter('date')($scope.item.untilDate, "yyyy-MM-dd").toString();
                $scope.item.selectedDate = $filter('date')($scope.item.selectedDate, "yyyy-MM-dd").toString();
                $scope.item.nowDate = $filter('date')(new Date(), "yyyy-MM-dd").toString();
                $scope.item.selectedType = $scope.item.selectedType.join(",");
                $scope.item.selectStatus = $scope.item.selectedStatus.join(",");
                var params = {
                    "serviceid": "mlf_websiteconfig",
                    "methodname": "saveDocumentSyn",
                    "CHANNELID": $stateParams.channel,
                    "OBJECTID": $scope.item.objectId,
                    "SYNTYPES": $scope.item.selectedType,
                    "OPERAFTER": $scope.item.operAfter,
                    "STATUSES": $scope.item.selectStatus,
                    "ATTRIBUTE": $scope.item.selectedMode,
                    "TRANSMITTYPEASS": $scope.item.selectedMode,
                    "DSTCHANNELIDS": $scope.item.selectedChnls,
                    "SDATE": $scope.item.fromDate,
                    "EDATE": $scope.item.untilDate,
                    "DOCSDATE": $scope.item.selectedDate,
                    "DOCEDATE": $scope.item.nowDate
                };
                $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "post").then(function(data) {
                    trsconfirm.alertType("保存成功", "", "success", false, function() {
                        $modalInstance.close("success");
                    });
                });
            }).
            error(function() {
                $timeout(function() {
                    trsconfirm.alertType("提交失败", "请检查填写项", "error", false);
                }, 300);
            });
        };

        /**
         * [selectType description] 选择同步时机
         * @param  {[type]} item [description]
         * @return {[type]}      [description]
         */
        $scope.selectType = function(type) {
            if ($scope.item.selectedType.indexOf(type) < 0) {
                $scope.item.selectedType.push(type);
            } else {
                $scope.item.selectedType.splice($scope.item.selectedType.indexOf(type), 1);
            }
        };


        /**
         * [selectStatus description] 选择同步的文档状态
         * @param  {[type]} item [description]
         * @return {[type]}      [description]
         */
        $scope.selectStatus = function(type) {
            if ($scope.item.selectedStatus.indexOf(type) < 0) {
                $scope.item.selectedStatus.push(type);
            } else {
                $scope.item.selectedStatus.splice($scope.item.selectedStatus.indexOf(type), 1);
            }
        };

        /**
         * [selectMode description] 选择同步模式
         * @param  {[type]} item [description]
         * @return {[type]}      [description]
         */
        $scope.selectMode = function(type) {
            $scope.item.selectedMode = type;
        };

        /**
         * [chooseChnl description] 选择目标栏目
         * @return {[type]} [description]
         */
        $scope.chooseChnl = function() {
            productMangageMentWebsiteService.batChooseChnl("目标栏目", $stateParams.site, function(data) {
                $scope.item.selectedChnls = data.ChannelIds;
                $scope.item.selectedChnlName = data.ChannelNames.replace(/,/g, "；");
            });
        };
    }]);
