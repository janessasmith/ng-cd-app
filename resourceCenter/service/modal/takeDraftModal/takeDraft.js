"use strict";
/**
 *  Module 取稿模块，
 *
 * Description 必须参数：items:已选文档列表；basicParams:基础参数包括channelname,nodeid,typename
 */
angular.module('takeDraftModule', []).controller('fullTakeDraftCtrl', ['$scope', '$q', '$filter', '$timeout', '$window', '$state', '$modalInstance', 'trsspliceString', 'trsHttpService', 'basicParams', 'isOnlyOne', 'trsconfirm', 'editingCenterService', "trsColumnTreeLocationService", "isNewMedia",
    function($scope, $q, $filter, $timeout, $window, $state, $modalInstance, trsspliceString, trsHttpService, basicParams, isOnlyOne, trsconfirm, editingCenterService, trsColumnTreeLocationService, isNewMedia) {
        initStatus();
        initData();

        function initStatus() {
            $scope.status = {
                selectedMedia: {},
                isTitleMoreShow: false,
                iwo: {
                    selectedItem: {
                        key: "iwo",
                        value: "i我",
                        type: "iwo"
                    }
                },
                staticMediaType: {
                    app: 1,
                    website: 2,
                    newspaper: 3,
                    weixin: 4,
                    weibo: 5,
                    scapp: ""
                },
                editParams: {
                    metadataid: "",
                    chnldocid: "",
                    status: 0,
                    siteid: "",
                    channelid: "",
                    platform: 0,
                    doctype: ""
                },
                editState: {
                    iwo: {
                        1: "iwonews",
                        2: "iwoatlas",

                    },
                    Paper: {
                        1: "newspapertext",
                        2: "newspaperpic",

                    },
                    Web: {
                        1: "websitenews",
                        2: "websiteatlas",

                    },
                    MlfApp: {
                        1: "appnews",
                        2: "appatlas",
                    },
                    WeChat: {
                        1: "wxnews",
                    }
                },
                accessAuthority: {
                    iwo: true,
                    weixin: false,
                    app: false,
                    scapp: false,
                    website: false,
                    newspaper: false
                },
                isNewMedia: !!isNewMedia,

            };
            $scope.data = {
                isOnlyOne: "",
                selectedChannel: [],
                newspaper: {
                    paper: {
                        items: [],
                        selectedItem: {},
                    },
                    dieci: {
                        selectedItem: {},
                    },
                    banmian: {
                        selectedItem: {},
                    },
                    PaperPubDate: ""
                },
                website: {
                    items: [],
                    selectedItem: {},
                    selectedNode: {},
                },
                app: { //媒立方APP
                    items: [],
                    selectedItem: {},
                    selectedNode: {},
                },
                weixin: {
                    items: [],
                    selectedNode: {},
                },
                scapp: { //数采APP
                    items: [],
                    selectedItem: {},
                    selectedNode: {},
                    type: {
                        normal: "频道",
                        local: "地市"
                    }

                },
                result: {
                    toMy: false,
                    Web: [],
                    Paper: [],
                    App: [], //数采APP
                    MlfApp: [], //媒立方APP
                    WeChat: []
                },
                mediasArray: [{ //全部渠道
                    mediaName: "I我",
                    mediaValue: "iwo",
                }, {
                    mediaName: "纸媒",
                    mediaValue: "newspaper",
                }, {
                    mediaName: "网站",
                    mediaValue: "website",
                }, {
                    mediaName: "APP",
                    mediaValue: "app",
                }, {
                    mediaName: "微信",
                    mediaValue: "weixin",
                }],
                newMediasArray: [{ //新媒体渠道
                    mediaName: "网站",
                    mediaValue: "website",
                }, {
                    mediaName: "APP",
                    mediaValue: "app",
                }, {
                    mediaName: "微信",
                    mediaValue: "weixin",
                }]
            };
            $scope.status.mediasArray = $scope.status.isNewMedia ? $scope.data.newMediasArray : $scope.data.mediasArray;
            //网站、app树配置开始
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
                    labelSelected: "take-draft-tree-label-sel"
                },
                isLeaf: function(node) {
                    return node.HASCHILDREN === "false"; //node.CHILDREN == undefined && node.CHANNELID != undefined;
                }
            };
            //数采app树配置开始
            $scope.appTreeOptions = {
                nodeChildren: "ZONE_COLUMNS",
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
                    labelSelected: "take-draft-tree-label-sel",
                },
                isLeaf: function(node) {
                    return node.ZONE_COLUMNS == undefined;
                }
            };
        }
        /**
         * [getAccessAuthority description]判断渠道下权限
         * @return {[type]} [description]
         */
        function getAccessAuthority() {
            var deferred = $q.defer();
            editingCenterService.getPermissions().then(function(data) {
                loop: for (var i in data) {
                    $scope.status.accessAuthority[i] = true;
                }
                $scope.status.accessAuthority.scapp = $scope.status.accessAuthority.app;
                deferred.resolve($scope.status.accessAuthority);
                if ($scope.status.isNewMedia) {//如果是新媒体渠道请求默认渠道
                    var temp = $scope.status.selectedMedia.mediaValue.replace(/(\w)/, function(v) {
                        return v.toUpperCase();
                    }); //首字母大写
                    eval("query" + temp + "()");
                }
            });
            return deferred.promise;
        }

        function initData() {
            $scope.status.selectedMedia = $scope.status.mediasArray[0];
            $scope.data.isOnlyOne = isOnlyOne;
            getSystemTime();
            getAccessAuthority();
        }
        //关闭窗口
        $scope.close = function() {
            $modalInstance.dismiss();
        };
        //展开子树
        $scope.showToggle = function(node) {
            if (node.HASCHILDREN === "false" || (angular.isDefined(node.CHILDREN) && node.CHILDREN.length > 0))
                return;
            var params = {
                serviceid: "mlf_mediasite",
                methodname: "queryClassifyByChnl",
                ChannelId: node.CHANNELID,
            };
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get")
                .then(function(data) {
                    node.CHILDREN = data.CHILDREN;
                });
        };
        /**
         * [getSystemTime description]查询当前系统时间
         */
        function getSystemTime() {
            var params = {
                serviceid: "mlf_fusion",
                methodname: "getServiceTime"
            };
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function(data) {
                var timeStamp = (data.LASTOPERTIME).replace(/-/g, "/");
                var PaperPubDate = new Date(Date.parse(timeStamp));
                PaperPubDate = PaperPubDate.setDate(PaperPubDate.getDate() + 1);
                $scope.data.newspaper.PaperPubDate = PaperPubDate; //PaperPubDate.getFullYear() + "-" + (PaperPubDate.getMonth() + 1) + "-" + (PaperPubDate.getDate()+1);//$filter('date')(timeStampAfter, "yyyy-MM-dd").toString();
            });
        }
        /**
         * [setCurrMedia description]点击渠道加载对应数据
         * @param {[type]} item [description]
         */
        $scope.setCurrMedia = function(item) {
            $scope.status.selectedMedia = item;
            var temp = item.mediaValue.replace(/(\w)/, function(v) {
                return v.toUpperCase();
            }); //首字母大写
            eval("query" + temp + "()");
            //if (item.mediaValue === "newspaper" && $scope.data.newspaper.paper.items.length === 0) queryNewspaper();
        };

        function queryIwo() {}
        /**
         * [queryNewspaper description]获取报纸列表
         * @return {[type]} [description]
         */
        function queryNewspaper() {
            var params = {
                "serviceid": "mlf_paper",
                "methodname": "queryPagers"
            };
            if ($scope.data.newspaper.paper.items.length > 0) return;
            $scope.loadingNewspaper = trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function(data) {
                $scope.data.newspaper.paper.items = data;
                queryNewspaperDieci(data[0]);

            });
        }

        /**
         * [queryNewspaperDieci description] 查询制定报纸叠次
         * @param  {[type]} item [description] 报纸
         * @return {[type]}      [description]
         */
        $scope.queryNewspaperDieci = function(item) {
            queryNewspaperDieci(item);
        };
        /**
         * [queryNewspaperDieci description] 查询制定报纸叠次具体方法
         * @param  {[type]} item [description] 报纸
         * @return {[type]}      [description]
         */
        function queryNewspaperDieci(item) {
            $scope.data.newspaper.paper.selectedItem = item;
            var params = {
                "serviceid": "mlf_paper",
                "methodname": "queryDieCis",
                "PaperId": item.SITEID
            };
            if (!!item.CHILDREN) {
                $scope.data.newspaper.dieci.selectedItem = item.CHILDREN[0];
                return;
            }
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function(data) {
                item.CHILDREN = data;
                $scope.data.newspaper.dieci.selectedItem = data[0];
                queryNewspaperBanmian($scope.data.newspaper.dieci.selectedItem);
            });
        }
        /**
         *[getSuggestions description]搜索栏目
         * @param  {[type]}channelname  [description] 输入栏目名称
         * return {[type]}   null  [description]
         */
        var promise;
        $scope.getSuggestions = function(channelName, type) {
            if (channelName === "")
                return;
            if (promise) {
                $timeout.cancel(promise);
                promise = null;
            }
            var siteid = type == 'website' ? $scope.data.website.selectedItem.SITEID : $scope.data.app.selectedItem.SITEID;
            promise = $timeout(function() {
                var params = {
                    serviceid: "mlf_mediasite",
                    methodname: "queryRightClassifyByName",
                    ChannelName: channelName,
                    SiteId: siteid
                };
                return trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get")
                    .then(function(data) {
                        return data;
                    });
            }, 500);
            return promise;
        };
        $scope.$watch("data.channelFilter", function(newValue, oldValue) {
            if (angular.isObject(newValue)) {
                //初始化树数据
                queryWebsiteTreeBySiteid();
                //清空树展开
                $scope.webExpandedTest = [];
                //重新定位树展开位置
                //getPositionData(newValue.CHANNELID);
                trsColumnTreeLocationService.columnTreeLocation(
                    newValue.CHANNELID,
                    $scope.data.website.selectedItem.TREE,
                    $scope.data.website.selectedNode,
                    $scope.webExpandedTest,
                    function(tree, array, selectedNode) {
                        delete $scope.data.website.selectedItem.TREE;
                        $scope.data.website.selectedItem.TREE = tree;
                        $scope.data.website.selectedNode = selectedNode;
                        $scope.addWebSiteToSelectedChnl($scope.data.website.selectedNode);
                    });
            }
        });
        $scope.$watch("data.appChannelFilter", function(newValue, oldValue) {
            if (angular.isObject(newValue)) {
                //初始化树数据
                queryAppTreeBySiteid();
                //清空树展开
                $scope.appExpandedTest = [];
                //重新定位树展开位置
                //getPositionData(newValue.CHANNELID);
                trsColumnTreeLocationService.columnTreeLocation(
                    newValue.CHANNELID,
                    $scope.data.app.selectedItem.TREE,
                    $scope.data.app.selectedNode,
                    $scope.appExpandedTest,
                    function(tree, array, selectedNode) {
                        delete $scope.data.app.selectedItem.TREE;
                        $scope.data.app.selectedItem.TREE = tree;
                        $scope.data.app.selectedNode = selectedNode;
                        $scope.addAppToSelectedChnl($scope.data.app.selectedNode);
                    });
            }
        });
        /**
         * [queryNewspaperBanmian description] 查询报纸的版面
         * @param  {[type]} item [description] 叠次
         * @return {[type]}      [description]
         */
        $scope.queryNewspaperBanmian = function(item) {
            queryNewspaperBanmian(item);
        };
        /**
         * [queryNewspaperBanmian description] 查询报纸的版面具体方法
         * @param  {[type]} item [description] 叠次
         * @return {[type]}      [description]
         */
        function queryNewspaperBanmian(item) {
            $scope.data.newspaper.dieci.selectedItem = item;
            var params = {
                "serviceid": "mlf_paper",
                "methodname": "queryCaiBianBanMians",
                "PaperId": $scope.data.newspaper.paper.selectedItem.SITEID,
                "DieCiId": item.CHANNELID
            };
            if (!!item.CHILDREN) {
                return;
            }
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function(data) {
                item.CHILDREN = data;
            });
        }
        /**
         * [setNewspaperBanmianStatus description]报纸栏目选择后加入到已选 
         * @param {[type]} item [description]
         */
        $scope.setNewspaperBanmianStatus = function(item) {
            $scope.data.newspaper.banmian.selectedItem = item;
            var site = $scope.data.newspaper.paper.selectedItem;
            var newspaperPath = $scope.status.mediasArray[1].mediaName + ">" + site.SITEDESC + ">" + $scope.data.newspaper.dieci.selectedItem.CHNLDESC + ">" + item.CHNLDESC;
            var newspaperSelected = {
                key: site.SITEID,
                value: newspaperPath,
                type: "Paper",
                id: item.CHANNELID
            };
            refreshSelectedChnl(newspaperSelected, item.CHANNELID);
        };

        $scope.queryTreeBySite = function(item) {
            $scope.data.website.selectedItem = item[0].CHILDREN;
            queryTreeBySite();
        };

        function queryTreeBySite() {
            var params = {
                'serviceid': "mlf_websiteconfig",
                'methodname': "queryClassifyBySite",
                'SiteId': $scope.data.website.selectedItem.SITEID
            };
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, 'post').then(function(data) {
                $scope.data.website.treeData = [data];
            });
        }
        /**
         * [changeRadioStatus description]切换iwo取稿到个人稿库选中状态并加入到已选集合
         * @return {[type]} [description]
         */
        $scope.changeRadioStatus = function() {
            var index = $scope.data.selectedChannel.indexOf($scope.status.iwo.selectedItem);
            if (index < 0) {
                $scope.data.selectedChannel.push($scope.status.iwo.selectedItem);
            } else {
                return;
            }
            $scope.data.result.toMy = !$scope.data.result.toMy;
        };
        $scope.determineItemInSelectedChnl = function(key) {
            return queryIndexInSelectedChnl(key) > -1 ? true : false;
        };
        /**
         * [queryIndexInSelectedChnl description]按照key 查询已选结合中下标[{key:'',value:''}]
         * @param  {[type]} key [description] key
         * @return {[type]}     [description]
         */
        function queryIndexInSelectedChnl(key) {
            for (var i in $scope.data.selectedChannel) {
                if ($scope.data.selectedChannel[i].key == key) return i;
            }
            return -1;
        }
        /**
         * [refreshSelectedChnl description]更新已选栏目，寻找该KEY，如果找到则替换value,没有找到则加入,同时更新对应渠道ID
         * @param  {[type]} value [description] value
         */
        function refreshSelectedChnl(item, id) {

            /*// var typeIndex = queryIndexInSelectedChnl(item.key);
        // var resultIndex = $scope.data.result[item.type].indexOf(id);
       //f (index > -1) {
            //$scope.data.selectedChannel.splice(index, 1);
            // $scope.data.result[item.type].splice(resultIndex, 1);
        } else {
            //$scope.data.selectedChannel.splice(typeIndex, 1);
            $scope.data.selectedChannel.push(item);
            $scope.data.website.items.push(item);
            //$scope.data.result[item.type].push(id);
        }*/
            /*********************************YOU*************************************/
            // var index = queryIndexInSelectedChnl(item.key),
            //     idIndex = $scope.data.result[item.type].indexOf(id);
            // if (index > -1) {
            //     if ($scope.data.selectedChannel[index].value == item.value) {
            //         $scope.data.selectedChannel.splice(index, 1);
            //         $scope.data.result[item.type].splice(idIndex, 1);
            //     } else {
            //         $scope.data.selectedChannel[index].value = item.value;
            //         $scope.data.result[item.type][idIndex] = id;
            //     }
            // } else {
            //     $scope.data.selectedChannel.push(item);
            //     $scope.data.result[item.type].push(id);

            // }
            var index = queryIndexInSelectedChnl(item.key),
                idIndex = $scope.data.result[item.type].indexOf(id);
            if (index > -1) {
                if ($scope.data.selectedChannel[index].value == item.value) return;
                $scope.data.selectedChannel[index].value = item.value;
                $scope.data.selectedChannel[index].id = item.id;
                // $scope.data.result[item.type][idIndex] = id;
            } else {
                $scope.data.selectedChannel.push(item);
                // $scope.data.result[item.type].push(id);

            }
            // updateResult(item, id);
        }
        /**
         * [updateResult description] 更新已选的ID
         * @param  {[type]} item [description] item.type是哪个平台
         * @param  {[type]} id   [description] 已选栏目ID
         */
        function updateResult(item, id) {
            var ids = $scope.data.result[item.type];
            var index = ids.indexOf(id);
            if (index > -1)
                ids.splice(index, 1);
            else {
                ids.push(id);
            }
        }
        /**
         * [removeIwoChanel description]从已选结集合中删除改对象
         * @param  {[type]} index [description] 在结合中的下标
         * @return {[type]}       [description]
         */
        $scope.removeIwoChanel = function(index) {
            if ($scope.data.selectedChannel[index].key == "iwo") $scope.data.result.toMy = false;
            $scope.data.selectedChannel.splice(index, 1);

        };


        /**
         * [queryWebsite description]查询网站站点列表
         * @return {[type]} [description]
         */
        function queryWebsite() {
            if ($scope.data.website.items.length > 0) return;
            var params = {
                serviceid: 'mlf_mediasite',
                methodname: 'queryWebSitesByMediaType',
                MediaType: $scope.status.staticMediaType.website,
            };
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "post").then(function(data) {
                $scope.data.website.items = data.DATA;
                $scope.data.website.selectedItem = data.DATA[0];
                setSelectedWebsite(data.DATA[0]);
            });
        }
        /**
         * [queryApp description]查询APP站点列表
         * @return {[type]} [description]
         */
        function queryApp() {
            if ($scope.data.app.items.length > 0) return;
            var params = {
                serviceid: 'mlf_mediasite',
                methodname: 'queryWebSitesByMediaType',
                MediaType: $scope.status.staticMediaType.app,
            };
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "post").then(function(data) {
                $scope.data.app.items = data.DATA;
                $scope.data.app.selectedItem = data.DATA[0];
                queryAppTreeBySiteid();
            });
        }
        /**
         * [queryApp description]查询微信站点列表
         * @return {[type]} [description]
         */
        function queryWeixin() {
            if ($scope.data.weixin.items.length > 0) return;
            var params = {
                serviceid: 'mlf_mediasite',
                methodname: 'queryWebSitesByMediaType',
                MediaType: $scope.status.staticMediaType.weixin,
            };
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "post").then(function(data) {
                $scope.data.weixin.items = data.DATA;
            });
        }

        /**
         * [setSelectedApp description] 选择APP内的站点
         * @param {[type]} item [description]
         */
        $scope.setSelectedApp = function(item) {
            $scope.data.app.selectedItem = item;
            queryAppTreeBySiteid();
        };

        function queryAppTreeBySiteid() {
            if (!!$scope.data.app.selectedItem.TREE) return;
            var params = {
                'serviceid': "mlf_mediasite",
                'methodname': "queryClassifyBySite",
                'SiteId': $scope.data.app.selectedItem.SITEID
            };
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, 'post').then(function(data) {
                $scope.data.app.selectedItem.TREE = data;

            });
        }
        /**
         * [setSelectedWebsite description]选择网站内的站点
         * @param {[type]} item [description]
         */
        $scope.setSelectedWebsite = function(item) {
            setSelectedWebsite(item);
        };
        /**
         * [setSelectedWebsite description]选择网站内的站点实体方法
         * @param {[type]} item [description]
         */
        function setSelectedWebsite(item) {
            $scope.data.website.selectedItem = item;
            queryWebsiteTreeBySiteid();
        }
        /**
         * [queryWebsiteTreeBySiteid description]查询当前已选站点的栏目树
         * @return {[type]} [description]
         */
        function queryWebsiteTreeBySiteid() {
            if (!!$scope.data.website.selectedItem.TREE) return;
            var params = {
                'serviceid': "mlf_mediasite",
                'methodname': "queryClassifyBySite",
                'SiteId': $scope.data.website.selectedItem.SITEID
            };
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, 'post').then(function(data) {
                $scope.data.website.selectedItem.TREE = data;

            });
        }
        /**
         * [addWebSiteToSelectedChnl description]点击网站栏目节点，刷新已选栏目集合
         * @param {[type]} node [description]
         */
        $scope.addWebSiteToSelectedChnl = function(node) {
            if (!node.CHNLDESC) return false;
            //$scope.data.website.selectedNode[node.SITEID] = node;
            var websitePath = {
                key: node.SITEID,
                value: $scope.status.mediasArray[2].mediaName + ">" + $scope.data.website.selectedItem.SITEDESC + ">" + node.CHNLDESC,
                type: 'Web',
                id: node.CHANNELID
            };
            refreshSelectedChnl(websitePath, node.CHANNELID);
        };
        /**
         * [addAppToSelectedChnl description]点击App栏目节点，刷新已选栏目集合
         * @param {[type]} node [description]
         */
        $scope.addAppToSelectedChnl = function(node) {
            if (!node.CHNLDESC || node.ISAPP == 'false') return false; //如果是非app栏目（比如官员栏目）不可以取稿
            //$scope.data.app.selectedNode[node.SITEID] = node;
            var appPath = {
                key: node.SITEID,
                type: 'MlfApp',
                id: node.CHANNELID
            };
            var app = $scope.status.isNewMedia ? $scope.status.mediasArray[1] : $scope.status.mediasArray[3];
            appPath.value = app.mediaName + ">" + $scope.data.app.selectedItem.SITEDESC + ">" + node.CHNLDESC;
            refreshSelectedChnl(appPath, node.CHANNELID);
        };
        /**
         * [addAppToSelectedChnl description]点击App栏目节点，刷新已选栏目集合
         * @param {[type]} node [description]
         */
        $scope.addWeixinToSelectedChnl = function(node) {
            $scope.data.weixin.selectedNode = node;
            if (!node.CHNLDESC) return false;
            //$scope.data.weixin.selectedNode[node.SITEID] = node;
            var weixinPath = {
                key: "weixin",
                type: 'WeChat',
                id: node.CHANNELID
            };
            var weixin = $scope.status.isNewMedia ? $scope.status.mediasArray[2] : $scope.status.mediasArray[4];
            weixinPath.value = weixin.mediaName + ">" + node.CHNLDESC;
            refreshSelectedChnl(weixinPath, node.CHANNELID);
        };
        /**
         * [queryScapp description]查询数采APP栏目树，并构造左侧列表
         * @return {[type]} [description]
         */
        function queryScapp() {
            var params = {
                'serviceid': "mlf_appexchange",
                'methodname': "getColumns"
            };
            if ($scope.data.scapp.items.length > 0) return;
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function(data) {
                for (var i in data) {
                    data[i].NAME = $scope.data.scapp.type[data[i].COLUMN_TYPE];
                }
                $scope.data.scapp.items = data;
                $scope.data.scapp.selectedItem = data[0];
            });
        }
        /**
         * [setScappSelectedItem description]左侧切换
         * @param {[type]} item [description]
         */
        $scope.setScappSelectedItem = function(item) {
            $scope.data.scapp.selectedItem = item;
        };
        $scope.addScappToSelectedChnl = function(node) {
            var tempItem = $scope.data.scapp.selectedItem;
            $scope.data.scapp.selectedNode = node;
            var scappPath = {
                key: "scapp",
                value: "数采APP>" + tempItem.NAME + ">" + (node.NAME ? node.NAME : node.ZONE_NAME),
                type: "App",
                id: node.ID
            };
            refreshSelectedChnl(scappPath, node.ID);
        };
        $scope.editLater = function() {
            saveDraft().then(function() {
                $scope.loadingPromise = trsconfirm.alertType("取稿成功！", "", "success", false, function() {
                    $modalInstance.close();
                });
            });
        };
        $scope.editNow = function() {
            saveDraft().then(function(data) {
                setEditParams(data);
                previewNewspaper(data);
                /*if ($scope.data.selectedChannel[0].type === "Paper") previewNewspaper();
                $state.go($scope.status.editState[$scope.data.selectedChannel[0].type], $scope.dtatus.editParams);*/
            });

        };

        function setEditParams(data) {
            $scope.status.editParams.chnldocid = data.REPORTS[0].CHNLDOCID;
            if ($scope.data.selectedChannel[0].type == "Web") {
                $scope.status.editParams.channelid = $scope.data.website.selectedNode.CHANNELID;
            } else if ($scope.data.selectedChannel[0].type == "MlfApp") {
                $scope.status.editParams.channelid = $scope.data.app.selectedNode.CHANNELID;
            } else if ($scope.data.selectedChannel[0].type == "WeChat") {
                $scope.status.editParams.channelid = $scope.data.weixin.selectedNode.CHANNELID;
            } else {
                $scope.status.editParams.channelid = 0;
            }
            //$scope.status.editParams.channelid = $scope.data.selectedChannel[0].type == "Web" ? $scope.data.website.selectedNode.CHANNELID : 0;
            // $scope.status.editParams.channelid = $scope.data.selectedChannel[0].type == "Web" ? $scope.data.website.selectedNode[$scope.data.selectedChannel[0].key].CHANNELID : 0;
            $scope.status.editParams.metadataid = data.REPORTS[0].METADATAID;
            $scope.status.editParams.metadata = data.REPORTS[0].METADATAID;
            $scope.status.editParams.doctype = data.REPORTS[0].DOCTYPE - 1;
            $scope.status.editParams.siteid = $scope.data.selectedChannel[0].key;
            $scope.status.editParams.paperid = $scope.data.selectedChannel[0].key;
        }

        function previewNewspaper(result) {
            var params = {
                serviceid: "mlf_paperset",
                methodname: "findPaperById",
                SiteId: $scope.data.newspaper.paper.selectedItem.SITEID
            };
            if (!$scope.data.newspaper.paper.selectedItem.SITEID) {
                $window.open($state.href($scope.status.editState[$scope.data.selectedChannel[0].type][result.REPORTS[0].DOCTYPE], $scope.status.editParams), '_blank');

                //$state.go($scope.status.editState[$scope.data.selectedChannel[0].type][result.REPORTS[0].DOCTYPE], $scope.status.editParams);
                $modalInstance.close();
            } else {
                trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function(data) {
                    $scope.status.editParams.newspapertype = data.ISDUOJISHEN == '0' ? 2 : 1;
                    $window.open($state.href($scope.status.editState[$scope.data.selectedChannel[0].type][result.REPORTS[0].DOCTYPE], $scope.status.editParams), '_blank');
                    //$state.go($scope.status.editState[$scope.data.selectedChannel[0].type][result.REPORTS[0].DOCTYPE], $scope.status.editParams);
                    $modalInstance.close();
                });
            }
        }
        //保存
        function saveDraft() {
            var deferred = $q.defer();
            var pubDate = new Date($scope.data.newspaper.PaperPubDate);
            pubDate = pubDate.getFullYear() + "-" + (pubDate.getMonth() + 1) + "-" + pubDate.getDate();
            var params = {
                'PaperPubDate': pubDate
            };
            params = angular.extend(params, basicParams);
            params = angular.extend(params, arrangeParams());
            $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "post").then(function(data) {
                deferred.resolve(data);
            }, function() {
                $modalInstance.dismiss();
            });
            return deferred.promise;
        }
        //把选择数组转换成参数
        function arrangeParams() {
            var params = {
                "ToMy": false,
                "Paper": [],
                "Web": [],
                "App": [],
                "MlfApp": [],
                "WeChat": []
            };
            angular.forEach($scope.data.selectedChannel, function(value, key) {
                if (value.type == 'iwo') {
                    params.ToMy = true;
                } else {
                    params[value.type].push(value.id);
                }
            });
            for (var i in params) {
                if (angular.isArray(params[i])) params[i] = params[i] + "";
            }
            return params;
        }
    }
]);
