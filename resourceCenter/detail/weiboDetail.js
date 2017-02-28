/**
 * Author:XCL
 *
 * Time:2016-01-24
 */
"use strict";
angular.module('resourceCenterWeiboDetailModule', [])
    .controller('resourceCenterWeiboDetailCtrl', ['$scope', '$compile', '$location', '$q', '$sce', '$stateParams', '$window', '$filter', 'trsHttpService', 'resourceCenterService', 'editNewspaperService', 'trsconfirm', 'resCtrModalService', 'storageListenerService', "trsPrintService", "ueditorService",
        function($scope, $compile, $location, $q, $sce, $stateParams, $window, $filter, trsHttpService, resourceCenterService, editNewspaperService, trsconfirm, resCtrModalService, storageListenerService, trsPrintService, ueditorService) {
            var serviceid, guid = $stateParams.guid,
                channelName = $stateParams.channel;
            initStatus();
            initData();

            function initStatus() {
                //判断是否有频道名称
                if ($stateParams.channel) {
                    serviceid = $stateParams.service;
                } else {
                    serviceid = 'jtcpg';
                }
                $scope.params = {
                    "serviceid": serviceid,
                    "modelid": "detailData",
                    "guid": guid,
                    "channelName": channelName,
                    "typeid": "zyzx",
                    "indexName": $stateParams.indexname,
                };
                $scope.status = {
                    "currSite": "",
                    "firstRelatedManuscriptKey": "",
                    "initBtn": true,
                    "isAllManuShow": false,
                    "isExtraFieldsShow": false,
                    "isReprintShow": false,
                    "isEnterWebsite": false,
                    "isEnterApp": false,
                    "isShowWeiboBig": false,
                    "isWeibo": $stateParams.channel == "wb" ? true : false,
                };
                $scope.data = {
                    weiboSImg: [],
                    weiboMImg: [],
                    weiboLImg: [],
                };
                $scope.status.isProducttype = angular.isDefined($stateParams.indexname) ? true : false;
                $scope.relatedManuscripts = [];
            }

            //初始化数据
            function initData() {
                // if (channelName == "gxgk") {
                //     resourceCenterService.getNewsDoc({
                //         "MetaDataId": guid
                //     }).then(function(item) {
                //         var arr = [];
                //         for (var name in item.METALOGOURL) {
                //             var imgs = item.METALOGOURL[name].split(",");
                //             for (var i = 0; i < imgs.length; i++) {
                //                 arr.push(imgs[i]);
                //             }
                //         }
                //         $scope.detailInfos = {
                //             "DOCTITLE": item.TITLE,
                //             "DOCAUTHOR": item.SIGNATUREAUTHOR,
                //             "ZB_SOURCE_SITE": item.NEWSSOURCES,
                //             "ZB_KEYWORDS5_CHAR": item.KEYWORDS,
                //             "DOCPUBTIME": item.CRTIME,
                //             "CONTENT": item.CONTENT,
                //             "ImgsUrl": arr,
                //             "HTMLCONTENT": item.HTMLCONTENT
                //         };
                //         $scope.isGxgkContent = angular.isDefined($scope.detailInfos.HTMLCONTENT) ? true : false;
                //         $scope.detailInfos.HTMLCONTENT = $sce.trustAsHtml($scope.detailInfos.HTMLCONTENT);
                //     });
                // } else {
                $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), $scope.params, "post").then(function(data) {
                    if (data && data.content) {
                        var areaname = $location.search().areaname;
                        //当稿件来自新华社稿时将图片放在文字上方
                        changePicPosition(data);

                        $scope.items = data.summary_info.hybaseField;
                        // $scope.indexName = data.summary_info.indexName;
                        $scope.detailIndexname = data.summary_info.indexName;
                        $scope.detailInfos = data.content[0];
                        /*微博特殊处理*/
                        if ($scope.status.isWeibo) dealWeiboData();
                        /*微博特殊处理*/
                        //$scope.detailInfos.CONTENT = $scope.detailInfos.CONTENT.replace(/ /g, '　');
                        $scope.detailInfos.CONTENT = ueditorService.replaceHtmlBlank($scope.detailInfos.CONTENT); //将html正文中的半角空格换成全角空格
                        $scope.detailInfos.CONTENT = $scope.detailInfos.CONTENT.replace(/(<(?:p|div)[^>]*>(?:<(?:span|b)[^>]*>)*)(?:&nbsp;| |　)*/ig, "$1　　").replace(/(<br[^>]*>)(?:&nbsp;| |　)*/ig, "$1　　").replace(/>　　</g, "\>\<").replace(/style="[^>]*"/g, "");
                        $scope.detailInfos.CONTENT = data.content[0] && $sce.trustAsHtml($scope.detailInfos.CONTENT);
                        if (angular.isDefined($scope.detailInfos.ZB_AREA_LIST_CN)) $scope.detailInfos.ZB_AREA_LIST_CN = $scope.detailInfos.ZB_AREA_LIST_CN.replace(/;/g, " ");
                        if (angular.isDefined(areaname)) {
                            $scope.detailInfos.ZB_AREA_LIST_CN = $sce.trustAsHtml($scope.detailInfos.ZB_AREA_LIST_CN.replace(new RegExp(areaname, "g"), "<font color='red'>" + areaname + "</font>"));
                        };
                        $scope.keywords = data.content[0].ZB_KEYWORDS5_CHAR;
                        if (!$scope.status.isWeibo) document.title = data.content[0].DOCTITLE;
                        startSimilarSearch();
                    }
                });
                //}
                //初始化取签见撤重
                initQqjccInfos();

                //成品稿、网站、微信、app稿件显示栏目和源地址字段
                showExtraFields();
                //网站，APP显示转载地址
                showReprint();
                //进入了网站
                showEnterWebsite();
                //进入了APP
                showEnterApp();
            }
            //当稿件来自新华社稿时将图片放在文字上方
            function changePicPosition(data) {
                if (data.content[0] && $stateParams.channel == "xhsg") {
                    var img = "",
                        content = angular.copy(data.content[0].CONTENT);
                    data.content[0].CONTENT = data.content[0].CONTENT.substring(0, data.content[0].CONTENT.indexOf('<div align="center"><img'));
                    img = content.substring(content.indexOf('<div align="center"><img'));
                    data.content[0].CONTENT = img + data.content[0].CONTENT;
                }
            };
            //开启相似查询方法
            function startSimilarSearch() {
                var params = {
                    "guid": guid,
                    "modelid": "start",
                    "serviceId": "detailData",
                    "keywords": $scope.keywords,
                    "typeid": "zyzx",
                    "INDEXNAME": $stateParams.indexname
                };
                trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), params, "post").then(function(data) {
                    var searchId = data.searchId;
                    fetchSimilarResults(searchId);
                    //获取相似查询结果
                    // var params = {
                    //     "modelid": "fetch",
                    //     "searchId": data.searchId,
                    //     "typeid": "zyzx",
                    //     "serviceId": "detailData",
                    //     "guid": guid,
                    //     "keywords": $scope.keywords
                    // };
                    // trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), params, "post").then(function(data) {
                    //     if (data.isDone === true) {
                    //         $scope.relatedManuscripts = data.result;
                    //         var arr = [];
                    //         angular.forEach(data.result, function(value, key) {
                    //             if (angular.isDefined(value.resultSize) && value.resultSize !== 0) {
                    //                 arr.push(value);
                    //             } else {
                    //                 return;
                    //             }
                    //             $scope.status.isAllManuShow = data.result.indexOf(key).resultSize !== 0 ? true : false;
                    //         });
                    //         $scope.status.firstRelatedManuscriptKey = arr[0].key;
                    //         getRelatedManuscript();
                    //     } else {
                    //         console.log(false);
                    //     }
                    // });
                });
            }

            //获取相似查询结果的方法
            function fetchSimilarResults(id) {
                var params = {
                    "modelid": "fetch",
                    "searchId": id,
                    "typeid": "zyzx",
                    "serviceId": "detailData",
                    "guid": guid,
                    "keywords": $scope.keywords
                };
                trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), params, "post").then(function(data) {
                    $scope.relatedManuscripts = $scope.relatedManuscripts.concat(data.result);
                    if (data.isDone === false) {
                        fetchSimilarResults(id);
                    } else {
                        var arr = [];
                        angular.forEach($scope.relatedManuscripts, function(value, key) {
                            if (angular.isDefined(value.resultSize) && value.resultSize !== 0) {
                                arr.push(value);
                            } else {
                                return;
                            }
                            $scope.status.isAllManuShow = data.result.indexOf(key).resultSize !== 0 ? true : false;
                        });
                        $scope.status.firstRelatedManuscriptKey = arr.length > 0 ? arr[0].key : $scope.status.firstRelatedManuscriptKey;
                        getRelatedManuscript();
                    }
                });
            }

            //显示相关稿件内容
            $scope.showRelatedManuscript = function(item) {
                var params = {
                    "modelid": "findFromNavigation",
                    "typeid": "zyzx",
                    "serviceid": item,
                    "channelName": item,
                    //"typeName": "field",
                    "pageSize": 6,
                    "pageNum": 1,
                    "keyword": {
                        'detail': $scope.keywords,
                        'guid': $stateParams.guid
                    }
                };
                //JSON.stringify:将json对象转换成字符串
                params.keyword = JSON.stringify(params.keyword);
                trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), params, "post").then(function(data) {
                    $scope.relatedManuLists = data.content;
                    $scope.indexname = data.summary_info.indexName;
                });
            };

            //初始化相关稿件内容方法
            function getRelatedManuscript() {
                if ($scope.status.firstRelatedManuscriptKey === "") return;
                var params = {
                    "modelid": "findFromNavigation",
                    "typeid": "zyzx",
                    "serviceid": $scope.status.firstRelatedManuscriptKey,
                    "channelName": $scope.status.firstRelatedManuscriptKey,
                    "pageSize": 6,
                    "pageNum": 1,
                    "keyword": {
                        'detail': $scope.keywords,
                        'guid': $stateParams.guid
                    }
                };
                //JSON.stringify:将json对象转换成字符串
                params.keyword = JSON.stringify(params.keyword);
                trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), params, "post").then(function(data) {
                    $scope.relatedManuLists = data.content;
                    $scope.indexname = data.summary_info.indexName;
                });
            }

            //初始化取签见撤重信息
            function initQqjccInfos() {
                var params = {
                    "serviceid": "mlf_bigdataexchange",
                    "methodname": "queryFlagList",
                    "guid": $stateParams.guid
                };
                trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "post").then(function(data) {
                    $scope.qqjccInfos = data;
                });
            }

            //资源中心的成品稿、网站、微信、app,策划中心的近期政策、网站监控、微信监控、app监控,稿件显示栏目和源地址字段
            function showExtraFields() {
                var firstFiledOfIndexname = "";
                if (angular.isDefined($stateParams.indexname)) {
                    firstFiledOfIndexname = $stateParams.indexname.split("_")[0];
                }
                if (channelName == "jtcpg" || channelName == "wz" || channelName == "wx" || channelName == "app" || firstFiledOfIndexname == "website" || firstFiledOfIndexname == "weixin" || firstFiledOfIndexname == "app") {
                    $scope.status.isExtraFieldsShow = true;
                } else {
                    $scope.status.isExtraFieldsShow = false;
                }
            }
            //网站、app,显示该字段
            function showReprint() {
                var firstFiledOfIndexname = "";
                if (angular.isDefined($stateParams.indexname)) {
                    firstFiledOfIndexname = $stateParams.indexname.split("_")[0];
                }
                if (channelName == "wz" || channelName == "app" || firstFiledOfIndexname == "website" || firstFiledOfIndexname == "app") {
                    $scope.status.isReprintShow = true;
                } else {
                    $scope.status.isReprintShow = false;
                }
            }
            //网站显示该字段
            function showEnterWebsite() {
                var firstFiledOfIndexname = "";
                if (angular.isDefined($stateParams.indexname)) {
                    firstFiledOfIndexname = $stateParams.indexname.split("_")[0];
                }
                if (channelName == "wz" || firstFiledOfIndexname == "website") {
                    $scope.status.isEnterWebsite = true;
                } else {
                    $scope.status.isEnterWebsite = false;
                }
            }
            //APP显示该字段
            function showEnterApp() {
                var firstFiledOfIndexname = "";
                if (angular.isDefined($stateParams.indexname)) {
                    firstFiledOfIndexname = $stateParams.indexname.split("_")[0];
                }
                if (channelName == "app" || firstFiledOfIndexname == "app") {
                    $scope.status.isEnterApp = true;
                } else {
                    $scope.status.isEnterApp = false;
                }
            }
            // 收藏
            $scope.collect = function() {
                var params = {
                    serviceid: "mlf_bigdataexchange",
                    methodname: "collect",
                    guid: $stateParams.guid,
                    // channelName: $stateParams.channel,
                    indexname: $scope.detailIndexname,
                };
                params.channelName = angular.isDefined($stateParams.channel) ? $stateParams.channel : "iwo";
                trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "post").then(function(data) {
                    trsconfirm.alertType("收藏成功!", "", "success", false, "");
                });
            };

            //创作轴
            $scope.creationAxis = function() {
                var params = {
                    serviceid: "mlf_bigdataexchange",
                    methodname: "batchcreation",
                    guid: $stateParams.guid,
                    indexname: $scope.detailIndexname
                };
                params.channelName = angular.isDefined($stateParams.channel) ? $stateParams.channel : "iwo";
                $scope.loadingPromise = resourceCenterService.setBigDataCreation(params).then(function(data) {
                    trsconfirm.alertType("该稿件已成功加入创作轴!", "", "success", false);
                });
            };

            // 取稿
            $scope.openTakeDraftModal = function() {
                var params = {
                    serviceid: "mlf_bigdataexchange",
                    methodname: "fetch",
                    guid: $stateParams.guid,
                    indexname: $scope.detailIndexname,
                    channelName: angular.isDefined($stateParams.channel) ? $stateParams.channel : "iwo"
                };
                var modalInstance = resCtrModalService.fullTakeDraft(params, true);
                modalInstance.result.then(function() {
                    storageListenerService.addListenerToResource("takeDraft");
                    $window.close();
                });
            };
            //打印
            $scope.printBtn = function() {
                trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), $scope.params, "post").then(function(data) {
                    trsPrintService.trsPrintWeibo(data);
                });
            };
            //关闭
            $scope.close = function() {
                $window.close();
            };
            //微博做特殊处理
            function dealWeiboData() {
                $scope.detailInfos.WEIBOBOTTOMTIME = $filter('date')(new Date($scope.detailInfos.DOCPUBTIME), "M月d日 HH:mm").toString();
                getWeiboImg();
            };
            /**
             * [getWeiboImg description]获取微博图片
             */
            function getWeiboImg() {
                var params = {
                    typeid: 'zyzx',
                    modelid: 'getImgList',
                    serviceid: $stateParams.channel,
                    channelName: $stateParams.channel,
                    guids: $scope.detailInfos.ZB_GUID,
                };
                trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), params, 'post').then(function(data) {
                    for (var key in data.content[0]) {
                        for (var i = 0; i < data.content[0][key].IMAGEURLS.length; i++) {
                            $scope.data.weiboSImg.push(data.content[0][key].IMAGEURLS[i].urlS);
                            $scope.data.weiboMImg.push(data.content[0][key].IMAGEURLS[i].urlM);
                        };
                    };
                    // angular.forEach($scope.detailInfos.IMAGE, function(value, key) {
                    //     $scope.data.weiboLImg.push(value.img);
                    // });
                    $scope.data.weiboLImg = ($scope.detailInfos.IR_THUMBNAIL_PIC.split(';'));
                    $scope.data.weiboLImg[$scope.data.weiboLImg.length - 1] == '' && $scope.data.weiboLImg.pop();
                    loadImgDirective();
                });
            };
            /**
             * [loadImgDirective description]动态加载图片显示指令
             */
            function loadImgDirective() {
                var directive = '<trs-scroll-pictures slider-pic="data.weiboLImg" slider-small-pic="data.weiboSImg" add-create="true"></trs-scroll-pictures>';
                directive = $compile(directive)($scope);
                $($(angular.element(document)).find('imgdir')).append(directive);
            };
        }
    ]);
