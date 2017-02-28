/*create by ma.rongqin 2016.6.27*/
"use strict";
angular.module('planCenCommandAppointNewTaskModule', ['appointTaskServiceModule'])
    .controller('planCenCommandAppointNewTaskCtrl', ['$scope', '$timeout', '$filter', '$validation', '$state', '$stateParams', '$compile', 'trsSelectItemByTreeService', 'trsspliceString', 'trsHttpService', 'trsconfirm','appointTaskService',
        function($scope, $timeout, $filter, $validation, $state, $stateParams, $compile, trsSelectItemByTreeService, trsspliceString, trsHttpService, trsconfirm,appointTaskService) {
            initStatus();
            initData();

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
                    type: 'task',
                    addressValue: {
                        lat: "",
                        lng: ""
                    },
                    taskId: $stateParams.taskid,
                    newTaskid: 0,
                    addressName: "",
                    isUrgentTypes:[]
                };
                $scope.data = {
                    choosedUser: []
                };
                $scope.params = {
                    /*taskId: 0,*/
                    IsUrgent: 0,
                    TaskType: 2,
                    TaskAddress: {
                        name: $scope.status.addressName,
                        value: $scope.status.addressValue
                    },
                    serviceid: "mlf_task",
                    methodname: "savePlanTask"
                };
                $scope.map = "";
                if (!$stateParams.taskid) {
                    //初始化地图
                    initMap();
                }
                initDropDownList();
            }
            /**
             * [initData description:初始化数据]
             */
            function initData() {
                if (angular.isDefined($stateParams.userid) && angular.isDefined($stateParams.username)) {
                    $scope.data.choosedUser = [{ USERNAME: $stateParams.username, ID: $stateParams.userid }];
                }
                if ($stateParams.taskid) {
                    getTaskDetail();
                }
            };
            /**
             * [initDropDownList description:初始化下拉菜单]
             */
            function initDropDownList() {
                $scope.status.isUrgentTypes = appointTaskService.initDropDownList().isUrgentTypes;
            }
            /**
             * [goNewEvent description:新建事件]
             */
            $scope.goNewEvent = function() {
                $state.go('plan.appointtask');
            };
            /**
             * [chooseUser description:选择接受人]
             */
            $scope.chooseUser = function() {
                trsSelectItemByTreeService.getUser(function(result) {
                    $scope.data.choosedUser = result;
                }, { rightFilter: false }, $scope.data.choosedUser);
            };
            /**
             * [back description:返回列表]
             */
            $scope.back = function() {
                if ($stateParams.reportid) {
                    $state.go("plantaskdetail", { taskid: $stateParams.taskid, reportid: $stateParams.reportid }, { reload: true });
                } else {
                    $state.go("plan.appointtask", "", { reload: true });
                }
            };
            /**
             * [IsUrgent description:是否谨记任务]
             */
            /*$scope.IsUrgent = function() {
                $scope.params.IsUrgent = $scope.params.IsUrgent === 0 ? 1 : 0;
            };*/
            /**
             * [confirm description:确认]
             */
            $scope.confirm = function() {
                $validation.validate($scope.newTaskForm).success(function() {
                    console.log($scope.data.choosedUser+"===="+$scope.data.choosedUser.length+"===");
                    if ($scope.data.choosedUser.length === 0) {
                        trsconfirm.alertType("请先选择接收人", "", "warning", false);
                        return;
                    }
                    var params = {
                        TaskAddress: "{" +
                            "\"name\":\"" + $scope.status.addressName + "\"," +
                            "\"value\":[\"" + $scope.status.addressValue.lat + "\",\"" + $scope.status.addressValue.lng +
                            "\"]}",
                        TaskUserIds: trsspliceString.spliceString($scope.data.choosedUser, "ID", ',')
                    };
                    $scope.params.TaskStartTime = $filter('date')($scope.params.TaskStartTime, 'yyyy-MM-dd');
                    $scope.params.TaskEndTime = $filter('date')($scope.params.TaskEndTime, 'yyyy-MM-dd');
                    angular.extend($scope.params, params);
                    if ($stateParams.taskid) {
                        $scope.params.methodname = "savePlanTaskByScreen";
                        $scope.params.ClueId = $stateParams.taskid;
                    } else {
                        $scope.params.taskId = 0;
                    }
                    if(typeof($scope.params.IsUrgent)!="number"){
                        $scope.params.IsUrgent = $scope.params.IsUrgent.value;
                    }
                    trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), $scope.params, "get").then(
                        function(data) {
                            trsconfirm.alertType("新建任务成功", "", "success", false, function() {
                                if ($scope.status.taskId) {
                                    //var newTaskid = parseInt(data.replace(/"/g, ""));
                                    //$state.go("plantaskdetail", { taskid: newTaskid });
                                    $state.go("plan.reportsummary", "", { reload: "plan.reportsummary" });
                                } else {
                                    $state.go("plan.appointtask", "", { reload: "plan.appointtask" });
                                }
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
                if ($scope.status.taskId) {
                    $state.go("plan.reportsummary");
                } else {
                    $state.go("plan.appointtask");
                }
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
                    var myIcon = new BMap.Icon("./planningCenter/command/task/appointTask/images/rw.png", new BMap.Size(30, 30));
                    $scope.map.addControl(new BMap.MapTypeControl()); //添加地图类型控件
                    if (angular.isDefined($stateParams.taskid)) {
                        var point = new BMap.Point($scope.status.addressValue[1], $scope.status.addressValue[0]);
                        mapLocation(point, myIcon, function() {
                            $scope.map.centerAndZoom(point, 11); // 初始化地图,设置中心点坐标和地图级别
                        });
                    } else {
                        $scope.map.setCurrentCity("杭州"); // 设置地图显示的城市 此项是必须设置的
                        $scope.map.centerAndZoom(new BMap.Point(120.219375, 30.259244), 11); // 初始化地图,设置中心点坐标和地图级别
                    }
                    $scope.map.enableScrollWheelZoom(true); //开启鼠标滚轮缩放
                    //动态加载搜索框指令
                    var mapSuggestion = "<map-suggestion required='false' type='status.type' callback='mapSearchCallback()' map='map' address-name='status.addressName' address-value='status.addressValue'></map-suggestion>";
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
                                    $scope.status.addressName = addComp.province + addComp.city + addComp.district + addComp.street + addComp.streetNumber;
                                    $scope.status.addressValue = point;
                                });
                            });
                        });
                    });
                });
            }
            /**
             * [getTaskDetail description获取初始化信息]
             * @return {[type]} [description]
             */
            function getTaskDetail() {
                var params = {
                    serviceid: "mlf_task",
                    methodname: "getPlanTask",
                    TaskId: $stateParams.taskid
                };
                trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get")
                    .then(function(data) {
                        $scope.data = data;
                        showData($scope.data);
                    });
            }
            /**
             * [showData description展示初始化信息]
             * @return {[type]} [description]
             */
            function showData(data) {
                $scope.params.Title = data.TITLE;
                $scope.data.choosedUser = [];//data.CHOOSEDUSER;
                $scope.params.IsUrgent = data.ISURGENT;

                $scope.params.TaskStartTime = $filter('date')(new Date(data.TASKSTARTTIME), 'yyyy-MM-dd');
                $scope.params.TaskEndTime = $filter('date')(new Date(data.TASKENDTIME), 'yyyy-MM-dd');
                $scope.params.TaskAddress = data.TASKADDRESS;
                $scope.status.addressName = $scope.params.TaskAddress.name;
                $scope.status.addressValue = $scope.params.TaskAddress.value;

                $scope.params.Content = data.CONTENT;
                //初始化地图
                initMap();
            }

            function mapLocation(point, myIcon, callback) {
                var marker = new BMap.Marker(point, { icon: myIcon });
                $scope.map.addOverlay(marker);
                if (angular.isFunction(callback)) {
                    callback();
                }
            }
        }
    ]);
