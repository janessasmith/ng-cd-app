/*
    Create by BaiZhiming 2015-12-15
*/
'use strict';
angular.module("editcenterbatChooseChnlModule", [])
    .controller("batChooseChnlCtrl", ["$scope", "$filter", "$timeout", "$modalInstance", "trsHttpService", "chnlParams", "trsspliceString", "trsconfirm", function($scope, $filter, $timeout, $modalInstance, trsHttpService, chnlParams, trsspliceString, trsconfirm) {
        init();
        $scope.cancel = function() {
            $modalInstance.dismiss();
        };
        $scope.showToggle = function(node) {
            if (node.HASCHILDREN === "true" && node.CHILDREN.length === 0) {
                var params = {
                    "serviceid": "mlf_mediasite",
                    "methodname": "queryClassifyByChnl",
                    "ChannelId": node.CHANNELID
                };
                trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, 'get').then(function(data) {
                    node.CHILDREN = data.CHILDREN;
                });
            }
        };
        var promise;
        $scope.getSuggestionsSc = function(viewValue) {
            if (promise) {
                $timeout.cancel(promise);
                promise = null;
            }
            promise = $timeout(function() {
                var searchParams = {
                    "serviceid": "mlf_mediasite",
                    "methodname": "queryClassifyByName",
                    "ChannelName": viewValue,
                    "SiteId": chnlParams.siteid
                };
                return trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), searchParams, "post")
                    .then(function(data) {
                        return data;
                    });
            }, 10);
            return promise;
        };
        //监控SUGGESTION
        $scope.$watch("searchChannel", function(newValue, oldValue) {
            if (angular.isObject(newValue)) {
                chongFPush($scope.selectedChannels, newValue);
                $scope.searchChannel = "";
            }
        });
        //判断是否选中
        $scope.ifSelected = function(node, attribute) { //CHANNELID
            var flag = false;
            for (var i = 0; i < $scope.selectedChannels.length; i++) {
                if (angular.isDefined($scope[attribute][i])) {
                    if (node.CHANNELID === $scope[attribute][i].CHANNELID) {
                        // $scope.selectedChannels[i].selected = true;
                        // node.selected = true;
                        flag = true;
                        break;
                    }
                }
            }
            return flag;
        };
        $scope.channelFilter = function(elm) {
            if (elm) {
                return elm.CHANNELID == $scope.filterChnnelID;
            }
        };
        //判断是否选中
        $scope.chooseChannel = function(node) {
            if (node.TABLENAME && node.TABLENAME == 'officer') return;
            $scope.filterChnnelID = node.CHANNELID;
            var flag = $filter("contains")($scope.selectedChannels, $scope.channelFilter);//解决suggestion选择后不能取消的bug
            if (!flag) {
                $scope.selectedChannels.push(node);
                $scope.selectedArray.push(node);
                $scope.selectedChannels = $filter('unique')($scope.selectedChannels, 'CHANNELID');
            } else {
                cannelChannel(node);
            }
        };
        $scope.cancelChannel = function(channel) {
            cannelChannel(channel);
        };

        function cannelChannel(channel) {
            angular.forEach($scope.selectedChannels, function(data, index, array) {
                if (data.CHANNELID === channel.CHANNELID) {
                    $scope.selectedChannels[index].selected = false;
                    $scope.selectedChannels.splice(index, 1);
                    $scope.selectedArray.splice(index, 1);
                }
            });
        }
        $scope.isChecked = function(node) {
            var flag = false;
            angular.forEach($scope.selectedChannels, function(data, index, array) {
                if (data.CHANNELID === node.CHANNELID) {
                    flag = true;
                }
            });
            return flag;
        };
        $scope.confirm = function() {
            if ($scope.selectedChannels.length === 0) {
                trsconfirm.alertType("请先选择栏目", "", "warning", false);
                return;
            }
            $modalInstance.close({
                ChannelIds: trsspliceString.spliceString($scope.selectedChannels, "CHANNELID", ","),
                selectedRadio: $scope.selectedRedio
            });
        };
        //点击单选框
        $scope.chooseRadio = function(value) {
            $scope.selectedRedio = value;
        };
        //单选框是否选中
        $scope.radioIsChecked = function(value) {
            return $scope.selectedRedio === value;
        };

        function init() {
            getCommonlyChannel();
            //模态框标题初始化
            $scope.modalTitle = chnlParams.modalTitle;
            //初始化选中栏目集合
            $scope.selectedChannels = [];
            // $scope.selectedChannels = [];
            //初始化附件单选框
            $scope.radio = chnlParams.radio;
            //初始化单选框选中状态
            if (angular.isDefined(chnlParams.radio) && angular.isDefined(chnlParams.radio.defaultValue))
                $scope.selectedRedio = chnlParams.radio.enumValue[chnlParams.radio.defaultValue];
            //树配置开始
            $scope.treeOptions = {
                nodeChildren: "CHILDREN",
                dirSelectable: true,
                allowDeselect: false,
                injectClasses: {
                    ul: "copyDraftTree-ul",
                    li: "copyDraftTree-li",
                    liSelected: "a7",
                    iExpanded: "a3",
                    iCollapsed: "a4",
                    iLeaf: "a5",
                    label: "copyDraftTree-label",
                    labelSelected: "rolegrouplabselected"
                },
                isLeaf: function(node) {
                    return node.HASCHILDREN === "false";
                },
                isSelectable: function(node) {
                    return !node.TABLENAME || node.TABLENAME != 'officer'; //存在TABELNAME并且为官员库的时候不能点击
                }
            };
            $scope.selectedArray = [];
            //树配置结束
            var params = {
                "serviceid": "mlf_mediasite",
                "methodname": "queryClassifyBySite",
                "SiteId": chnlParams.siteid
            };
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function(data) {
                $scope.SITEDESC = data.SITEDESC;
                $scope.dataForTheTree = data.CHILDREN;
            });
            $scope.status = {
                ifExpand: true
            };
        }
        //防止重复推送开始
        function chongFPush(array, data) {
            var flagR = true;
            angular.forEach(array, function(dataC, index, array) {
                if (dataC.CHANNELID == data.CHANNELID) {
                    flagR = false;
                    return;
                }
            });
            if (flagR === true) {
                array.push(data);
            }
        }
        /**
         * [addCommonlyChannel description]添加到常用栏目
         * @param {[obj]} node [description]节点信息
         */
        $scope.addCommonlyChannel = function(node) {
            var params = {
                serviceid: "mlf_websiteoper",
                methodname: "addFrequentChannel",
                ObjectId: node.CHANNELID,
            };
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function(data) {
                getCommonlyChannel();
            });
        };
        /**
         * [getCommonlyChannel description]获取常用栏目
         * @return {[type]} [description]
         */
        function getCommonlyChannel() {
            var params = {
                serviceid: "mlf_websiteoper",
                methodname: "getFrequentChannels",
            };
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function(data) {
                $scope.commonlychannel = data;
                // $scope.selectedArray = [];
            });
        }
        /**
         * [selectCommonlychannel description]选择常用栏目
         * @param  {[obj]} item [description]栏目信息
         * @return {[type]}      [description]
         */
        $scope.selectCommonlychannel = function(item) {
            if ($scope.selectedArray.indexOf(item) > -1) {
                $scope.selectedArray.splice($scope.selectedArray.indexOf(item), 1);
                cannelChannel(item);
            } else {
                $scope.selectedArray.push(item);
                $scope.selectedChannels.push(item);
                $scope.selectedChannels = $filter('unique')($scope.selectedChannels, 'CHANNELID');
            }
        };
        /**
         * [deleteCommonlychannel description]删除常用栏目
         * @return {[type]} [description]
         */
        $scope.deleteCommonlychannel = function() {};
        /**
         * [removeChannel description]删除
         * @param  {[type]} item [description]
         * @return {[type]}      [description]
         */
        $scope.removeChannel = function(item) {
            var params = {
                serviceid: "mlf_websiteoper",
                methodname: "delFrequentChannel",
                FrequentChannelIds: item.FREQUENTCHANNELID,
            };
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function(data) {
                getCommonlyChannel();
            });
        };
    }]);
