'use strict';
angular.module('reportModule', ["mapSuggestionForReportModule"]).
controller('createReportCtrl', function($scope, $timeout, $compile, $modalInstance, plancenterService, topic) {
    var ue;
    $scope.title = topic.CONTENT;
    $scope.close = function() {
        $modalInstance.dismiss();
    };
    LazyLoad.js(["./lib/ueditor2/ueditor.config.js?v=6.0", "./lib/ueditor2/ueditor.all.js?v=6.0"], function() {
        ue = UE.getEditor('reportEditer', {
            toolbars: [
                ['bold', 'italic', 'underline', 'strikethrough', '|', 'forecolor', 'fontsize', 'insertimage']
            ],
            zIndex: 2000,
            initialFrameHeight: 100
        });
    });
    initMap();
    $scope.submit = function() {
        var params = {
            TopicId: topic.TOPICID,
            Content: ue.getContent(),
            ReportId: 0,
            taskaddress: JSON.stringify({ name: $scope.addressName, value: [$scope.addressValue.lat, $scope.addressValue.lng] })
        };
        plancenterService.invoke('savePlanReport', params).then(
            function(data) {
                $modalInstance.close(data)
            });
    };

    function initMap() {
        window.BMap_loadScriptTime = (new Date()).getTime();
        LazyLoad.js(["http://api.map.baidu.com/getscript?v=2.0&ak=rZkn12K1F24d0vsTopn6s2NGcQ5HurgK&services=&t=20160627141851"], function() {
            // 百度地图API功能
            $scope.map = new BMap.Map("map", { minZoom: 5 }); // 创建Map实例
            var myIcon = new BMap.Icon("./planningCenter/command/task/appointTask/images/rw.png", new BMap.Size(30, 30));
            $scope.map.addControl(new BMap.MapTypeControl()); //添加地图类型控件
            /*if (angular.isDefined($stateParams.taskid)) {
                var point = new BMap.Point($scope.status.addressValue[1], $scope.status.addressValue[0]);
                mapLocation(point, myIcon, function() {
                    $scope.map.centerAndZoom(point, 11); // 初始化地图,设置中心点坐标和地图级别
                });
            } else {*/
            $scope.map.setCurrentCity("杭州"); // 设置地图显示的城市 此项是必须设置的
            $scope.map.centerAndZoom(new BMap.Point(120.219375, 30.259244), 11); // 初始化地图,设置中心点坐标和地图级别
            //  }
            $scope.map.enableScrollWheelZoom(true); //开启鼠标滚轮缩放
            //动态加载搜索框指令
            $scope.index = 0;
            $scope.addressName = "";
            $scope.addressValue = "";
            var mapSuggestion = "<map-suggestion-for-report myfocus='myFocus()' index='{{index}}' myblur='myblur()' map='map' address-name='addressName' address-value='addressValue'></map-suggestion-for-report>";
            mapSuggestion = $compile(mapSuggestion)($scope);
            $($(angular.element(document)).find('search')).append(mapSuggestion);
            var geoc = new BMap.Geocoder();
            //var myIcon = new BMap.Icon("./planningCenter/command/task/appointTask/images/rw.png", new BMap.Size(30, 30));
            $scope.map.addEventListener("click", function(e) {
                //alert(e.point.lng + "," + e.point.lat);
                $scope.map.clearOverlays(); //先清除所有覆盖物
                var point = e.point;
                mapLocation(point, myIcon, function() {
                    geoc.getLocation(point, function(rs) {
                        var addComp = rs.addressComponents;
                        $timeout(function() {
                            $scope.addressName = addComp.province + addComp.city + addComp.district + addComp.street + addComp.streetNumber;
                            $scope.addressValue = point;
                        });
                    });
                });
            });
        });
        $scope.myFocus = function() {
            //console.log("聚焦");
        };
        $scope.myblur = function() {
            //console.log("失焦");
        };
    }

    function mapLocation(point, myIcon, callback) {
        var marker = new BMap.Marker(point, { icon: myIcon });
        marker.myIndex = "0";
        $scope.map.addOverlay(marker);
        if (angular.isFunction(callback)) {
            callback();
        }
    }
}).controller('editReportCtrl', function($scope, $modalInstance, plancenterService, report, topicName) {
    $scope.title = topicName;
    $scope.content = report.CONTENT;
    $scope.close = function() {
        $modalInstance.dismiss();
    };
    $scope.submit = function() {
        var params = {
            TopicId: report.TOPICID,
            Content: $scope.content,
            ReportId: report.REPORTID
        };
        plancenterService.invoke('savePlanReport', params).then(
            function(data) {
                $modalInstance.close(data)
            });
    }
});
