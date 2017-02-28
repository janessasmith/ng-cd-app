// 路径配置
"use strict";
$(function() {
    require.config({
        paths: {
            echarts: '/mediacube/lib/echarts-2.2.7/build/dist'
        }
    });
    require(
        [
            'echarts',
            'echarts/chart/wordCloud' // 使用柱状图就加载bar模块，按需加载
        ],
        function(ec) {
            var myUrl = window.location.href;
            var toPosition = myUrl.substring(myUrl.indexOf("position"));
            var position = toPosition.substring(9, toPosition.indexOf("&"));
            var myData;
            // 基于准备好的dom，初始化echarts图表
            wordCloudVisual.initData(function(data) {
                myData = data;
                loadEcharts(myData);
            });

            function loadEcharts(data) {
                var myChart = ec.init(document.getElementById('main'));
                var option = {
                    title: {
                        //text: 'Google Trends',
                        //link: 'http://www.google.com/trends/hottrends'
                    },
                    tooltip: {
                        show: true
                    },
                    series: [{
                        name: '集团媒体',
                        type: 'wordCloud',
                        size: ['100%', '100%'],
                        textRotation: [0, 45, 90, -45],
                        textPadding: 0,
                        autoSize: {
                            enable: true,
                            minSize: 14
                        },
                    }]
                };
                option.series[0].data = wordCloudVisual.switchData(data);
                // 为echarts对象加载数据 
                myChart.setOption(option);
            }
            //存放Echats的数据
            window.parent.myWatch.watch(position, function(oldVal, newVal) {
                window.parent.myWatch[position + "Data"] = myData;
                //loadEcharts(myData);
            });
            //去重时用于重新刷新echats
            window.parent.myWatch.watch(position + "SetData", function(oldVal, newVal) {
                loadEcharts(newVal);
            });
        }
    );
});
