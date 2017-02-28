/*
by zhou 2016/11/29
 */
"use strict";
angular.module('newTypeMgrModule', [])
    .controller('newTypeMgrCtrl', ['$scope', '$filter', "$modalInstance", "trsconfirm", "trsHttpService", "Params", 'trsspliceString', 'trsSelectItemByTreeService',
        function($scope, $filter, $modalInstance, trsconfirm, trsHttpService, Params, trsspliceString, trsSelectItemByTreeService) {
            initStatus();
            /**
             * [initStatus description:初始化状态]
             */
            function initStatus() {
                $scope.Params = angular.copy(Params);
                $scope.data = {
                    queryStatus: [{ name: "启用", value: 1 }, { name: "禁用", value: 0 }], //是否是核心稿库
                    queryHeXin: [{ name: "是", value: 1 }, { name: "否", value: 0 }], //是否是核心类型
                    selectedLeftArray: [], //左侧稿件可投稿人员范围 全选
                    selectedRightArray: [], //右侧稿库可见范围 全选
                    Leftitems: [], //左侧稿件可投稿人员范围 单选 请求返回数据
                    Rightitems: [], //右侧稿库可见范围 单选 请求返回数据
                    selectLeftTemp: [], //临时保存 左侧稿件可投稿人员范围
                    selectRightTemp: [] //临时保存 右侧稿库可见范围
                };
                //如果稿件是新建的,设置状态为启用,非核心稿库
                if ($scope.Params.SHARECATEGORYID === 0) {
                    $scope.Params.STATUS = $scope.data.queryStatus[0].value;
                    $scope.Params.ISCORE = $scope.data.queryHeXin[1].value;
                } else {
                    //修改时,请求数据的投稿人员
                    requestData();
                    //修改数据,设置页面上显示对应的状态
                    if ($scope.Params.STATUS == "1") {
                        $scope.Params.STATUS = $scope.data.queryStatus[0].value;
                    } else {
                        $scope.Params.STATUS = $scope.data.queryStatus[1].value;
                    }
                    //修改数据,设置页面上显示对应的核心稿库状态
                    if ($scope.Params.ISCORE == "1") {
                        $scope.Params.ISCORE = $scope.data.queryHeXin[0].value;
                    } else {
                        $scope.Params.ISCORE = $scope.data.queryHeXin[1].value;
                    }
                }
                $scope.title = $scope.Params.SHARECATEGORYID === 0 ? "新建稿库类型" : "修改稿库类型";
            }
            /**
             * [requestData 请求数据]
             * @return {[type]} [description]
             */
            function requestData() {
                var params = {
                    serviceid: "mlf_sharedoc",
                    methodname: "getShareCategory",
                    CatId: $scope.Params.SHARECATEGORYID
                };
                $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get", true).then(function(data) {
                    $scope.Params.CORDER = data.CORDER;
                    $scope.data.Leftitems = data.TOUGAO;
                    $scope.data.Rightitems = data.CHAKAN;
                });
            }
            /**
             * [selectQueryStatus 选择状态]
             * @param  {[type]} item [选择的值]
             * @return {[type]}      [description]
             */
            $scope.selectQueryStatus = function(item) {
                $scope.Params.STATUS = item.value;
            };
            /**
             * [selectQueryHeXin 选择是否是核心稿库]
             * @param  {[type]} item [description]
             * @return {[type]}      [description]
             */
            $scope.selectQueryHeXin = function(item) {
                $scope.Params.ISCORE = item.value;
            };
            /**
             * [selectAlll 左侧全选]
             * @return {[type]} [description]
             */
            $scope.selectLeftAll = function() {
                if ($scope.data.Leftitems.length == 1 && $scope.data.Leftitems[0].OBJID == '0') {
                    $scope.data.Leftitems = $scope.data.selectLeftTemp;
                } else {
                    $scope.data.selectLeftTemp = angular.copy($scope.data.Leftitems);
                    $scope.data.Leftitems = [];
                    $scope.data.Leftitems.push({
                        "OBJTYPE": "0",
                        "OBJID": "0",
                        "OPERTYPE": 1
                    });
                }
            };
            /**
             * [selectLeft 左侧选择按钮]
             * @param  {[type]} item [description]
             * @return {[type]}      [description]
             */
            $scope.selectLeft = function(item) {
                var index = $scope.data.selectedLeftArray.indexOf(item);
                if (index < 0) {
                    $scope.data.selectedLeftArray.push(item);
                } else {
                    $scope.data.selectedLeftArray.splice(index, 1);
                }
            };
            /**
             * [addLeft 左侧添加用户]
             */
            $scope.addLeft = function() {
                var tempLeftItems = angular.copy($scope.data.Leftitems);
                angular.forEach(tempLeftItems, function(value, key) {
                    value.DESC = value.OBJNAME || value.DESC;
                    value.OPERTYPE = value.OBJTYPE;
                    value.ID = value.OBJID;
                });
                trsSelectItemByTreeService.getDeptAndUser('', function(data) {
                    for (var item in data) {
                        data[item].OBJTYPE = data[item].OPERTYPE;
                        data[item].OBJID = data[item].ID;
                        data[item].OPERTYPE = 1;
                    }
                    $scope.data.Leftitems = data;
                    $scope.data.Leftitems = $filter('unique')($scope.data.Leftitems, 'ID');
                }, tempLeftItems, "添加可投稿人员范围");
                $scope.data.selectedLeftArray = [];
            };
            /**
             * [delLeft 左侧 删除所选]
             * @return {[type]}      [description]
             */
            $scope.delLeft = function() {
                for (var item in $scope.data.selectedLeftArray) {
                    var index = $scope.data.Leftitems.indexOf($scope.data.selectedLeftArray[item]);
                    $scope.data.Leftitems.splice(index, 1);
                }
                $scope.data.selectedLeftArray = [];
            };
            /**
             * [delAllLeft 左侧 清空全部]
             * @return {[type]} [description]
             */
            $scope.delAllLeft = function() {
                $scope.data.Leftitems = $scope.data.selectedLeftArray = [];
            };
            /**
             * [selectRightAll 右侧 全选]
             * @return {[type]} [description]
             */
            $scope.selectRightAll = function() {
                if ($scope.data.Rightitems.length == 1 && $scope.data.Rightitems[0].OBJID == '0') {
                    $scope.data.Rightitems = $scope.data.selectRightTemp;
                } else {
                    $scope.data.selectRightTemp = angular.copy($scope.data.Rightitems);
                    $scope.data.Rightitems = [];
                    $scope.data.Rightitems.push({
                        "OBJTYPE": "0",
                        "OBJID": "0",
                        "OPERTYPE": 2
                    });
                }
            };
            /**
             * [selectRight 右侧 选择按钮]
             * @param  {[type]} item [description]
             * @return {[type]}      [description]
             */
            $scope.selectRight = function(item) {
                var index = $scope.data.selectedRightArray.indexOf(item);
                if (index < 0) {
                    $scope.data.selectedRightArray.push(item);
                } else {
                    $scope.data.selectedRightArray.splice(index, 1);
                }
            };
            /**
             * [addRight 右侧 添加用户]
             */
            $scope.addRight = function() {
                var tempRightItems = angular.copy($scope.data.Rightitems);
                angular.forEach(tempRightItems, function(value, key) {
                    value.DESC = value.OBJNAME || value.DESC;
                    value.OPERTYPE = value.OBJTYPE;
                    value.ID = value.OBJID;
                });
                trsSelectItemByTreeService.getDeptAndUser('', function(data) {
                    for (var item in data) {
                        data[item].OBJTYPE = data[item].OPERTYPE;
                        data[item].OBJID = data[item].ID;
                        data[item].OPERTYPE = 2;
                    }
                    $scope.data.Rightitems = data;
                    $scope.data.Rightitems = $filter('unique')($scope.data.Rightitems, 'ID');
                }, tempRightItems, '添加可见范围');
                $scope.data.selectedRightArray = [];
            };
            /**
             * [delRight 右侧 删除所选]
             * @return {[type]}      [description]
             */
            $scope.delRight = function() {
                for (var item in $scope.data.selectedRightArray) {
                    var index = $scope.data.Rightitems.indexOf($scope.data.selectedRightArray[item]);
                    $scope.data.Rightitems.splice(index, 1);
                }
                $scope.data.selectedRightArray = [];
            };
            /**
             * [delAllRight 右侧 清空全部]
             * @return {[type]} [description]
             */
            $scope.delAllRight = function() {
                $scope.data.Rightitems = $scope.data.selectedRightArray = [];
            };
            /**
             * [cancel description:取消]
             */
            $scope.cancel = function() {
                $scope.data.Leftitems = $scope.data.selectedLeftArray = [];
                $scope.data.Rightitems = $scope.data.selectedRightArray = [];
                $modalInstance.dismiss();
            };
            /**
             * [confirm description:确定]
             */
            $scope.confirm = function() {
                var VisibleCategorys = $scope.data.Leftitems.concat($scope.data.Rightitems); //合并稿库为同一个数组
                //处理数组返回的格式
                for (var item in VisibleCategorys) {
                    VisibleCategorys[item] = ({
                        OperType: VisibleCategorys[item].OPERTYPE,
                        ObjId: VisibleCategorys[item].OBJID,
                        ObjType: VisibleCategorys[item].OBJTYPE,
                    });
                }
                //把数组转为字符串
                $scope.Params.VISIBLECATEGORYS = JSON.stringify(VisibleCategorys);
                $modalInstance.close($scope.Params);
                //稿件可投稿人员范围或稿库可见范围 未选中 禁止提交
                // if ($scope.data.Leftitems.length === 0) {
                //     trsconfirm.alertType($scope.title + '失败', "请选择稿件可投稿人员范围", "error", false, function() {
                //         return;
                //     });
                // } else if ($scope.data.Rightitems.length === 0) {
                //     trsconfirm.alertType($scope.title + '失败', "请选择稿库可见范围", "error", false, function() {
                //         return;
                //     });
                // } else {
                // }
            };
        }
    ]);
