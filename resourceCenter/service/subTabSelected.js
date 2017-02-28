/*
 created by zhyp on 2015.12.16
 description:用于二级导航切换时选中状态
 modify by cc 16-11-25
*/
"use strict";
angular.module('resCenterSubTabModule', [])
    .controller('resCenterSubTabCtrl', ["$scope", "$state", "$stateParams", "trsHttpService", "leftService", "$timeout", "$rootScope", "localStorageService", "resourceCenterService",
        function($scope, $state, $stateParams, trsHttpService, leftService, $timeout, $rootScope, localStorageService, resourceCenterService) {

            var typeName = leftService.getParamValue('typename');
            var channelName = leftService.getCurChannel();
            initStatus();
            initData();
            //  鼠标移到'更多'
            var mouseleave = true;
            $scope.moreMouseenter = function() {
                mouseleave = false;
                $scope.isShowMoreList = true;
            };

            $scope.moreMouseleave = function() {
                mouseleave = true;
                $timeout(function() {
                    mouseleave && ($scope.isShowMoreList = false);
                }, 1000);
            };

            //切换状态
            $scope.changeType = function(item, router, temp) {
                if (temp == true) {
                    var url = item.MODALNAME == "我的订阅" ? "resourcectrl.iwo.resource" : "retrieval.resmanage";
                    $state.go(url, {
                        typename: item.MODALID
                    });
                } else {
                    //共享稿库地域分类临时兼容开始
                    var curUrl = window.location.href;
                    var url;
                    url = curUrl.indexOf("resourcectrl/share/") >= 0 && (item.MODALDESC === "地域分类" || item.MODALDESC === "主题分类") ? (router + ".resource1") : (router + ".resource");
                    //共享稿库地域分类临时兼容结束
                    $state.transitionTo(url, {
                        typename: item.TYPENAME,
                        modalid: item.MODALID,
                        nodeid: "",
                    }, { reload: router });
                }
            };
            //切换路由，并获取节点下数据
            $scope.goTo = function(item) {
                var resourceCenterUrlMemorys = localStorageService.get("resourceCenterUrlMemory");
                var memoryUrl = resourceCenterUrlMemorys[item.MODALDESC];
                if (memoryUrl) {
                    $state.go(memoryUrl.name, memoryUrl.params, { reload: true });
                    return;
                }
                loadSubData(item);
            };

            //初始化二级导航条数据
            function initData() {
                var moduleParams = {
                    serviceid: "mlf_releasesource",
                    methodname: "queryModals",
                    ModalName: "MODAL_RESOURCE"
                };
                trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), moduleParams, "post")
                    .then(function(data) {
                        var arr = [];
                        var curItem;
                        angular.forEach(data, function(n, index, array) {
                            n.router = "resourcectrl." + n.MODALDESC;
                            arr.push(n);
                            if ($state.current.name != "retrieval.resmanage" && $state.current.name != "retrieval.subscribe") {
                                if (n.MODALDESC == channelName) {
                                    n.isActive = true;
                                    curItem = n;
                                } else {
                                    n.isActive = false;
                                }
                            } else {
                                if (n.MODALDESC == "iwo") {
                                    n.isActive = true;
                                    curItem = n;
                                } else {
                                    n.isActive = false;
                                }
                            }
                        });
                        $scope.items = arr;
                        curItem && loadSubData(curItem);
                    });
            }

            function loadSubData(item) {
                var moduleChlidrenParams = {
                    serviceid: "mlf_releasesource",
                    methodname: "queryModals",
                    Modalid: item.MODALID
                };
                trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), moduleChlidrenParams, "post")
                    .then(function(data) {
                        var tname, modalid, /*临时兼容*/ modaldesc;
                        angular.forEach(data, function(n, i) {
                            if (n.TYPENAME && typeName == n.TYPENAME || (n.MODALID == "74" && $state.current.name == "retrieval.resmanage")) {
                                n.focused = true;
                                tname = n.TYPENAME;
                                modalid = n.MODALID;
                                /*临时兼容*/
                                modaldesc = n.MODALDESC;
                            } else {
                                n.focused = false;
                            }
                        });

                        if (data.length && angular.isArray(data) && $state.current.name != "retrieval.subscribe") {
                            if (!tname) {
                                tname = data[0].TYPENAME;
                                data[0].focused = true;
                            }
                            modalid = modalid || data[0].MODALID;

                        }
                        item.childrenModule = data;
                        /*临时兼容*/
                        var myUrl = window.location.href;
                        var url = item.router + ".resource";
                        /*临时兼容*/
                        if (myUrl.indexOf("resourcectrl/share") > 0 && modaldesc === "地域分类") {
                            url = item.router + ".resource1";
                        }
                        /*数字报预览显示临时兼容*/
                        if (myUrl.indexOf('digital/preview') > 0) {
                            url = item.router + ".resource";
                        }
                        if (item.MODALDESC == "iwo") {
                            if ($state.current.name != "retrieval.resmanage" && $state.current.name != "retrieval.subscribe") {
                                $state.go(url, {
                                    typename: modalid,
                                    modalid: modalid
                                });
                            } else {
                                $state.go($state.current.name, {
                                    typename: modalid,
                                    modalid: modalid
                                });
                            }
                        } else {
                            $state.go(url, {
                                typename: tname,
                                modalid: modalid
                            });
                        }
                    });
            }

            function initStatus() {
                $scope.status = {};
                $rootScope.$watch("status.resourceCenterAccesses", function(nvl, ovl) {
                    $scope.status.resourceCenterAccesses = nvl;
                });
            }

        }
    ]).controller('resCenterSubTabPictrueCtrl', ["$scope", "$location", "$q", "$state", '$filter', "trsHttpService", "leftService", "$timeout", "$rootScope", "localStorageService", 'resourceCenterMaterialService', 'storageListenerService',//素材库顶部导航
        function($scope, $location, $q, $state, $filter, trsHttpService, leftService, $timeout, $rootScope, localStorageService, resourceCenterMaterialService, storageListenerService) {
            initStatus();
            initData();
            /**
             * [initStatus description]初始化状态
             * @return {[type]} [description]
             */
            function initStatus() {
                $scope.status = {
                    currModule: leftService.getCurChannel(),
                    path: $location.path().split('/')[2],//获得素材分类
                };
                $scope.data = {
                    MATERIALTYPEID: 0, //分类ID新建时为0
                    MATERIALTYPE: {
                        picture: 1,
                        video: 2
                    }//素材库素材分类
                };
                $scope.params = {
                    serviceid: "mlf_releasesource",
                    methodname: "queryModals",
                    ModalName: "MODAL_RESOURCE"
                }; //模块查询参数
            }
            /**
             * [initData description]初始化数据
             * @return {[type]} [description]
             */
            function initData() {
                $scope.data.materialType=$scope.data.MATERIALTYPE[$scope.status.path];//获得素材库素材分类
                queryModules().then(function(data) {
                    var item = $filter('filterBy')($scope.items, ['MODALDESC'], $scope.status.path);
                    var index = $scope.items.indexOf(item[0]);
                    queryPicClassify(index, item[0]);
                });
            }
            $rootScope.$watch("status.resourceCenterAccesses", function(nvl, ovl) {
                $scope.status.resourceCenterAccesses = nvl;
            });
            /**
             * [queryModules description]获得模块
             * @return {[type]} [description]
             */
            function queryModules() {
                var defferd = $q.defer();
                trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), $scope.params, "get").then(function(data) {
                    $scope.items = data;
                    defferd.resolve(data);
                });
                return defferd.promise;
            }
            /**
             * [goTo description]跳转
             * @param  {[obj]} item  [description]要跳转的模块
             * @return {[type]}      [description]
             */
            $scope.goTo = function(item) {
                var resourceCenterUrlMemorys = localStorageService.get("resourceCenterUrlMemory");
                var memoryUrl = resourceCenterUrlMemorys[item.MODALDESC];
                if (memoryUrl) {
                    $state.go(memoryUrl.name, memoryUrl.params, { reload: true });
                    return;
                } else {
                    $state.go('resourcectrl.' + item.MODALDESC + ".resource", {
                        "typename": item.TYPENAME,
                        "modalid": item.MODALID,
                    });
                }
            };
            /**
             * [classifyFilter description]分类过滤器
             * @param  {[obj]} elm  [description]分类信息
             * @return {[type]}     [description]
             */
            $scope.classifyFilter = function(elm) {
                if (elm) return elm.MATERIALTYPEID == $state.params.topclassifyid;
            };
            /**
             * [queryPicClassify description]查询图片库一级分类
             * @param  {[str]} index  [description]图片库分类对应下标
             * @param  {[obj]} item   [description]图片库分类
             * @return {[type]}       [description]
             */
            function queryPicClassify(index, item) {
                $scope.items[index].isActive = true;
                resourceCenterMaterialService.queryClassify($scope.data.materialType, $scope.data.MATERIALTYPEID).then(function(data) {
                    if (data) {
                        item.childrenModule = data;
                        var temp = $state.params.materialtypeid ? $filter('pick')(item.childrenModule, $scope.classifyFilter)[0] : item.childrenModule[0];
                        var index = item.childrenModule.indexOf(temp);
                        item.childrenModule[index].focused = true;
                        $state.go('resourcectrl.'+$scope.status.path+'.resource', {
                            'materialtypeid': $state.params.materialtypeid || temp.MATERIALTYPEID,
                            "topclassifyid": temp.MATERIALTYPEID,
                        });
                        $scope.$emit("queryPicNavClassify", temp.MATERIALTYPEID); //通知左侧刷新列表
                    }
                });
            }
            /**
             * [changeType description]切换一级分类
             * @param  {[obj]} item  [description]分类信息
             * @return {[type]}      [description]
             */
            $scope.changeType = function(item) {
                item.focused = true;
                $state.go('resourcectrl.'+$scope.status.path+'.resource', {
                    'materialtypeid': item.MATERIALTYPEID,
                    'parentid': null,
                    'topclassifyid': item.MATERIALTYPEID
                });
                $scope.$emit("queryPicNavClassify", item.MATERIALTYPEID); //通知左侧刷新列表
            };
        }
    ]);
