/*
    Create by Baizm 2015-11-13
*/
"use strict";
angular.module("politicalcommSenseModule", [])
    .controller("politicalcommSenseCtrl", ["$scope", "$modal", "$stateParams", 'trsHttpService', 'trsconfirm', '$timeout', function($scope, $modal, $stateParams, trsHttpService, trsconfirm, $timeout) {
        initData();

        function initData() {
            $scope.file = {
                peoplename: "",
                title: "",
                orderNum: null,
                id: ""
            };
            $scope.dataForTheTree = "";
            $scope.status = {
                maxNum: 0,
                currNum: 0
            };
            $scope.treeOptions = {
                nodeChildren: "CHILDREN",
                dirSelectable: true,
                allowDeselect: false,
                injectClasses: {
                    ul: "a1",
                    li: "a2",
                    liSelected: "a7",
                    iExpanded: "a3",
                    iCollapsed: "a4",
                    iLeaf: "a5",
                    label: "a6",
                    labelSelected: "rolegrouplabselected"
                }
                /*,
                                isLeaf: function(node) {
                                    return node.type == "file";
                                }*/
            };
            //树配置结束
            $scope.module = $stateParams.name;
            $scope.url = $stateParams.type;
            getInitTree();
        }

        //树配置开始
        $scope.showSelected = function(node) {
            getDetailInfo(node.id);
        };
        /**
         * [getDetailInfo description获取节点信息]
         * @param  {[type]} id [description]
         * @return {[type]}    [description]
         */
        function getDetailInfo(id) {
            $scope.switch = {
                folder: false,
                file: true,
            };
            var params = {
                typeid: "dicttool",
                serviceid: $scope.url,
                modelid: "getNodeInfo",
                id: id
            };
            trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), params, 'get').then(function(data) {
                $scope.file = data;
                if ($scope.file.orderNum == 9999) {
                    $scope.file.orderNum = null;
                    $scope.status.maxNum = $scope.status.currNum + 1;
                } else {
                    $scope.status.maxNum = $scope.status.currNum;
                }
            });
        }
        /**
         * [showToggle description点击导航树节点：显示节点详细信息]
         * @param  {[type]} node [description]
         * @return {[type]}      [description]
         */
        $scope.showToggle = function(node) {
            getInitTree();
        };


        /**
         * [selectRoot description点击根节点事件]
         * @return {[type]} [description]
         */
        $scope.selectRoot = function() {
            $scope.switch = {
                create: false,
                folder: true,
                file: false,
            };
            $scope.isRoot = true;
            $scope.selectedNode = {};
            $scope.folder = {
                instruction: $scope.module,
                dictName: $scope.module
            };
        };

        /**
         * [getInitTree description获取所有姓名-职务 列表]
         * @return {[type]} [description]
         */
        function getInitTree() {
            var params = {
                typeid: "dicttool",
                serviceid: $scope.url,
                modelid: "findAll"
            };
            trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), params, 'get').then(function(data) {
                $scope.dataForTheTree = data;
                getCurrNum();
                //默认显示
                $scope.tree = {
                    display: true
                };
            }, function(data) {
                $scope.dataForTheTree = [];
            });
        }
        /**
         * [getCurrNum description获取当前排序人员总数]
         * @return {[type]} [description]
         */
        function getCurrNum() {
            $scope.status.currNum = 0;
            if ($scope.dataForTheTree.length > 0) {
                angular.forEach($scope.dataForTheTree, function(data, index, array) {
                    if (data.orderNum != 9999) {
                        $scope.status.currNum = $scope.status.currNum + 1;
                    }
                });
            }

        }
        //搜索方法开始
        $scope.search = function() {
            var params = {
                typeid: "dicttool",
                serviceid: $scope.url,
                modelid: "findByName",
                dictName: $scope.searchWord
            };
            if ($scope.searchWord === "" || $scope.searchWord === undefined) {
                getInitTree();
            } else {
                trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), params, 'get').then(function(data) {
                    $scope.dataForTheTree = data;
                });
            }
        };
        /**
         * [createFile description新建文件]
         * @param  {[type]} type [description]
         * @return {[type]}      [description]
         */
        $scope.createFile = function(type) {
            $scope.switch = {
                folder: false,
                file: true,
            };
            $scope.file.peoplename = "";
            $scope.file.title = "";
            $scope.file.orderNum = "";
            $scope.createType = type;
            $scope.file.id = "";

            //重置创建文件表单
            $scope.fileForm.$setPristine();

            $scope.status.maxNum = $scope.status.currNum + 1;
        };
        //新建、更改：保存
        $scope.saveClassficationData = function() {
            var params = {
                "typeid": 'dicttool',
                "serviceid": $scope.url,
                "modelid": "addNode",
                "peoplename": $scope.file.peoplename,
                "title": $scope.file.title
                    /*,
                                    "orderNum": $scope.file.orderNum*/
            };
            if ($scope.file.orderNum == null) { //不排序
                params.orderNum = 9999;
            } else { //手动排序
                if ($scope.file.orderNum > $scope.status.maxNum) {
                    trsconfirm.alertType("请检查填写项", "排序数值不能大于"+$scope.status.maxNum+"!", "warning", false, function() {});
                    return;
                } else {
                    params.orderNum = $scope.file.orderNum;
                }
            }
            if ($scope.file.id != "") {
                params.id = $scope.file.id;
                params.modelid = "update";
            }
            trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), params, 'post').then(function(data) {
                data = data.replace(/[\r\n]/g, "");
                if (data === '"success"') {
                    trsconfirm.alertType("保存成功", "", "success", false, function() {});
                    getInitTree();
                    if ($scope.file.id != "") {
                        $scope.selectedNode = $scope.file;
                    }
                } else {
                    trsconfirm.alertType("保存失败", "", "warning", false, function() {});
                }
            }, function(data) {});
        };
        /**
         * [getDetailInfo description获取节点信息]
         * @param  {[type]} id [description]
         * @return {[type]}    [description]
         */
        /*$scope.getDetailInfo = function(item) {
            $scope.switch = {
                folder: false,
                file: true,
            };
            var params = {
                typeid: "dicttool",
                serviceid: $scope.url,
                modelid: "getNodeInfo",
                id: item.id
            };
            trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), params, 'get').then(function(data) {
                $scope.file = data;
            });
        };*/
        /**
         * [deleteNode description删除节点]
         * @return {[type]} [description]
         */
        $scope.deleteNode = function() {
            trsconfirm.alertType("确认删除", "您确定要删除么", "warning", true, function() {
                var params = {
                    typeid: "dicttool",
                    serviceid: $scope.url,
                    modelid: "deleteNode",
                    nodeId: $scope.file.id
                };
                trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), params, 'get').then(function(data) {
                    if ("success" === "success") {
                        getInitTree();
                    } else {
                        trsconfirm.alertType("删除失败", data, "warning", false, function() {});
                    }
                });
            });
        };
    }]);
