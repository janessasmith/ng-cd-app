/*
    Create by Baizm 2015-11-13
*/
"use strict";
/**
 * modify by cc 16-11-30
 * 新增图片库分类，图片库分类来自WCM
 */
angular.module("classficationModule", ["synchronous"])
    .controller("classficationCtrl", ["$scope", "$q", "$state", "$modal", "$stateParams", 'trsHttpService', 'trsconfirm', '$timeout',
        function($scope, $q, $state, $modal, $stateParams, trsHttpService, trsconfirm, $timeout) {
            initStatus();
            initData();
            /**
             * [initStatus description]初始化状态
             * @return {[type]} [description]
             */
            function initStatus() {
                $scope.status = {
                    material: {
                        "word": "0",
                        "picture": "1",
                        "video": "2"
                    }, //素材分类
                    showClassify: false, //是否展示分类
                    isRootClassify: true, //是否是根节点
                    isCreateClassify: false, //是否新建分类
                    isLeafClassify: false, //是否为叶子分类(最后一级分类)
                };
                $scope.data = {
                    MATERIALTYPEID: 0, //初始分类ID
                    PICMATERIALTYPE: 1, //图片库的类型
                    PICROOTID: 0, //图片库的分类ID
                    CREATECLASSIFY: 0, //新建分类传入的分类ID
                    parendNode: null, //当前节点的父节点
                };
                $scope.params = {
                    condition: 'id=area_002001'
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
                    },
                    isLeaf: function(node) {
                        return node.type == "file" || node.HASCHILDREN == 'false';
                    }
                };
                //树配置结束
                $scope.module = $stateParams.name;
                $scope.url = $stateParams.type;
                $scope.status.isFromBigData = $scope.status.material[$state.params.type] ? false : true; //区分调WCM服务还是调大数据服务//区分来自大数据渠道还是WCM渠道
            }
            /**
             * [initData description]初始化数据
             * @return {[type]} [description]
             */
            function initData() {
                $scope.status.isFromBigData ? getBigDataTree($state.params.type) : getWcmDataTree($scope.status.material[$state.params.type], $scope.data.MATERIALTYPEID);
            }
            /**
             * [getWcmDataTree description]从wcm渠道获得树信息
             * @param  {[str]} type            [description]素材分类ID
             * @param  {[num]} materialTypeId  [description]父分类ID
             * @return {[type]}                [description]
             */
            function getWcmDataTree(type, materialTypeId) {
                var params = {
                    serviceid: "nb_materialType",
                    methodname: "query",
                    materialType: type,
                    parentId: materialTypeId,
                };
                trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function(data) {
                    $scope.dataForTheTree = data;
                    //默认树显示
                    $scope.tree = {
                        display: true
                    };
                    $scope.expanded=[];
                });
            }
            /**
             * [getBigDataTree description]从大数据渠道获得树信息
             * @param  {[str]} serviceid  [description]服务名ID
             * @return {[type]}           [description]
             */
            function getBigDataTree(serviceid) {
                if (!angular.isDefined(serviceid)) {
                    return;
                }
                var params = {
                    typeid: "dicttool",
                    serviceid: serviceid,
                    modelid: "getRootLevel",
                };
                trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), params, 'get').then(function(data) {
                    //trsHttpService.httpServer('/dicttool/' + url + '/getRootLevel', "", 'get').then(function(data) {
                    $scope.dataForTheTree = data;
                    //默认树显示
                    $scope.tree = {
                        display: true
                    };
                    //树的初始化展开
                    /*$timeout(function() {
                        $scope.expanded.push($scope.dataForTheTree[0]);
                    }, 100);*/
                    // $scope.content=$scope.dataForTheTree;
                }, function(data) {
                    $scope.dataForTheTree = [];
                });
            }
            /**
             * [getBigDataChildren description]获取大数据渠道下子分类
             * @param  {[obj]} node  [description]节点信息
             * @return {[type]}      [description]
             */
            function getBigDataChildren(node) {
                var params = {
                    typeid: "dicttool",
                    serviceid: $scope.url,
                    modelid: "getChildren",
                    parentId: node.id
                };
                trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), params, 'get').then(function(data) {
                    node.CHILDREN = data;
                });
            }
            /**
             * [getWcmDataChildren description]获得WCM下子渠道
             * @param  {[obj]} node  [description]节点信息
             * @return {[type]}      [description]
             */
            function getWcmDataChildren(node) {
                var defferd = $q.defer();
                var params = {
                    serviceid: "nb_materialType",
                    methodname: "query",
                    materialType: node.MATERIALTYPE,
                    parentId: node.MATERIALTYPEID,
                };
                trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function(data) {
                    defferd.resolve(data);
                });
                return defferd.promise;
            }
            /**
             * [saveClassify description]保存分类
             * @return {[type]} [descriptigetWcmDataChildrenon]
             */
            $scope.saveClassify = function() {
                var params = {
                    serviceid: "nb_materialtype",
                    methodname: "save",
                    // materialType: $scope.data.PICMATERIALTYPE,
                    materialType: $scope.status.material[$state.params.type],
                    title: $scope.data.classifyName
                };
                params.matealTypeId = $scope.status.isCreateClassify ? 0 : $scope.selectedNode.MATERIALTYPEID;
                params.parentId = $scope.status.isCreateClassify ? $scope.selectedNode.MATERIALTYPEID || $scope.data.PICROOTID : $scope.selectedNode.PARENTID;
                trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function(data) {
                    trsconfirm.alertType('操作成功', "", "success", false);
                    reloadWcmClassify();
                });
            };
            /**
             * [deleteClassify description]删除分类
             * @return {[type]} [description]
             */
            $scope.deleteClassify = function() {
                trsconfirm.confirmModel('删除分类', '确认删除', function() {
                    var params = {
                        serviceid: "nb_materialtype",
                        methodname: "deleteType",
                        materialTypeIds: $scope.selectedNode.MATERIALTYPEID,
                        parentId: $scope.selectedNode.PARENTID
                    };
                    trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function(data) {
                        trsconfirm.alertType('分类删除成功', "", "success", false);
                        reloadWcmClassify();
                    });
                });
            };
            /**
             * [reloadClassify description]加载WCM分类树
             * @return {[type]} [description]
             */
            function reloadWcmClassify() {
                $scope.status.showClassify = false;
                var node = $scope.status.isCreateClassify ? $scope.selectedNode : $scope.data.parentNode; //区分新建还是编辑
                if (!$scope.status.isRootClassify && node) { //区分是根节点操作还是普通节点
                    getWcmDataChildren(node).then(function(data) {
                        $timeout(function() {
                            node.CHILDREN = data;
                            node.HASCHILDREN = data.length === 0 ? "false" : "true";
                            if (data.length>0) {
                                $scope.expanded=[];//解决编辑bug
                                $scope.expanded.push(node);
                            }
                        });
                    });
                } else {
                    getWcmDataTree($scope.status.material[$state.params.type], $scope.data.MATERIALTYPEID);
                }
            }

            /**
             * [showToggle description]树节点展开方法
             * @param  {[node]} node [description]节点信息
             * @return {[type]}      [description]
             */
            $scope.showToggle = function(node) {
                if (angular.isDefined(node.CHILDREN)) return;
                if ($scope.status.isFromBigData) {
                    getBigDataChildren(node);
                } else {
                    getWcmDataChildren(node).then(function(data) {
                        node.CHILDREN = data;
                    });
                }
            };
            /**
             * [createClassify description]新建分类
             * @return {[type]} [description]
             */
            $scope.createClassify = function() {
                $scope.status.isCreateClassify = true;
                $scope.data.classifyName = "";
            };
            /**
             * [selectRoot description]选择根节点
             * @return {[type]} [description]
             */
            $scope.selectRoot = function() {
                $scope.status.isFromBigData ? selectBigDataRoot() : selectWcmRoot();
            };
            /**
             * [selectBigDataRoot description]选择大数据渠道的根节点
             * @return {[type]} [description]
             */
            function selectBigDataRoot() {
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
            }
            /**
             * [selectWcmRoot description]选择WCM渠道根节点
             * @return {[type]} [description]
             */
            function selectWcmRoot() {
                $scope.status.showClassify = $scope.status.isRootClassify = true; //将根节点标识设为true
                $scope.status.isCreateClassify = false;
                $scope.status.isLeafClassify = 'false'; //特殊处理
                $scope.data.classifyName = $scope.module;
                $scope.selectedNode = {};
            }
            /**
             * [showSelected description]   选中节点
             * @param  {[obj]} node         [description]节点信息
             * @param  {[obj]} $parentNode  [description]父节点信息
             * @return {[type]}             [description]
             */
            $scope.showSelected = function(node, $parentNode) {
                $scope.status.isFromBigData ? showBigDataCreate(node, $parentNode) : showWcmDataCreate(node, $parentNode);
            };
            /**
             * [showWcmDataCreate description]
             * @param  {[obj]} node        [description]当前节点信息
             * @param  {[obj]} parentNode  [description]父节点信息
             * @return {[type]}            [description]
             */
            function showWcmDataCreate(node, parentNode) {
                $scope.status.showClassify = true;
                $scope.data.parentNode = parentNode; //获得当前节点的父节点
                $scope.status.isRootClassify = $scope.status.isCreateClassify = false; //将根节点标识设为false
                $scope.data.classifyName = node.TITLE;
                examIsWcmLeaf(node);
            }
            /**
             * [examIsLeaf description]检测当前节点是否为叶子节点
             * @param  {[obj]} node  [description]节点信息
             * @return {[type]}      [description]
             */
            function examIsWcmLeaf(node) {
                var params = {
                    serviceid: "nb_materialtype",
                    methodname: "isThirdMaterialTypeStair",
                    MaterialTypeId: node.MATERIALTYPEID
                };
                trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function(data) {
                    $scope.status.isLeafClassify = data.replace(/\"/g, "");
                });
            }
            /**
             * [showBigDataCreated description]展示大数据渠道新建区域
             * @param  {[obj]} node         [description]节点信息
             * @param  {[obj]} $parentNode  [description]父节点信息
             * @return {[type]}             [description]
             */
            function showBigDataCreate(node, $parentNode) {
                //获取当前树的父节点，用于删除开始
                $timeout(function() {
                    $parentNode === null ? $scope.parentNode = {
                        CHILDREN: $scope.dataForTheTree
                    } : $scope.parentNode = $parentNode;
                }, 100);
                //获取当前树的父节点，用于删除结束
                $scope.params = {
                    typeid: "dicttool",
                    serviceid: $scope.url,
                    modelid: "getNodeInfo",
                    nodeId: node.id
                };
                $scope.isRoot = false;
                //trsHttpService.httpServer('/dicttool/' + $scope.url + '/getNodeInfo/', $scope.params, 'get').then(function(data) {
                trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), $scope.params, 'get').then(function(data) {
                    //重置创建文件表单
                    $scope.createForm.$setPristine();
                    //当点击非叶子节点（文件夹）时出现的页面
                    $scope.nodeId = node.id;
                    if (node.type === "dir") {
                        //声明文件夹数据对象，为文件夹说明赋值
                        $scope.folder = {};
                        $scope.folder.instruction = data.content.replace(/~/g, "\n");
                        $scope.folder.dictName = data.dictName;
                        $scope.switch = {
                            create: false,
                            folder: true,
                            file: false,
                        };
                    } else {
                        $scope.file = {};
                        $scope.file.instruction = data.content.replace(/~/g, "\n");
                        $scope.file.dictName = data.dictName;
                        $scope.switch = {
                            create: false,
                            folder: false,
                            file: true,
                        };
                    }
                    $scope.instruction = "";
                    $scope.dictName = "";
                });
            }
            //同步分类到CKM服务器
            $scope.SynchronousData = function() {
                $modal.open({
                    templateUrl: "./manageConfig/sysManageMent/classifiedDictionary/classification/synchronous/synchronous_tpl.html",
                    scope: $scope,
                    windowClass: 'toBeCompiled-synchronousModel-window',
                    backdrop: true,
                    controller: "synchronousCtrl"
                });
            };
            //搜索方法开始
            $scope.search = function() {
                var params = {
                    typeid: "dicttool",
                    serviceid: $scope.url,
                    modelid: "getAbsolutePathOfNode",
                    condition: "dictName=%" + $scope.searchWord + "%"
                };
                if ($scope.searchWord === "" || $scope.searchWord === undefined) {
                    getBigDataTree($scope.url);
                } else {
                    trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), params, 'get').then(function(data) {
                        //trsHttpService.httpServer('/dicttool/' + $scope.url + '/getAbsolutePathOfNode', params, 'get').then(function(data) {
                        $scope.dataForTheTree = data;
                    });
                }
            };
            $scope.deleteNode = function() {
                trsconfirm.alertType("确认删除", "您确定要删除么", "warning", true, function() {
                    var params = {
                        typeid: "dicttool",
                        serviceid: $scope.url,
                        modelid: "deleteNode",
                        nodeId: $scope.selectedNode.id
                    };
                    trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), params, 'get').then(function(data) {
                        //trsHttpService.httpServer('/dicttool/' + $scope.url + '/deleteNode', params, 'get').then(function(data) {
                        if ("success" === "success") {
                            var deleteIndex;
                            angular.forEach($scope.parentNode.CHILDREN, function(data, index, array) {
                                if (data.id === $scope.selectedNode.id) {
                                    deleteIndex = index;
                                }
                            });
                            $timeout(function() {
                                if ($scope.parentNode instanceof Array) {
                                    $scope.parentNode.splice(deleteIndex, 1);
                                } else {
                                    $scope.parentNode.CHILDREN.splice(deleteIndex, 1);
                                }
                            }, 100);
                        } else {
                            trsconfirm.alertType("删除失败", data, "warning", false, function() {});
                        }
                    });
                });
            };
            $scope.createFileOrFolder = function(type) {
                $scope.switch = {
                    create: true,
                    folder: false,
                    file: false,
                };
                $scope.dictName = "";
                $scope.instruction = "";
                $scope.createType = type;
            };
            //保存新建文件或文件夹
            $scope.saveCreate = function() {
                /*if ($scope.nodeId === undefined) {
                    trsconfirm.alertType("请先选择节点", "请先选择节点", "warning", false, function() {});
                    return;
                }*/
                var params = {
                    "typeid": "dicttool",
                    "serviceid": $scope.url,
                    "modelid": "addNode",
                    "nodeId": $scope.nodeId,
                    "dictName": $scope.dictName,
                    "content": angular.copy($scope.instruction).replace(/\n/g, "~").replace(/\"/g, "'").replace(/\\/g, "")
                };
                if ($scope.isRoot) {
                    params.nodeId = "";
                }
                var newNode = {
                    "dictName": $scope.dictName,

                };
                // var url = "/dicttool/" + $scope.url + "/addNode";
                if ($scope.createType === "file") {
                    params.type = "file";
                    newNode.type = "file";
                } else {
                    params.type = "dir";
                    newNode.type = "dir";
                    newNode.CHILDREN = [];
                }
                trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), params, 'get').then(function(data) {
                    newNode.id = data;
                    if ($scope.isRoot) {
                        $scope.dataForTheTree.push(newNode);
                        $scope.expanded.push(newNode);
                    }
                    $scope.selectedNode.CHILDREN.push(newNode);
                    $scope.expanded.push(newNode);
                    $scope.switch = {
                        create: false,
                        folder: true,
                        file: false,
                    };
                }, function(data) {});
            };
            //删除文件或文件夹方法开始

            //更改保存地域分类数据
            $scope.saveClassficationData = function(type) {
                if ($scope.nodeId === undefined) {
                    trsconfirm.alertType("请先选择节点", "请先选择节点", "warning", false, function() {});
                    return;
                }
                var params = {
                    "typeid": 'dicttool',
                    "serviceid": $scope.url,
                    "modelid": 'update',
                    "condition": "id=" + $scope.nodeId,
                };
                if (type === 'file') {
                    params.dictName = $scope.file.dictName;
                    params.content = angular.copy($scope.file.instruction).replace(/\n/g, "~").replace(/\"/g, "'").replace(/\\/g, "");
                } else {
                    params.dictName = $scope.folder.dictName;
                    params.content = angular.copy($scope.folder.instruction).replace(/\n/g, "~").replace(/\"/g, "'").replace(/\\/g, "");
                }
                trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), params, 'post').then(function(data) {
                    //trsHttpService.httpServer('/dicttool/' + $scope.url + '/update', params, 'post').then(function(data) {
                    // $scope.content=$scope.dataForTheTree;
                    if (data === "success") {
                        $scope.selectedNode.dictName = params.dictName;
                        trsconfirm.alertType("保存成功", data, "success", false, function() {});
                    } else {
                        trsconfirm.alertType("保存失败", data, "warning", false, function() {});
                    }
                }, function(data) {});

            };

            /*function initSwitch(dataC) {
                //树选中效果重置；
                if ($scope.selectedNode !== undefined) {
                    $scope.selectedNode = {};
                    $scope.nodeId = null;
                }
                //默认展开效果重置
                $scope.expanded = [];
                //初始化file值
                $scope.file = {};
                //初始化folder值
                $scope.folder = {};
                //初始化create值
                $scope.dictName = "";
                $scope.instruction = "";
                //切换时清空树
                $scope.dataForTheTree = [];
                //还原三个表单验证
                $scope.createForm.$setPristine();
                $scope.folderForm.$setPristine();
                $scope.fileForm.$setPristine();
                //获取请求地址
                $scope.url = dataC.type;
                
                //表单的切换初始化
                if ($scope.nodeId === undefined || $scope.nodeId===null) {
                    $scope.switch = {
                        create: false,
                        folder: false,
                        file: false,
                    };
                }
                $scope.module = dataC.name;
                getBigDataTree(dataC.type);
            }*/
        }
    ]);
