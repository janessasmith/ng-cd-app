/*create by ma.rongqin 2016.7.4*/
"use strict";
angular.module('planEventAnalyisBasicInfoDetailModule', [
        'mgcrea.ngStrap.scrollspy', 'editEventModule', 'mapSuggestionEventModule'
    ])
    .controller('planEventAnalyisBasicInfoDetailCtrl', ['$scope', '$timeout', '$interval', '$state', '$stateParams', '$filter', '$q', '$window', 'trsHttpService', 'planEventDetailService', 'trsconfirm',
        function($scope, $timeout, $interval, $state, $stateParams, $filter, $q, $window, trsHttpService, planEventDetailService, trsconfirm) {
            initStatus();
            initData();
            /**
             * [manageDataAfterSave description]保存操作完成后进行数据处理
             */
            $scope.goOtherDetail = function(pathName) {
                $state.go('eventdetail.' + pathName, {
                    'eventid': $scope.status.eventId,
                });
            };
            /**
             * [initStatus description]初始化状态
             */
            function initStatus() {
                $scope.status = {
                    'eventId': $stateParams.eventid,
                    'eventType': $stateParams.eventtype,
                    'colorArray': ['#2DC7C9', '#8165C0', '#36A6F8', '#FF9C4E', '#E44558', '#95CDDA', '#FBC0C2', '#704920', '#EA8C84', '#435B97', '#DFBC9E', '#DA4F3A', '#A5C8DC', '#3F99D2', '#F19141', '#6FB33E', '#A38FC7', '#57BBA1', '#E36972', '#58B5E2', '#6A9DCD', '#C166A6'],
                    'introduction': {
                        'content': {},
                        'isEdit': false,
                    },
                    'restore': {
                        'content': "",
                        'picUrl': [],
                    },
                    'content': {
                        'name': [],
                        'org': [],
                        'place': [],
                        'currPalce': '',
                        'top': [],
                        'left': [],
                    },
                    'report': {
                        'mediaGroup': {},
                        'currType': "",
                        'currSite': "",
                        'activeSite': '',
                        'keywords': "",
                        'list': [],
                        'PAGECOUNT': "",
                        'ITEMCOUNT': "",
                        'PAGESIZE': 10,
                        'CURRPAGE': 1,
                        'timeOption': [],
                        'selectTime': {},
                        'startTime': '',
                        'endTime': '',
                    },
                    'draftMaterial': {
                        'timeOption': [],
                        'selectTime': {},
                        'startTime': '',
                        'endTime': '',
                        'keywords': "",
                        'PAGECOUNT': "",
                        'ITEMCOUNT': "",
                        'PAGESIZE': 10,
                        'CURRPAGE': 1,
                        'list': [],
                        'currCopyPage': 1,
                    },
                    'weiboMaterial': {
                        'timeOption': [],
                        'selectTime': {},
                        'startTime': '',
                        'endTime': '',
                        'keywords': "",
                        'PAGECOUNT': "",
                        'ITEMCOUNT': "",
                        'PAGESIZE': 10,
                        'CURRPAGE': 1,
                        'list': [],
                    },
                    'picMaterial': {
                        'timeOption': [],
                        'selectTime': {},
                        'startTime': '',
                        'endTime': '',
                        'keywords': "",
                        'PAGECOUNT': "",
                        'ITEMCOUNT': "",
                        'PAGESIZE': 15,
                        'CURRPAGE': 1,
                        'list': [],
                    },
                    'videoMaterial': {
                        'timeOption': [],
                        'selectTime': {},
                        'startTime': '',
                        'endTime': '',
                        'keywords': "",
                        'PAGECOUNT': "",
                        'ITEMCOUNT': "",
                        'PAGESIZE': 15,
                        'CURRPAGE': 1,
                        'list': [],
                    },
                    'volume': {
                        'mediaEchartsShow': false,
                    },
                    'emotionColumnar': {},
                };
                $scope.data = {
                    'introduction': {
                        'contentParams': {
                            'serviceid': 'eventdetail',
                            'modelid': 'briefIntroduction',
                            'typeid': 'event',
                            'eventid': $scope.status.eventId,
                        },
                    },
                    'restore': {
                        'contentParams': {
                            'serviceid': 'eventdetail',
                            'modelid': 'originalEvent',
                            'typeid': 'event',
                            'eventid': $scope.status.eventId,
                        }
                    },
                    'content': {
                        'params': {
                            'serviceid': 'eventdetail',
                            'modelid': 'relatedentity',
                            'typeid': 'event',
                            'eventid': $scope.status.eventId,
                            'entityfield': '', //ENTITY_NAME" 人物|"ENTITY_ORG" 机构｜"ENTITY_PLACE 地点
                        },
                    },
                    'report': {
                        'mediaParams': {
                            'serviceid': 'eventdetail',
                            'modelid': 'groupstatistics',
                            'typeid': 'event',
                            'eventid': $scope.status.eventId,
                            'timeparams': "", //时间
                            'keywords': "",
                        },
                        'listParams': {
                            'serviceid': 'eventdetail',
                            'modelid': 'groupreport',
                            'typeid': 'event',
                            'eventid': $scope.status.eventId,
                            'startpage': '0',
                            'pagesize': $scope.status.report.PAGESIZE,
                            'entityclassify': '',
                            'sourcesite': "",
                            'timeparams': "", //时间
                            'keywords': "",
                        },
                    },
                    'draftMaterial': {
                        'params': {
                            'serviceid': 'eventdetail',
                            'modelid': 'relatedmaterial',
                            'typeid': 'event',
                            'eventid': $scope.status.eventId,
                            'timeparams': "", //时间
                            'keywords': "",
                            'startpage': '0',
                            'pagesize': '10',
                            'material': 'article',
                        },
                    },
                    'weiboMaterial': {
                        'params': {
                            'serviceid': 'eventdetail',
                            'modelid': 'relatedmaterial',
                            'typeid': 'event',
                            'eventid': $scope.status.eventId,
                            'timeparams': "", //时间
                            'keywords': "",
                            'startpage': '0',
                            'pagesize': '10',
                            'material': 'weibo',
                        },
                    },
                    'picMaterial': {
                        'params': {
                            'serviceid': 'eventdetail',
                            'modelid': 'relatedmaterial',
                            'typeid': 'event',
                            'eventid': $scope.status.eventId,
                            'timeparams': "", //时间
                            'keywords': "",
                            'startpage': '0',
                            'pagesize': '15',
                            'material': 'image',
                        },
                    },
                    'videoMaterial': {
                        'params': {
                            'serviceid': 'eventdetail',
                            'modelid': 'relatedmaterial',
                            'typeid': 'event',
                            'eventid': $scope.status.eventId,
                            'timeparams': "", //时间
                            'keywords': "",
                            'startpage': '0',
                            'pagesize': '15',
                            'material': 'video',
                        },
                    },
                    'volume': {
                        'channelVolumePie': {
                            'serviceid': 'eventdetail',
                            'modelid': 'countingtendency',
                            'typeid': 'event',
                            'eventid': $scope.status.eventId,
                        },
                        'channelVolumeLine': {
                            'serviceid': 'eventdetail',
                            'modelid': 'countingline',
                            'typeid': 'event',
                            'eventid': $scope.status.eventId,
                        },
                        'mediaVolumeLine': {
                            'serviceid': 'eventdetail',
                            'modelid': 'mediaTendency',
                            'typeid': 'event',
                            'eventid': $scope.status.eventId,
                        },
                        'mediaVolumeBar': {
                            'serviceid': 'eventdetail',
                            'modelid': 'mediaTendencycolumn',
                            'typeid': 'event',
                            'eventid': $scope.status.eventId,
                        }
                    },
                    'emotionColumnar': {
                        'params': {
                            'serviceid': 'eventdetail',
                            'modelid': 'emotionalpillar',
                            'typeid': 'event',
                            'eventid': $scope.status.eventId,
                        },
                    },
                };
            };
            /**
             * [initData description]初始化数据
             */
            function initData() {
                //事件简介
                getIntroductionData();
                //事件还原
                getRestoreData();
                //事件相关主体
                // getEventContentData('ENTITY_NAME', 'name');
                // getEventContentData('ENTITY_PLACE', 'place');
                // getEventContentData('ENTITY_ORG', 'org');
                getEventContentData('ENTITY_NAME', 'name').then(function() {
                    return getEventContentData('ENTITY_ORG', 'org');
                }).then(function() {
                    return getEventContentData('ENTITY_PLACE', 'place');
                }).then(function() {
                    initEventContentPosition();
                });
                //ENTITY_NAME" 人物|"ENTITY_ORG" 机构｜"ENTITY_PLACE 地点
                //集团相关报道
                // getReportMedia();
                setMediaAndList();
                //初始化下拉框
                initDropDown();
                //文章素材
                getMaterialList('draftMaterial');
                //图片素材
                getMaterialList('picMaterial');
                //事件声量趋势渠道饼图
                initVolumeChannelPie();
                //个人事件才执行,热门事件不执行
                if ($scope.status.eventType != 1) {
                    //事件声量趋势渠道折线图
                    initVolumeLine('channelVolumeLine');
                    //情感柱状图
                    initEmotionColumnar();
                };
            };
            /**
             * [initDropDown description]初始化下拉框
             */
            function initDropDown() {
                var timeOption = planEventDetailService.timeOption();
                $scope.status.report.timeOption = angular.copy(timeOption);
                $scope.status.report.selectTime = $scope.status.report.timeOption[0];
                //文章素材
                $scope.status.draftMaterial.timeOption = angular.copy(timeOption);
                $scope.status.draftMaterial.selectTime = $scope.status.draftMaterial.timeOption[0];
                //微博素材
                $scope.status.weiboMaterial.timeOption = angular.copy(timeOption);
                $scope.status.weiboMaterial.selectTime = $scope.status.weiboMaterial.timeOption[0];
                //图片素材
                $scope.status.picMaterial.timeOption = angular.copy(timeOption);
                $scope.status.picMaterial.selectTime = $scope.status.picMaterial.timeOption[0];
                //视频素材
                $scope.status.videoMaterial.timeOption = angular.copy(timeOption);
                $scope.status.videoMaterial.selectTime = $scope.status.videoMaterial.timeOption[0];
            }
            /**
             * [openUrl description]打开URL
             */
            $scope.openUrl = function(item) {
                var url = item.PUBURL;
                if (!url) {
                    var detail = $state.href('resourceweibodetail', {
                        guid: item.ZB_GUID,
                        service: item.SERVICE,
                        indexname: item.INDEXNAME,
                        channel: item.CHANNEL,
                    });
                    window.open(detail);
                } else {
                    if (url.indexOf('http://')) url = 'http://' + url;
                    window.open(url);
                }
            };
            /**
             * [statusActive description]激活状态统一方法
             */
            $scope.statusActive = function(module, key, value, fnName) {
                $scope.status[module][key] = value;
                if (!!fnName) eval(fnName + '()');
            };
            /**
             * [pageChanged description]改变页数
             */
            $scope.pageChanged = function(fnName) {
                eval(fnName + '()');
            };
            /**
             * [getRandomColor description]颜色随机函数
             */
            function getRandomColor() {
                return 'rgb(' + [
                    Math.round(Math.random() * 160),
                    Math.round(Math.random() * 160),
                    Math.round(Math.random() * 160)
                ].join(',') + ')';
            }
            /**
             * [fullTextSearch description;全文检索]
             * @param  {[type]} ev [description:按下空格也能提交]
             */
            $scope.fullTextSearch = function(module, fnName, ev) {
                if ((angular.isDefined(ev) && ev.keyCode == 13) || angular.isUndefined(ev)) {
                    $scope.status[module].CURRPAGE = 1;
                    eval(fnName + '()');
                }
            };
            /**************事件简介开始**************/
            /**
             * [getIntroductionData description]获取事件简介数据
             */
            function getIntroductionData() {
                var defer = $q.defer();
                $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), $scope.data.introduction.contentParams, 'get').then(function(data) {
                    $scope.status.introduction.content = data;
                    try {
                        $scope.status.introduction.content.PLACE = JSON.parse($scope.status.introduction.content.PLACE);
                    } catch (exception) {
                        $scope.status.introduction.content.PLACE = [{ name: $scope.status.introduction.content.PLACE, searchName: "" }];
                    } finally {
                        initMap();
                        defer.resolve(data);
                    }
                });
                return defer.promise;
            }
            /**
             * [showIntroductionDate description]展示时间
             */
            $scope.showIntroductionDate = function(date) {
                if (!date) return;
                return $filter('date')(new Date(date), "yyyy年M月d日").toString();
            };
            /**
             * [searchDropDown description]下拉框
             */
            $scope.searchTimeDropDown = function(module, params, key, value, fnName) {
                if (value.length > 10) {
                    var timeArr = value.split(',');
                    for (var i = 0; i < timeArr.length; i++) {
                        timeArr[i] = $filter('date')(new Date(timeArr[i]), "yyyy-MM-dd").toString();
                    };
                    value = timeArr.join(',');
                }
                $scope.status[module][key].CURRPAGE = 1;
                $scope.data[module][params][key] = value;
                if (!!fnName) eval(fnName + '()');
            };
            /**************事件简介结束**************/
            /**************事件还原开始**************/
            /**
             * [getRestoreData description]获取事件还原数据
             */
            function getRestoreData() {
                var defer = $q.defer();
                $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), $scope.data.restore.contentParams, 'get').then(function(data) {
                    $scope.status.restore.content = data.IR_ABSTRACT;
                    var picUrl = data.PICURL.split(',');
                    angular.forEach(picUrl, function(value, key) {
                        $scope.status.restore.picUrl.push({ 'url': value });
                    });
                    defer.resolve(data);
                });
                return defer.promise;
            };
            /**************事件还原结束**************/
            /**************集团相关主体开始**************/
            /**
             * [getEventContentData description]获取事件相关主体数据
             */
            function getEventContentData(module, position) {
                var defer = $q.defer(),
                    params = angular.copy($scope.data.content.params);
                params.entityfield = module;
                $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), params, 'get').then(function(data) {
                    if (data.length > 9) data.length = 9;
                    var colorArray = angular.copy($scope.status.colorArray),
                        randomMax = colorArray.length;
                    angular.forEach(data, function(value, key) {
                        var index = Math.floor(Math.random() * randomMax);
                        value.backColor = colorArray[index];
                        colorArray.splice(index, 1);
                        randomMax--;
                    });
                    if (data.length > 9) data.length = 9;
                    $scope.status.content[position] = data;
                    console.log(data);
                    defer.resolve(data);
                });
                return defer.promise;
            };
            /**
             * [initEventContentPosition description]初始化获得事件相关主体球的位置
             */
            function initEventContentPosition() {
                $('.eventContentBallOrg').each(function(key, value) {
                    $scope.status.content.top.push($(this).css('top'));
                    $scope.status.content.left.push($(this).css('left'));
                });
                eventContentMove();
                $scope.ballMovePromise = $interval(eventContentMove, 3000);
                $scope.$on('$destroy', function() {
                    $interval.cancel($scope.ballMovePromise);
                });
            }
            /**
             * [eventContentMove description]事件主体球移动动画
             */
            function eventContentMove() {
                angular.forEach($scope.status.content.top, function(value, key) {
                    var currTop = Number.parseFloat($scope.status.content.top[key]);
                    var currLeft = Number.parseFloat($scope.status.content.left[key]);
                    $('.eventContentBallOrg').eq(key).animate({ 'top': currTop + eventContentRandom() + 'px', 'left': currLeft + eventContentRandom() + 'px' }, 3000);
                    $('.eventContentBallName').eq(key).animate({ 'top': currTop + eventContentRandom() + 'px', 'left': currLeft + eventContentRandom() + 'px' }, 3000);
                    $('.eventContentBallPlace').eq(key).animate({ 'top': currTop + eventContentRandom() + 'px', 'left': currLeft + eventContentRandom() + 'px' }, 3000);
                });
            };

            /**
             * [eventContentRandom description]事件主体球移动随机值
             */
            function eventContentRandom() {
                var value = Math.random() * 10;
                return Math.random() > 0.5 ? value : -value;
            }
            /**
             * [addToMap description]添加到地图
             */
            $scope.addToMap = function(placeName) {
                //console.log(placeName);
                $timeout(function() {
                    $scope.editEvent(placeName);
                }, 1000);
            };
            /**
             * [ballJumpToSearch description]将事件主体
             */
            $scope.ballJumpToSearch = function(item) {
                var params = {
                    'serviceid': 'eventdetail',
                    'modelid': 'relatedentitydetail',
                    'typeid': 'event',
                    'eventid': $scope.status.eventId,
                    'relatedname': item.STRVALUE,
                };
                trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), params, 'get').then(function(data) {
                    console.log(data);
                    var router = $state.href('retrieval', {
                        starttime: data.STARTTIME,
                        endtime: data.ENDTIME,
                        keyword_and: data.KEYWORD_AND,
                        keyword_or: data.KEYWORD_OR,
                        keyword_not: data.KEYWORD_NOT,
                        fromevent: 'true'
                    });
                    $window.open(router);
                });
            };
            /**************集团相关主体结束**************/
            /**************集团相关报道开始**************/
            /**
             * [searchReportTime description]事件相关报道时间检索
             */
            $scope.searchReportTime = function() {
                var value = $scope.status.report.selectTime.value;
                if (value.length > 10) {
                    var timeArr = value.split(',');
                    for (var i = 0; i < timeArr.length; i++) {
                        timeArr[i] = $filter('date')(new Date(timeArr[i]), "yyyy-MM-dd").toString();
                    };
                    value = timeArr.join(',');
                }
                $scope.status.report.CURRPAGE = 1;
                $scope.data.report.mediaParams.timeparams = value;
                $scope.data.report.listParams.timeparams = value;
                setMediaAndList();
            };
            /**
             * [getReportMedia description]获取的集团相关报道的站点
             */
            function getReportMedia() {
                var defer = $q.defer();
                $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), $scope.data.report.mediaParams, 'get').then(function(data) {
                    $scope.status.report.mediaGroup = data.CONTENT;
                    for (var key in $scope.status.report.mediaGroup) {
                        if ($scope.status.report.mediaGroup[key].length > 0) {
                            $scope.status.report.currType = key;
                            $scope.status.report.currSite = $scope.status.report.mediaGroup[key][0].STRVALUE;
                            $scope.status.report.activeSite = key + $scope.status.report.mediaGroup[key][0].STRVALUE;
                            break;
                        };
                    };
                    defer.resolve(data);
                });
                return defer.promise;
            };
            /**
             * [getReportList description]获取的集团相关报道的列表
             */
            function getReportList() {
                $scope.data.report.listParams.entityclassify = $scope.status.report.currType;
                $scope.data.report.listParams.sourcesite = $scope.status.report.currSite;
                $scope.data.report.listParams.startpage = $scope.status.report.CURRPAGE - 1;
                $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), $scope.data.report.listParams, 'get').then(function(data) {
                    $scope.status.report.list = data.PAGEITEMS || [];
                    $scope.status.report.ITEMCOUNT = data.TOTALITEMCOUNT;
                    $scope.status.report.PAGECOUNT = data.TOTALPAGECOUNT;
                });
            };
            /**
             * [chooseReportMedia description]选择的集团相关报道的站点
             */
            $scope.chooseReportMedia = function(type, site, channel) {
                $scope.status.report.currType = type;
                $scope.status.report.currSite = site;
                $scope.status.report.activeSite = channel + site;
                $scope.status.report.CURRPAGE = 1;
                getReportList();
            };
            /**
             * [setMediaAndList description]获取的集团相关报道的站点和列表
             */
            function setMediaAndList() {
                $scope.data.report.listParams.keywords = $scope.status.report.keywords;
                $scope.data.report.mediaParams.keywords = $scope.status.report.keywords;
                getReportMedia().then(function() {
                    getReportList();
                })
            };
            /**
             * [openReportUrl description]打开事件相关报道的页面
             */
            $scope.openReportUrl = function(item) {
                var url = item.PUBURL;
                if (!url || $scope.status.report.currType == "APP") {
                    var detail = $state.href('resourceweibodetail', {
                        guid: item.ZB_GUID,
                        service: item.SERVICE,
                        indexname: item.INDEXNAME,
                        channel: item.CHANNEL,
                    });
                    window.open(detail);
                } else {
                    if (url.indexOf('http://')) url = 'http://' + url;
                    window.open(url);
                }
            };
            /**************集团相关报道结束**************/
            /**************事件相关素材开始**************/
            /**
             * [getMaterialList description]获取相关素材列表
             */
            function getMaterialList(module) {
                var params = $scope.data[module].params;
                params.keywords = $scope.status[module].keywords;
                params.startpage = $scope.status[module].CURRPAGE - 1;
                $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), params, 'get').then(function(data) {
                    $scope.status[module].list = data.PAGEITEMS || [];
                    $scope.status[module].ITEMCOUNT = data.TOTALPAGECOUNT;
                    $scope.status[module].PAGECOUNT = data.TOTALPAGECOUNT;
                });
            };
            /**
             * [searchMaterialTime description]搜素素材时间
             */
            $scope.searchMaterialTime = function(module) {
                var value = $scope.status[module].selectTime.value;
                if (value.length > 10) {
                    var timeArr = value.split(',');
                    for (var i = 0; i < timeArr.length; i++) {
                        timeArr[i] = $filter('date')(new Date(timeArr[i]), "yyyy-MM-dd").toString();
                    };
                    value = timeArr.join(',');
                }
                $scope.status[module].CURRPAGE = 1;
                $scope.data[module].params.timeparams = value;
                getMaterialList(module);
            };
            /**
             * [fullMaterialSearch description;素材全文检索]
             * @param  {[type]} ev [description:按下空格也能提交]
             */
            $scope.fullMaterialSearch = function(module, ev) {
                if ((angular.isDefined(ev) && ev.keyCode == 13) || angular.isUndefined(ev)) {
                    $scope.status[module].CURRPAGE = 1;
                    getMaterialList(module);
                };
            };
            /**
             * [materialPageChanged description]素材页数跳转
             */
            $scope.materialPageChanged = function(module) {
                getMaterialList(module);
            };
            /**
             * [materialDraftPageChanged description]文章素材页数跳转
             */
            $scope.materialDraftPageChanged = function(module) {
                if ($scope.status[module].CURRPAGE > $scope.status[module].currCopyPage) {
                    $scope.data[module].params.start_pos = $scope.status[module].list[$scope.status[module].list.length - 1].CURRENTPOS;
                } else {
                    delete $scope.data[module].params.start_pos;
                }
                $scope.status[module].currCopyPage = angular.copy($scope.status[module].CURRPAGE);
                getMaterialList(module);
            };
            /**************事件相关素材结束**************/
            /**************事件声量趋势开始*****************/
            /**
             * [initVolumeLine description]事件声量趋势渠道折线图
             */
            function initVolumeLine(params) {
                $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), $scope.data.volume[params], 'get').then(function(data) {
                    var date = data.DATE,
                        value = data.CONTENT,
                        dateLen = Number(data.COUNTDAY),
                        information = {
                            legend: [],
                            xAxis: [data[0]],
                            series: [],
                        };
                    for (var i = 0; i < dateLen; i++) {
                        date = new Date(date);
                        information.xAxis.unshift($filter('date')(date, "yyyy-MM-dd").toString());
                        date.setDate(date.getDate() - 1);
                    };
                    for (var key in value) {
                        information.legend.push(key);
                        information.series.push({
                            name: key,
                            type: 'line',
                            smooth: true,
                            data: value[key].split(';'),
                            markPoint: {
                                data: [
                                    { type: 'max', name: '最大值' }
                                ]
                            }
                        });
                    };
                    planEventDetailService.lineEcharts('', information, params);
                });
            };
            /**
             * [initVolumeChannelPie description]事件声量趋势渠道饼图
             */
            function initVolumeChannelPie() {
                $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), $scope.data.volume.channelVolumePie, 'get').then(function(data) {
                    var information = {
                        data: [],
                        name: "渠道声量",
                    };
                    for (var key in data.CONTENT) {
                        information.data.push({ 'value': data.CONTENT[key], 'name': key });
                    }
                    planEventDetailService.pieEcharts(information, 'channelVolumePie');
                });
            }

            function initVolumeMediaBar() {
                $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), $scope.data.volume.mediaVolumeBar, 'get').then(function(data) {
                    var information = {
                            yAxis: [],
                            data: [],
                            name: "媒体声量",
                        },
                        count = 0;
                    for (var key in data.CONTENT) {
                        information.yAxis.push({
                            value: key,
                            textStyle: {
                                fontFamily: '宋体'
                            }
                        });
                        information.data.push({
                            'value': data.CONTENT[key],
                            'name': key,
                            'itemStyle': {
                                'normal': {
                                    color: $scope.status.colorArray[count],
                                    borderColor: "#fff",
                                }
                            }
                        });
                        count++;
                    }
                    planEventDetailService.transverseBar(information, 'mediaVolumeBar')
                });
            }
            /**
             * [showVolumeMediaEcharts description]显示事件声量趋势媒体声量的图表
             */
            $scope.showVolumeMediaEcharts = function() {
                if ($scope.status.volume.mediaEchartsShow) return;
                initVolumeLine('mediaVolumeLine');
                initVolumeMediaBar();
                $scope.status.volume.mediaEchartsShow = true;
            };
            /**************事件声量趋势结束*****************/
            /**************情感柱状图开始*****************/
            function initEmotionColumnar() {
                $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), $scope.data.emotionColumnar.params, 'get').then(function(data) {
                    var information = {
                        yAxisName: "稿件数",
                        xAxis: [],
                        topName: "正面",
                        topData: [],
                        topColor: '#E44156',
                        bottomName: "负面",
                        bottomData: [],
                        bottomColor: '#2DC4CB',
                    };
                    angular.forEach(data, function(value, key) {
                        information.xAxis.unshift($filter('date')(new Date(value.DATE), "M月d日").toString());
                        information.topData.unshift(value.POSITIVE);
                        information.bottomData.unshift(-value.NEGATIVE);
                    });
                    planEventDetailService.contrastBar(information, 'emotionColumnarBar');
                });
            };
            /**************情感柱状图结束*****************/
            /**
             * [editEvent description点此编辑]
             * @param  {[type]} addAddress [description:由外部添加进来的地址]
             * @return {[type]} [description]
             */
            $scope.editEvent = function(addAddress) {
                planEventDetailService.editEvent(angular.copy($scope.status.introduction.content), addAddress).then(function(result) {
                    if (result.type === "confirm") {
                        var params = {
                            eventid: $scope.status.eventId,
                            typeid: "event",
                            maxratetime: result.data.MAXRATETIME,
                            people: result.data.PEOPLE,
                            org: result.data.ORG,
                            place: result.data.PLACE,
                            coordinate: "",
                        };
                        trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), params, "post")
                            .then(function() {
                                getIntroductionData();
                            });
                    } else {
                        getIntroductionData();
                    }
                });
            };
            /**
             * [initMap description初始化地图]
             * @return {[type]} [description]
             */
            function initMap() {
                window.BMap_loadScriptTime = (new Date()).getTime();
                LazyLoad.js(["http://api.map.baidu.com/getscript?v=2.0&ak=rZkn12K1F24d0vsTopn6s2NGcQ5HurgK&services=&t=20160627141851"], function() {
                    // 百度地图API功能
                    $scope.status.mapMain = new BMap.Map("allMapMain", { minZoom: 5, maxZoom: 18 }); // 创建Map实例
                    $scope.status.mapMain.centerAndZoom(new BMap.Point(120.219375, 30.259244), 5); // 初始化地图,设置中心点坐标和地图级别
                    $scope.status.mapMain.addControl(new BMap.MapTypeControl()); //添加地图类型控件
                    $scope.status.mapMain.setCurrentCity("杭州"); // 设置地图显示的城市 此项是必须设置的
                    $scope.status.mapMain.enableScrollWheelZoom(true); //开启鼠标滚轮缩放
                    for (var i = 0; i < $scope.status.introduction.content.PLACE.length; i++) {
                        var lat = angular.isUndefined($scope.status.introduction.content.PLACE[i].value) ? "" : $scope.status.introduction.content.PLACE[i].value.lat;
                        var lng = angular.isUndefined($scope.status.introduction.content.PLACE[i].value) ? "" : $scope.status.introduction.content.PLACE[i].value.lng;
                        var searchName = $scope.status.introduction.content.PLACE[i].searchName;
                        var name = $scope.status.introduction.content.PLACE[i].name;
                        setMarker(lat, lng, searchName, name, i);
                    }
                });
            }
            /**
             * [setMarker description设置定位标签]
             * @param  {[type]} lat [description:纬度]
             * @param  {[type]} lng [description:经度]
             * @return {[type]} [description]
             */
            function setMarker(lat, lng, searchName, name, index) {
                if (lat !== "") {
                    var point = new BMap.Point(lng, lat);
                    var marker = new BMap.Marker(point);
                    marker.myIndex = index;
                    marker.searchName = searchName;
                    marker.trueName = name;
                    var label = new BMap.Label(index + 1, { offset: new BMap.Size(3, 0) });
                    marker.setLabel(label);
                    $scope.status.mapMain.addOverlay(marker);
                    marker.addEventListener("click", function(e) {
                        openInfo(point, this.searchName, this.trueName);
                    });
                }
            }

            function openInfo(point, searchName, name) {
                var opts = {
                    width: 200,
                    height: 60,
                    title: searchName,
                    enableMessage: false
                };
                var infoWindow = new BMap.InfoWindow(name, opts);
                $scope.status.mapMain.openInfoWindow(infoWindow, point);
            }
            /**
             * [location description地图聚焦定位]
             * @param  {[type]} lat [description:纬度]
             * @param  {[type]} lng [description:经度]
             * @return {[type]} [description]
             */
            $scope.location = function(lat, lng) {
                if (angular.isUndefined(lat)) {
                    trsconfirm.alertType("您的地址没有注册坐标", "", "warning", false);
                    return;
                }
                $scope.status.mapMain.centerAndZoom(new BMap.Point(lng, lat), 10);
            };
        }
    ]);
