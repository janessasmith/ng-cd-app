/*create by ma.rongqin 2016.6.27*/
"use strict";
angular.module('planCenCommandAppointNewEventModule', [])
    .controller('planCenCommandAppointNewEventCtrl', ['$scope', '$timeout', '$filter', '$validation', '$state', '$compile', 'trsSelectItemByTreeService', 'trsspliceString', 'trsHttpService', 'trsconfirm', function($scope, $timeout, $filter, $validation, $state, $compile, trsSelectItemByTreeService, trsspliceString, trsHttpService, trsconfirm) {
        initStatus();
        /**
         * [initStatus description:初始化状态]
         */
        function initStatus() {
            $scope.status = {
                batchOperateBtn: {
                    "hoverStatus": "",
                    "clickStatus": ""
                },
                fromDate: "",
                untilDate: "",
                suggestionShow: false,
                isVoice: false,
                isTaping: false,
                type: 'event',
                addressValue: {
                    lat: "",
                    lng: ""
                }
            };
            $scope.data = {};
            $scope.params = {
                taskId: 0,
                IsUrgent: 0,
                Flag: 0,
                TaskType: 1,
                TaskAddress: {
                    name: $scope.status.addressName,
                    value: $scope.status.addressValue
                },
                serviceid: "mlf_task",
                methodname: "savePlanTask"
            };
            //初始化地图
            initMap();
        }
        /**
         * [back description:返回列表]
         */
        $scope.back = function() {
            $state.go("plan.appointtask", "", { reload: true });
        };
        /**
         * [IsUrgent description:是否谨记任务]
         */
        $scope.IsUrgent = function() {
            $scope.params.IsUrgent = $scope.params.IsUrgent === 0 ? 1 : 0;
        };
        $scope.IsSendToEveryone = function() {
            $scope.params.Flag = $scope.params.Flag === 0 ? 1 : 0;
        };
        /**
         * [confirm description:确认]
         */
        $scope.confirm = function() {
            $validation.validate($scope.newTaskForm).success(function() {
                var params = {
                    TaskAddress: "{" +
                        "\"name\":\"" + $scope.status.addressName + "\"," +
                        "\"value\":[\"" + $scope.status.addressValue.lat + "\",\"" + $scope.status.addressValue.lng +
                        "\"]}"
                };
                $scope.params.TaskStartTime = $filter('date')($scope.params.TaskStartTime, 'yyyy-MM-dd');
                $scope.params.TaskEndTime = $filter('date')($scope.params.TaskEndTime, 'yyyy-MM-dd');
                angular.extend($scope.params, params);
                trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), $scope.params, "get").then(
                    function() {
                        trsconfirm.alertType("新建线索成功", "", "success", false, function() {
                            $state.go("plan.appointtask", "", { reload: "plan.appointtask" });
                        });
                    });
            }).error(function() {
                if (angular.isDefined($scope.newTaskForm.$error.addressValue)) {
                    trsconfirm.alertType("地图未定位到您输入的地址，请检查", "", "warning", false);
                }
            });
            /*$scope.params.concat(params);
            console.log();*/
        };
        $scope.cancel = function() {
            $state.go("plan.appointtask");
        };
        /**
         * [mapSearchCallback description:地图搜索回调函数]
         */
        $scope.mapSearchCallback = function() {
            $(document).scrollTop(9999);
        };

        function initMap() {
            window.BMap_loadScriptTime = (new Date()).getTime();
            LazyLoad.js(["http://api.map.baidu.com/getscript?v=2.0&ak=rZkn12K1F24d0vsTopn6s2NGcQ5HurgK&services=&t=20160627141851"], function() {
                // 百度地图API功能
                $scope.map = new BMap.Map("map", { minZoom: 5 }); // 创建Map实例
                $scope.map.centerAndZoom(new BMap.Point(120.219375, 30.259244), 11); // 初始化地图,设置中心点坐标和地图级别
                $scope.map.addControl(new BMap.MapTypeControl()); //添加地图类型控件
                $scope.map.setCurrentCity("杭州"); // 设置地图显示的城市 此项是必须设置的
                $scope.map.enableScrollWheelZoom(true); //开启鼠标滚轮缩放
                //动态加载搜索框指令
                var mapSuggestion = "<map-suggestion required='true' type='status.type' callback='mapSearchCallback()' map='map' address-name='status.addressName' address-value='status.addressValue'></map-suggestion>";
                mapSuggestion = $compile(mapSuggestion)($scope);
                $($(angular.element(document)).find('search')).append(mapSuggestion);
                var geoc = new BMap.Geocoder();
                $scope.map.addEventListener("click", function(e) {
                    //alert(e.point.lng + "," + e.point.lat);
                    $scope.map.clearOverlays(); //先清除所有覆盖物
                    var myIcon = new BMap.Icon("./planningCenter/command/task/appointTask/images/xs.png", new BMap.Size(30, 30));
                    var point = new BMap.Point(e.point.lng, e.point.lat);
                    var marker = new BMap.Marker(point, { icon: myIcon });
                    $scope.map.addOverlay(marker);
                    geoc.getLocation(e.point, function(rs) {
                        var addComp = rs.addressComponents;
                        $timeout(function() {
                            $scope.status.addressName = addComp.province + addComp.city + addComp.district + addComp.street + addComp.streetNumber;
                            $scope.status.addressValue = point;
                        });
                    });
                });
            });
        }
    }]);
