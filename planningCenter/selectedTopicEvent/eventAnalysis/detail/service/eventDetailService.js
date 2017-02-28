/*create by ma.rongqin 2016-7-15*/
"use strict";
angular.module('planEventDetailServiceModule', [])
    .factory('planEventDetailService', ['$filter', '$q', '$modal', 'trsHttpService', function($filter, $q, $modal, trsHttpService) {
        return {
            //点击编辑弹窗
            editEvent: function(data, addAddress) {
                if (angular.isDefined(addAddress)) {
                    data.PLACE.push({ name: "", value: "", searchName: addAddress });
                }
                var defer = $q.defer();
                var modalInstance = $modal.open({
                    templateUrl: "./planningCenter/selectedTopicEvent/eventAnalysis/detail/service/editEvent/editEvent_tpl.html",
                    windowClass: 'eventAnalysis-editEvent-window',
                    backdrop: false,
                    controller: "editEventCtrl",
                    resolve: {
                        /*userid: function() {
                            return userid;
                        },
                        whichTabShow: function() {
                            return whichTabShow;
                        }*/
                        data: function() {
                            return data;
                        }
                    }
                });
                modalInstance.result.then(function(result) {
                    defer.resolve(result);
                }, function() {
                    defer.reject("cancel");
                });
                return defer.promise;
            },
            lineEcharts: function(title, data, elementClass) {
                require(['echarts', './lib/echarts/dist/echarts.min'], function(echarts) {
                    var option = {
                        title: {
                            text: ''
                        },
                        tooltip: {
                            trigger: 'axis'
                        },
                        legend: {
                            data: data.legend
                        },
                        grid: {
                            left: '3%',
                            right: '10%',
                            bottom: '16%',
                            containLabel: true
                        },
                        dataZoom: [{
                            id: 'dataZoomX',
                            type: 'slider',
                            xAxisIndex: [0],
                            filterMode: 'filter', // 设定为 'filter' 从而 X 的窗口变化会影响 Y 的范围。
                            start: 0,
                            end: 100,
                        }, ],
                        xAxis: {
                            type: 'category',
                            boundaryGap: false,
                            data: data.xAxis
                        },
                        yAxis: {
                            type: 'value',
                            splitArea: { show: 'show' },
                        },
                        series: data.series
                    };
                    var myChart = echarts.init(document.getElementsByClassName(elementClass)[0]);
                    myChart.setOption(option);
                });
            },
            pieEcharts: function(data, elementClass) {
                require(['echarts', './lib/echarts/dist/echarts.min'], function(echarts) {
                    var option = {
                        tooltip: {
                            trigger: 'item',
                            formatter: "{b} : {c} ({d}%)"
                        },
                        series: [{
                            name: data.name, //'访问来源'
                            type: 'pie',
                            radius: '60%',
                            center: ['50%', '50%'],
                            data: data.data,
                            itemStyle: {
                                emphasis: {
                                    shadowBlur: 10,
                                    shadowOffsetX: 0,
                                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                                }
                            }
                        }]
                    };
                    var myChart = echarts.init(document.getElementsByClassName(elementClass)[0]);
                    myChart.setOption(option);
                });
            },
            transverseBar: function(data, elementClass) {
                require(['echarts', './lib/echarts/dist/echarts.min'], function(echarts) {
                    var option = {
                        tooltip: {
                            trigger: 'axis',
                            axisPointer: {
                                type: 'shadow'
                            }
                        },
                        grid: {
                            left: '3%',
                            right: '4%',
                            bottom: '3%',
                            containLabel: true
                        },
                        xAxis: {
                            type: 'value',
                            boundaryGap: [0, 0.01],
                            splitLine: {
                                show: false
                            },
                            axisLine: {
                                show: false
                            },
                            axisTick: {
                                show: false
                            },
                            axisLabel: {
                                show: false
                            }
                        },
                        yAxis: {
                            type: 'category',
                            data: data.yAxis,
                            axisLine: {
                                show: false
                            },
                            axisTick: {
                                show: false
                            },
                        },
                        series: [{
                            name: data.name,
                            type: 'bar',
                            data: data.data,
                        }]
                    };
                    var myChart = echarts.init(document.getElementsByClassName(elementClass)[0]);
                    myChart.setOption(option);
                });
            },
            contrastBar: function(data, elementClass) {
                require(['echarts', './lib/echarts/dist/echarts.min'], function(echarts) {
                    var option = {
                        backgroundColor: '#fff',
                        tooltip: {
                            trigger: "xAxis",
                            formatter: function(params) {
                                return params[0].seriesName + ' : ' + Math.abs(params[0].value) + '<br/>' + params[1].seriesName + ' : ' + Math.abs(params[1].value);
                            },
                        },
                        xAxis: {
                            data: data.xAxis,
                            silent: false,
                            axisLine: { onZero: true },
                            splitLine: { show: false },
                        },
                        yAxis: {
                            name: data.yAxisName,
                            splitLine: { show: false },
                            type: "value",
                            axisLabel: {
                                formatter: function(value, index) {
                                    return Math.abs(value);
                                }
                            }
                        },
                        dataZoom: [{
                            id: 'dataZoomX',
                            type: 'slider',
                            xAxisIndex: [0],
                            filterMode: 'filter', // 设定为 'filter' 从而 X 的窗口变化会影响 Y 的范围。
                            start: 0,
                            end: 100,
                        }, ],
                        grid: {
                            left: 100,
                            bottom: '19%',
                        },
                        series: [{
                            name: data.topName,
                            type: 'bar',
                            stack: 'one',
                            data: data.topData,
                            itemStyle: {
                                'normal': {
                                    color: data.topColor,
                                }
                            },
                            barMaxWidth:'50',
                        }, {
                            name: data.bottomName,
                            type: 'bar',
                            stack: 'one',
                            data: data.bottomData,
                            itemStyle: {
                                'normal': {
                                    color: data.bottomColor,
                                }
                            },
                            barMaxWidth:'50',
                        }]
                    };
                    var myChart = echarts.init(document.getElementsByClassName(elementClass)[0]);
                    myChart.setOption(option);
                });
            },
            waterFall: function(data, elementClass) {
                require(['echarts', './lib/echarts/dist/echarts.min'], function(echarts) {
                    var option = {
                        tooltip: {
                            show: true,
                            trigger: 'axis',
                            axisPointer: { // 坐标轴指示器，坐标轴触发有效
                                type: 'line' // 默认为直线，可选为：'line' | 'shadow'
                            },
                            formatter: function(params) {
                                var today,
                                    yestoday,
                                    change;
                                if (params[0].value != '-' && params[1].value != '-') {
                                    today = params[0].value + params[1].value;
                                    yestoday = params[0].value;
                                } else if (params[0].value != '-' && params[2].value != '-') {
                                    today = params[0].value;
                                    yestoday = params[0].value + params[2].value;
                                } else if (params[0].value != '-' && params[3].value != '-') {
                                    today = params[0].value;
                                    yestoday = params[0].value + params[3].value;
                                } else if (params[0].value != '-' && params[4].value != '-') {
                                    today = params[0].value + params[4].value;
                                    yestoday = params[0].value;
                                } else if (params[1].value != '-' && params[2].value != '-') {
                                    today = params[1].value;
                                    yestoday = params[2].value;
                                } else if (params[3].value != '-' && params[4].value != '-') {
                                    today = params[4].value;
                                    yestoday = params[3].value;
                                }
                                change = today - yestoday;
                                if (change >= 0) change = '+' + change;
                                if (!today && !yestoday) {
                                    today = '无变化';
                                    yestoday = '无变化';
                                    change = "无变化";
                                }
                                return '今日：' + today + '<br/>' + '昨日：' + yestoday + '<br/>' + '变化：' + change;
                            }
                        },
                        grid: {
                            left: '3%',
                            right: '4%',
                            bottom: '19%',
                            containLabel: true
                        },
                        xAxis: {
                            type: 'category',
                            splitLine: { show: false },
                            data: data.xAxis
                        },
                        dataZoom: [{
                            id: 'dataZoomX',
                            type: 'slider',
                            xAxisIndex: [0],
                            filterMode: 'filter', // 设定为 'filter' 从而 X 的窗口变化会影响 Y 的范围。
                            start: 0,
                            end: 100,
                        }, ],
                        yAxis: {
                            type: 'value',
                            name: data.yAxisName,
                            splitLine: { show: false },
                        },
                        series: [{
                            name: data.transparentName,
                            type: 'bar',
                            stack: '总量',
                            itemStyle: {
                                normal: {
                                    barBorderColor: 'rgba(0,0,0,0)',
                                    color: 'rgba(0,0,0,0)'
                                },
                                emphasis: {
                                    barBorderColor: 'rgba(0,0,0,0)',
                                    color: 'rgba(0,0,0,0)'
                                }
                            },
                            barMaxWidth:'50',
                            data: data.transparent
                        }, {
                            name: data.redTopName,
                            type: 'bar',
                            stack: '总量',
                            label: {
                                normal: {
                                    show: false,
                                    position: 'top'
                                }
                            },
                            itemStyle: {
                                'normal': {
                                    color: '#E44156',
                                }
                            },
                            barMaxWidth:'50',
                            data: data.redTop
                        }, {
                            name: data.redBottomName,
                            type: 'bar',
                            stack: '总量',
                            label: {
                                normal: {
                                    show: false,
                                    position: 'top'
                                }
                            },
                            itemStyle: {
                                'normal': {
                                    color: '#E44156',
                                }
                            },
                            barMaxWidth:'50',
                            data: data.redBottom
                        }, {
                            name: data.blueTopName,
                            type: 'bar',
                            stack: '总量',
                            label: {
                                normal: {
                                    show: false,
                                    position: 'bottom'
                                }
                            },
                            itemStyle: {
                                'normal': {
                                    color: '#2DC4CB',
                                }
                            },
                            barMaxWidth:'50',
                            data: data.blueTop
                        }, {
                            name: data.blueBottomName,
                            type: 'bar',
                            stack: '总量',
                            label: {
                                normal: {
                                    show: false,
                                    position: 'bottom'
                                }
                            },
                            itemStyle: {
                                'normal': {
                                    color: '#2DC4CB',
                                }
                            },
                            barMaxWidth:'50',
                            data: data.blueBottom
                        }]
                    };
                    var myChart = echarts.init(document.getElementsByClassName(elementClass)[0]);
                    myChart.setOption(option);
                });
            },
            timeOption: function() {
                var option = [{
                    'name': '全部',
                    'value': '',
                }, {
                    'name': '今天',
                    'value': '1',
                }, {
                    'name': '最近三天',
                    'value': '2',
                }, {
                    'name': '最近一周',
                    'value': '3',
                }, {
                    'name': '最近两周',
                    'value': '4',
                }, {
                    'name': '最近一个月',
                    'value': '5',
                }, {
                    'name': '最近一年',
                    'value': '6',
                }];
                return option;
            }
        };
    }]);
