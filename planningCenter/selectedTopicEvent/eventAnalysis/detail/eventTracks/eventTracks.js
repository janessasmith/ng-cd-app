/*create by ma.rongqin 2016.7.4*/
"use strict";
angular.module('planEventAnalyisEventTracksDetailModule', [
        'mgcrea.ngStrap.scrollspy',
    ])
    .controller('planEventAnalyisEventTracksDetailCtrl', ['$scope', '$state', '$stateParams', '$filter', '$q', '$window', '$timeout', 'trsHttpService', 'planEventDetailService',
        function($scope, $state, $stateParams, $filter, $q, $window, $timeout, trsHttpService, planEventDetailService) {
            initStatus();
            initData();
            /**
             * [initStatus description]初始化状态
             */
            function initStatus() {
                $scope.status = {
                    'eventId': $stateParams.eventid,
                    'colorArray': ['#2DC7C9', '#8165C0', '#36A6F8', '#FF9C4E', '#E44558', '#95CDDA', '#FBC0C2', '#704920', '#EA8C84', '#435B97', '#DFBC9E', '#DA4F3A', '#A5C8DC', '#3F99D2', '#F19141', '#6FB33E', '#A38FC7', '#57BBA1', '#E36972', '#58B5E2', '#6A9DCD', '#C166A6'],
                    'timeOption': planEventDetailService.timeOption(),
                    'eventFocus': {
                        'currDate': '',
                        'isEmpty': false,
                        'week': [],
                        'opinion': [],
                        'currOpinion': {},
                        'list': [],
                        'PAGECOUNT': "",
                        'ITEMCOUNT': "",
                        'PAGESIZE': 10,
                        'CURRPAGE': 1,
                    },
                    'comment': {
                        'category': {},
                        'currCategory': {},
                        'currEntity': '',
                        'isEmpty': false,
                        'canMore': true,
                    },
                    'volume': {
                        'mediaEchartsShow': false,
                    },
                    'mediaNetizen': {},
                    'opinion': {
                        'netizenList': [],
                        'mediaList': [],
                        'internalList': [],
                        'outsideList': [],
                        'officialList': [],
                        'folkList': [],
                        'currOpinion': 'officialFolk'
                    },
                    'hotWord': {},
                    'emotionFalls': {},
                    'emotionColumnar': {},
                    'wordCloudUrl': "./planningCenter/selectedTopicEvent/eventAnalysis/detail/eventTracks/wordCloud/wordCloud.html",
                    'wordCloudTab': 'folkAndOfficialHotwords',
                    'btnRights': {},
                };
                $scope.data = {
                    'serviceTime': '',
                    'btnRightParams': {
                        'serviceid': 'mlf_metadataright',
                        'methodname': 'queryOperKeysOfNormalModal',
                        'ModalName': '事件分析',
                        'Classify': 'sjfx.rmsj'
                    },
                    'eventFocus': {
                        'dateParams': {
                            // 'serviceid': 'eventtrace',
                            // 'modelid': 'geteventcreatetime',
                            // 'typeid': 'event',
                            // 'eventid': $scope.status.eventId,
                            'serviceid': "mlf_fusion",
                            'methodname': "getServiceTime",
                        },
                        'opinionParams': {
                            'serviceid': 'eventtrace',
                            'modelid': 'viewpointlist',
                            'typeid': 'event',
                            'eventid': $scope.status.eventId,
                            'pubtime': '',
                        },
                        'listParams': {
                            'serviceid': 'eventtrace',
                            'modelid': 'eventlistbyid',
                            'typeid': 'event',
                            'eventid': $scope.status.eventId,
                            'viewpointid': '',
                            'currentpage': '0',
                        },
                    },
                    'comment': {
                        'categoryParams': {
                            'serviceid': 'eventtrace',
                            'modelid': 'getcommentcategory',
                            'typeid': 'event',
                            'eventid': $scope.status.eventId,
                        },
                        'entityParams': {
                            'serviceid': 'eventtrace',
                            'modelid': 'getcommententity',
                            'typeid': 'event',
                            'eventid': $scope.status.eventId,
                            'category': "", //类别

                        },
                        'stractsParams': {
                            'serviceid': 'eventtrace',
                            'modelid': 'getabstracts',
                            'typeid': 'event',
                            'eventid': $scope.status.eventId,
                            'category': "", //类别
                            'entity': "", //实体名称
                            'currentpage': "0",
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
                    'mediaNetizen': {},
                    'opinion': {
                        'netizenParams': { //网民
                            'serviceid': 'eventtrace',
                            'modelid': 'getviewpoint',
                            'typeid': 'event',
                            'eventid': $scope.status.eventId,
                            'topvalue': '5',
                            'field': 'internal_data',
                        },
                        'mediaParams': { //媒体
                            'serviceid': 'eventtrace',
                            'modelid': 'getviewpoint',
                            'typeid': 'event',
                            'eventid': $scope.status.eventId,
                            'topvalue': '5',
                            'field': 'internal_data',
                        },
                        'internalParams': { //集团
                            'serviceid': 'eventtrace',
                            'modelid': 'getviewpoint',
                            'typeid': 'event',
                            'eventid': $scope.status.eventId,
                            'topvalue': '5',
                            'field': 'internal_data',
                        },
                        'outsideParams': { //外网
                            'serviceid': 'eventtrace',
                            'modelid': 'getviewpoint',
                            'typeid': 'event',
                            'eventid': $scope.status.eventId,
                            'topvalue': '5',
                            'field': 'outside_data',
                        },
                        'officialParams': { //官方
                            'serviceid': 'eventtrace',
                            'modelid': 'getviewpoint',
                            'typeid': 'event',
                            'eventid': $scope.status.eventId,
                            'topvalue': '5',
                            'field': 'official_data',
                        },
                        'folkParams': { //民间
                            'serviceid': 'eventtrace',
                            'modelid': 'getviewpoint',
                            'typeid': 'event',
                            'eventid': $scope.status.eventId,
                            'topvalue': '5',
                            'field': 'folk_data',
                        },
                    },
                    'hotWord': {
                        'netizenCloud': '',
                        'mediaCloud': '',
                        'internalCloud': '',
                        'outsideCloud': '',
                        'officialCloud': '',
                        'folkCloud': '',
                    },
                    'emotionFalls': {
                        'params': {
                            'serviceid': 'eventdetail',
                            'modelid': 'emotionalwaterfall',
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
                $scope.status.wordCloudUrl += "?eventId=" + $scope.status.eventId;
                $scope.status.wordCloudUrlWithParams = {
                    left: $scope.status.wordCloudUrl + "&position=left&methodname=folkAndOfficialHotwords&mediatype=official",
                    right: $scope.status.wordCloudUrl + "&position=right&methodname=folkAndOfficialHotwords&mediatype=folk"
                };
            }
            /**
             * [initData description]初始化数据
             */
            function initData() {
                //获取服务器时间
                getServiceTime();
                //获取原子权限
                getTagRight();
                //事件焦点脉络
                requestEventFocusDate().then(function(date) {
                    return getEventFocusOpinion(date);
                }).then(function(opinion) {
                    $scope.status.eventFocus.currOpinion = opinion[0];
                    getEventFocusList();
                });
                //事件观点评述
                getCommentCategory().then(function(data) {
                    $scope.status.comment.currCategory = data[0].STRVALUE;
                    return getCommentEntity();
                }, function() {
                    $scope.status.comment.isEmpty = true;
                }).then(function(data) {
                    $scope.status.comment.currEntity = "all";
                    getCommentStracts();
                });
                //事件声量趋势渠道饼图
                initVolumeChannelPie();
                //事件声量趋势渠道折线图
                initVolumeLine('channelVolumeLine');
                //事件观点对比
                officialFolk(); //官方VS民间
                internalOutside(); //集团VS外部
                //情感瀑布图
                initEmotionFallsBar();
                //情感柱状图
                initEmotionColumnar();
                //创建字符云去重用的监听
                buildWatch();
            };
            /**
             * [getTagRight description]获取原子权限
             */
            function getTagRight() {
                trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), $scope.data.btnRightParams, 'get').then(function(data) {
                    angular.forEach(data, function(value, key) {
                        $scope.status.btnRights[value.OPERNAME] = true;
                    });
                })
            };
            /**
             * [goOtherDetail description]左侧前往其他模块
             */
            $scope.goOtherDetail = function(pathName) {
                $state.go('eventdetail.' + pathName, {
                    'eventid': $scope.status.eventId,
                    'eventtype': '1',
                });
            };
            /**
             * [getServiceTime description]获取服务器时间
             */
            function getServiceTime() {
                var params = {
                    'serviceid': "mlf_fusion",
                    'methodname': "getServiceTime",
                };
                $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, 'get').then(function(data) {
                    $scope.data.serviceTime = data.LASTOPERTIME;
                });
            };
            /**
             * [refreshFn description]刷新
             */
            $scope.refreshFn = function(fnName) {
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
            /**************事件焦点脉络开始*****************/
            /**
             * [requestEventFocusDate description]请求事件焦点脉络创建时间
             */
            function requestEventFocusDate() {
                var defer = $q.defer();
                $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), $scope.data.eventFocus.dateParams, "get").then(function(data) {
                    $scope.status.eventFocus.currDate = $filter('date')(new Date(data.LASTOPERTIME), "yyyy-MM-dd").toString();
                    var date = new Date(data.LASTOPERTIME),
                        dateArray = [];
                    date.setDate(date.getDate() - date.getDay());
                    for (var i = 0; i < 7; i++) {
                        date.setDate(date.getDate() + 1);
                        dateArray.push($filter('date')(date, "yyyy-MM-dd").toString());
                    };
                    $scope.status.eventFocus.week = dateArray;
                    defer.resolve($scope.status.eventFocus.currDate);
                });
                return defer.promise;
            };
            /**
             * [eventFocusChooseDate description]时间焦点脉络选择日期
             */
            $scope.eventFocusChooseDate = function(chooseDate) {
                if (chooseDate > $filter('date')($scope.data.serviceTime, "yyyy-MM-dd").toString()) return;
                $scope.status.eventFocus.currDate = chooseDate;
                getEventFocusOpinion(chooseDate).then(function(opinion) {
                    $scope.status.eventFocus.currOpinion = opinion[0];
                    getEventFocusList();
                })
            };
            /**
             * [getEventFocusOpinion description]获取当前时间的观点
             */
            function getEventFocusOpinion(date) {
                var defer = $q.defer();
                $scope.data.eventFocus.opinionParams.pubtime = date;
                $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), $scope.data.eventFocus.opinionParams, 'get').then(function(data) {
                    if (angular.isString(data)) {
                        $scope.status.eventFocus.isEmpty = true;
                        defer.reject();
                    } else {
                        $scope.status.eventFocus.isEmpty = false;
                        $scope.status.eventFocus.opinion = data;
                        defer.resolve(data);
                    }
                });
                return defer.promise;
            };
            /**
             * [anotherWeek description]上一周或下一周
             */
            $scope.eventFocusAnotherWeek = function(isNext) {
                var date = isNext ? $scope.status.eventFocus.week[$scope.status.eventFocus.week.length - 1] : $scope.status.eventFocus.week[0],
                    day = isNext ? 1 : -1,
                    dateArray = [];
                date = new Date(date);
                for (var i = 0; i < 7; i++) {
                    date.setDate(date.getDate() + day);
                    isNext ? dateArray.push($filter('date')(date, "yyyy-MM-dd").toString()) : dateArray.unshift($filter('date')(date, "yyyy-MM-dd").toString());
                };
                $scope.status.eventFocus.week = dateArray;
            };
            /**
             * [filterEventFocusDate description]处理显示的事件焦点脉络时间
             */
            $scope.filterEventFocusDate = function(date) {
                return $filter('date')(date, "M月d日").toString();
            };
            /**
             * [getEventFocusList_transfer description]获取当前焦点的稿件列表
             */
            function getEventFocusList_transfer() {
                $scope.status.eventFocus.CURRPAGE = 1;
                getEventFocusList();
            };
            /**
             * [getEventFocusList description]获取当前焦点的稿件列表
             */
            function getEventFocusList() {
                var defer = $q.defer();
                $scope.data.eventFocus.listParams.currentpage = $scope.status.eventFocus.CURRPAGE - 1;
                $scope.data.eventFocus.listParams.viewpointid = $scope.status.eventFocus.currOpinion.viewPointId;
                $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), $scope.data.eventFocus.listParams, 'get').then(function(data) {
                    $scope.status.eventFocus.list = data.PAGEITEMS;
                    $scope.status.eventFocus.PAGECOUNT = data.TOTALPAGECOUNT;
                    $scope.status.eventFocus.ITEMCOUNT = data.TOTALITEMCOUNT;
                    defer.resolve(data);
                });
                return defer.promise;
            };
            /**************事件焦点脉络结束*****************/
            /**************事件观点评述开始*****************/
            /**
             * [getCommentCategory description]获取观点评述类别
             */
            function getCommentCategory() {
                var defer = $q.defer();
                $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), $scope.data.comment.categoryParams, 'get').then(function(data) {
                    if (angular.isString(data)) {
                        defer.reject();
                    } else {
                        for (var i = 0; i < data.length; i++) {
                            $scope.status.comment.category[data[i].STRVALUE] = {
                                'entity': {},
                                'hasChild': false,
                            };
                        };
                        defer.resolve(data);
                    }
                });
                return defer.promise;
            };
            /**
             * [getCommentEntity description]获取观点评述实体
             */
            function getCommentEntity() {
                // if ($scope.status.comment.category[$scope.status.comment.currCategory].hasChild) return;
                $scope.status.comment.currEntity = "all";
                var defer = $q.defer(),
                    params = angular.copy($scope.data.comment.entityParams);
                params.category = $scope.status.comment.currCategory;
                $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), params, 'get').then(function(data) {
                    angular.forEach(data, function(value, key) {
                        $scope.status.comment.category[$scope.status.comment.currCategory].entity[value.STRVALUE] = {};
                    });
                    $scope.status.comment.category[$scope.status.comment.currCategory].entity.all = {};
                    $scope.status.comment.category[$scope.status.comment.currCategory].hasChild = true;
                    getCommentStracts();
                    defer.resolve(data);
                });
                return defer.promise;
            };
            /**
             * [getCommentEntity description]获取观点评述摘要
             */
            function getCommentStracts() {
                var defer = $q.defer(),
                    params = angular.copy($scope.data.comment.stractsParams),
                    currPage = $scope.status.comment.category[$scope.status.comment.currCategory].entity[$scope.status.comment.currEntity].CURRPAGE;
                params.category = $scope.status.comment.currCategory;
                params.entity = $scope.status.comment.currEntity;
                params.currentpage = currPage ? currPage : '0';
                $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), params, 'get').then(function(data) {
                    $scope.status.comment.category[$scope.status.comment.currCategory].entity[$scope.status.comment.currEntity].stracts = data.PAGEITEMS;
                    $scope.status.comment.category[$scope.status.comment.currCategory].entity[$scope.status.comment.currEntity].PAGESIZE = data.PAGESIZE;
                    $scope.status.comment.category[$scope.status.comment.currCategory].entity[$scope.status.comment.currEntity].ITEMCOUNT = data.TOTALITEMCOUNT;
                    $scope.status.comment.category[$scope.status.comment.currCategory].entity[$scope.status.comment.currEntity].PAGECOUNT = data.PAGECOUNT;
                    $scope.status.comment.category[$scope.status.comment.currCategory].entity[$scope.status.comment.currEntity].CURRPAGE = data.PAGEINDEX + 1;
                    defer.resolve(data);
                });
                return defer.promise;
            };
            /**
             * [getCommentStractsLeft description]点击左侧获取观点评述摘要
             */
            function getCommentStractsLeft() {
                var stracts = $scope.status.comment.category[$scope.status.comment.currCategory].entity[$scope.status.comment.currEntity].stracts;
                $scope.status.comment.canMore = true;
                if (angular.isArray(stracts) && stracts.length > 0) return;
                getCommentStracts();
            };
            /**
             * [commentAddMore description]观点评述加载更多
             */
            $scope.commentAddMore = function() {
                if (!$scope.status.comment.canMore) return;
                var originalStracts = angular.copy($scope.status.comment.category[$scope.status.comment.currCategory].entity[$scope.status.comment.currEntity].stracts);
                getCommentStracts().then(function() {
                    $scope.status.comment.category[$scope.status.comment.currCategory].entity[$scope.status.comment.currEntity].stracts = originalStracts.concat($scope.status.comment.category[$scope.status.comment.currCategory].entity[$scope.status.comment.currEntity].stracts);
                    if (originalStracts.length == $scope.status.comment.category[$scope.status.comment.currCategory].entity[$scope.status.comment.currEntity].stracts.length) {
                        $scope.status.comment.canMore = false;
                    };
                });
            };
            /**
             * [commentDelBlank description]去除开头的空格
             */
            $scope.commentDelBlank = function(content) {
                var str = content;
                if (str[0] == "　" || str[0] == ' ') {
                    var index = 0;
                    for (var i = 0; i < str.length; i++) {
                        if (str[i] == "　" || str[i] == ' ') {
                            index++;
                        } else {
                            str = str.substr(index);
                            break;
                        }
                    };
                };
                return str;
            };
            /**************事件观点评述结束*****************/
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
                    };
                    planEventDetailService.transverseBar(information, 'mediaVolumeBar')
                });
            };
            /**
             * [showVolumeMediaEcharts description]显示事件声量趋势媒体声量的图表
             */
            $scope.showVolumeMediaEcharts = function() {
                if ($scope.status.volume.mediaEchartsShow) return;
                initVolumeLine('mediaVolumeLine');
                initVolumeMediaBar();
                $scope.status.volume.mediaEchartsShow = true;
            };
            /**
             * [hotWordsCompareSwitch description]网民热词对比切换标签
             */
            $scope.hotWordsCompareSwitch = function(methodname, left, right) {
                $scope.status.wordCloudTab = methodname;
                $scope.status.wordCloudUrlWithParams = {
                    left: $scope.status.wordCloudUrl + "&position=left&methodname=" + methodname + "&mediatype=" + left,
                    right: $scope.status.wordCloudUrl + "&position=right&methodname=" + methodname + "&mediatype=" + right,
                };
            };
            /**************事件声量趋势结束*****************/
            /**************媒体网民关注对比开始*****************/
            /**************媒体网民关注对比结束*****************/
            /**************事件观点对比开始*****************/
            /**
             * [netizenMedia description]网民VS媒体
             */
            function netizenMedia() {
                $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), $scope.data.opinion.netizenParams, 'get').then(function(netizenData) {
                    $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), $scope.data.opinion.mediaParams, 'get').then(function(mediaData) {
                        dealOpinionData(netizenData, 'netizenList', mediaData, 'mediaList');
                    });
                });
            };
            /**
             * [officialFolk description]官方VS民间
             */
            function officialFolk() {
                $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), $scope.data.opinion.officialParams, 'get').then(function(officialData) {
                    $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), $scope.data.opinion.folkParams, 'get').then(function(folkData) {
                        dealOpinionData(officialData, 'officialList', folkData, 'folkList');
                    });
                });
            };
            /**
             * [internalOutside description]集团VS外部
             */
            function internalOutside() {
                $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), $scope.data.opinion.internalParams, 'get').then(function(internalData) {
                    $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), $scope.data.opinion.outsideParams, 'get').then(function(outsideData) {
                        dealOpinionData(internalData, 'internalList', outsideData, 'outsideList');
                    });
                });
            };
            /**
             * [dealOpinionData description]处理观点数据
             */
            function dealOpinionData(data1, list1, data2, list2) {
                if (angular.isArray(data1) && angular.isArray(data2)) {
                    var maxValue = data1[0].cluster_nums >= data2[0].cluster_nums ? data1[0].cluster_nums : data2[0].cluster_nums;
                    angular.forEach(data1, function(value, key) {
                        var float = (value.cluster_nums / maxValue).toFixed(4);
                        value.width = float * 100 + '%';
                    });
                    $scope.status.opinion[list1] = data1;
                    angular.forEach(data2, function(value, key) {
                        var float = (value.cluster_nums / maxValue).toFixed(4);
                        value.width = float * 100 + '%';
                    });
                    $scope.status.opinion[list2] = data2;
                } else if (angular.isArray(data1) || angular.isArray(data2)) {
                    var trueData,
                        trueList,
                        maxValue;
                    if (angular.isArray(data1)) {
                        trueData = data1;
                        trueList = list1;
                        maxValue = data1[0].cluster_nums;
                    } else if (angular.isArray(data2)) {
                        trueData = data2;
                        trueList = list2;
                        maxValue = data2[0].cluster_nums;
                    }
                    angular.forEach(trueData, function(value, key) {
                        var float = (value.cluster_nums / maxValue).toFixed(4);
                        value.width = float * 100 + '%';
                    });
                    $scope.status.opinion[trueList] = trueData;
                } else {
                    return;
                }
            };
            /**************事件观点对比结束*****************/
            /**************事件热词对比开始*****************/
            /**************事件热词对比结束*****************/
            /**************情感瀑布图开始*****************/
            /**
             * [initEmotionFallsBar description]初始化情感瀑布图
             */
            function initEmotionFallsBar() {
                $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), $scope.data.emotionFalls.params, 'get').then(function(data) {
                    var xAxis = [],
                        arr = [],
                        information = {
                            xAxis: [],
                            yAxisName: '情感值',
                            transparentName: '透明辅助',
                            transparent: [],
                            redTopName: '红色正',
                            redTop: [],
                            redBottomName: '红色负',
                            redBottom: [],
                            blueTopName: '蓝色正',
                            blueTop: [],
                            blueBottomName: '蓝色负',
                            blueBottom: [],
                        };
                    angular.forEach(data, function(value, key) {
                        xAxis.unshift(value.DATE);
                        arr.unshift(Number(value.EMOTIONAL));
                    });
                    xAxis.shift();
                    information.xAxis = xAxis;
                    for (var i = 0; i < arr.length - 1; i++) {
                        if (arr[i + 1] > arr[i]) {
                            if (arr[i] >= 0 && arr[i + 1] >= 0) {
                                information.transparent.push(arr[i]);
                                information.redTop.push(arr[i + 1] - arr[i]);
                                information.redBottom.push('-');
                                information.blueTop.push('-');
                                information.blueBottom.push('-');
                            } else if (arr[i] < 0 && arr[i + 1] > 0) {
                                information.transparent.push('-');
                                information.redTop.push(arr[i + 1]);
                                information.redBottom.push(arr[i]);
                                information.blueTop.push('-');
                                information.blueBottom.push('-');
                            } else if (arr[i] < 0 && arr[i + 1] < 0) {
                                information.transparent.push(arr[i + 1]);
                                information.redTop.push('-');
                                information.redBottom.push(arr[i] - arr[i + 1]);
                                information.blueTop.push('-');
                                information.blueBottom.push('-');
                            }
                        } else if (arr[i + 1] < arr[i]) {
                            if (arr[i] >= 0 && arr[i + 1] >= 0) {
                                information.transparent.push(arr[i] - (arr[i] - arr[i + 1]));
                                information.redTop.push('-');
                                information.redBottom.push('-');
                                information.blueTop.push(arr[i] - arr[i + 1]);
                                information.blueBottom.push('-');
                            } else if (arr[i] >= 0 && arr[i + 1] < 0) {
                                information.transparent.push('-');
                                information.redTop.push('-');
                                information.redBottom.push('-');
                                information.blueTop.push(arr[i]);
                                information.blueBottom.push(arr[i + 1]);
                            } else if (arr[i] < 0 && arr[i + 1] < 0) {
                                information.transparent.push(arr[i]);
                                information.redTop.push('-');
                                information.redBottom.push('-');
                                information.blueTop.push('-');
                                information.blueBottom.push(arr[i + 1] - arr[i]);
                            }
                        } else if (arr[i + 1] == arr[i]) {
                            information.transparent.push('-');
                            information.redTop.push('-');
                            information.redBottom.push('-');
                            information.blueTop.push('-');
                            information.blueBottom.push('-');
                        }
                    }
                    planEventDetailService.waterFall(information, 'emotionFallsBar');
                });
            };
            /**************情感瀑布图结束*****************/
            /**************情感柱状图开始*****************/
            /**
             * [initEmotionColumnar description]初始化情感柱状图
             */
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
             * [wordCloudFresh description]刷新字符云
             */
            $scope.wordCloudFresh = function() {
                $('iframe').each(function(index) {
                    this.src = this.src;
                });
            };
            /**
             * [buildWatch description]创建监听，用于父页面和IFrame页面的通信
             */
            function buildWatch() {
                window.myWatch = {
                    left: true,
                    right: true
                };
                if (!window.myWatch.watch) {
                    window.myWatch.watch = function(prop, handler) {
                        var oldVal = this[prop]; //旧值
                        var nowVal = oldVal; //现值

                        if (delete this[prop]) {
                            this.__defineSetter__(prop, function(val) {
                                oldVal = nowVal;
                                nowVal = val;
                                handler(oldVal, val);
                            });
                            this.__defineGetter__(prop, function() {
                                return nowVal;
                            });
                        }
                    };
                }
                getHotWordsData("leftData");
                getHotWordsData("rightData");

                function getHotWordsData(position) {
                    window.myWatch.watch(position, function(oldVal, newVal) {
                        $scope.status[position] = newVal;
                    });
                }
            }
            /**
             * [distinct description]字符云去重
             */
            $scope.distinct = function() {
                window.myWatch.left = !window.myWatch.left;
                window.myWatch.right = !window.myWatch.right;
                distinct($scope.status.leftData, $scope.status.rightData);
            };
            /**
             * [distinct description]字符云去重
             */
            function distinct(left, right) {
                left = JSON.parse(left);
                right = JSON.parse(right);
                var i = left.length - 1;
                while (i >= 0) {
                    var leftData = left[i];
                    var j = right.length - 1;
                    while (j >= 0) {
                        var rightData = right[j];
                        if (leftData.STRVALUE === rightData.STRVALUE) {
                            left.splice(i, 1);
                            right.splice(j, 1);
                        }
                        j--;
                    }
                    i--;
                }
                //将处理好的数据给myWatch的set访问器，通过里面的loadEcharts()刷新Echarts
                window.myWatch.leftSetData = JSON.stringify(left);
                window.myWatch.rightSetData = JSON.stringify(right);
            }
        }
    ]);
