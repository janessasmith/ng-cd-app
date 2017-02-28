'use strict';
/**
 *  Module  纸媒头版柱状图
 *  createBy Ly
 *  time:2016/3/13
 * Description
 */
angular.module('topNewsPaperColumnarDirModule', []).directive('columnarDir', ['$q', 'initHotHead', '$timeout', 'trsHttpService', function($q, initHotHead, $timeout, trsHttpService) {
    // Runs during compile
    return {
        restrict: 'E',
        replace: true,
        template: "<div ng-style=\"myStyle\" ng-click=\"request(params)\"></div>",
        scope: {
            optionJsons: "=",
            newspaperlistDetail: '=',
            queryNewsPaper: "&",
            channel: "="
        },
        link: function(scope, iElement, iAttrs) {
            $timeout(function() {
                scope.myStyle = {
                    height: '415px',
                    width: '1080px'
                };
                var option = initHotHead.initTopNewspaperOption();
                option.xAxis[0].data = angular.copy(scope.optionJsons).name;
                // option.series[0].data = angular.copy(scope.optionJsons).data;
                option.series[0].data = [];
                angular.forEach(scope.optionJsons.data, function(dataValue, key) {
                    option.series[0].data.push({ value: dataValue, itemStyle: { normal: { color: key == 0 ? '#C23531' : '#2f98d2' } } })
                });
                require(['echarts'], function(echarts) {
                    var myChart = echarts.init(iElement[0]);
                    myChart.setOption(option);
                    var emitType = {
                        'newspaper': "planNewsDetailList",
                        'website': "planWebDetailList"
                    };

                    function request(params) {
                        // params.color = 'green';
                        var originalOption = myChart._api.getOption();
                        angular.forEach(originalOption.series[0].data, function(value, key) {
                            value.itemStyle.normal.color = "#2f98d2";
                        });
                        originalOption.series[0].data[params.dataIndex].itemStyle.normal.color = '#C23531';
                        myChart.setOption(originalOption);
                        scope.newspaperlistDetail = params;
                        scope.newspaperlistDetail.guids = angular.copy(scope.optionJsons).guids[params.dataIndex];
                        scope.newspaperlistDetail.sids = angular.copy(scope.optionJsons).sids[params.dataIndex];
                        scope.newspaperlistDetail.ids = angular.copy(scope.optionJsons).ids[params.dataIndex];
                        scope.$emit(emitType[scope.channel], scope.newspaperlistDetail);
                    }
                    myChart.on("click", request);
                    scope.$watch("optionJsons", function(newValue, oldValue, scope) {
                        option.xAxis[0].data = angular.copy(scope.optionJsons).name;
                        // option.series[0].data = angular.copy(scope.optionJsons).data;
                        option.series[0].data = [];
                        angular.forEach(scope.optionJsons.data, function(dataValue, key) {
                            option.series[0].data.push({ value: dataValue, itemStyle: { normal: { color: key == 0 ? '#C23531' : '#2f98d2' } } })
                        });
                        myChart.setOption(option, true);
                    });
                });
            }, 500);
        }
    };
}]);
