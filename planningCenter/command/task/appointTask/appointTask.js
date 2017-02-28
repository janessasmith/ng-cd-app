/*create by ma.rongqin 2016.6.27*/
"use strict";
angular.module('planCenCommandAppointTaskModule', [
        'planCenCommandAppointTaskRouterModule',
        'planCenCommandAppointNewTaskModule',
        'planCenCommandAppointNewEventModule',
        'planCenCommandAppointTaskDetailModule',
        'trsBaiduMap',
        'appointTaskServiceModule'
    ])
    .controller('planCenCommandAppointTaskCtrl', ['$scope', '$interval', '$compile', '$q', '$state', '$filter', 'trsHttpService', 'trsspliceString', 'trsconfirm', 'appointTaskService', function($scope, $interval, $compile, $q, $state, $filter, trsHttpService, trsspliceString, trsconfirm, appointTaskService) {
        initStatus();
        initData();
        var map;
        var userLocationInfo;
        /**
         * [initStatus description:初始化状态]
         */
        function initStatus() {
            $scope.status = {
                batchOperateBtn: {
                    "hoverStatus": "",
                    "clickStatus": ""
                },
                page: {
                    CurrPage: 1,
                    PageSize: 20
                },
                taskStatusMap: appointTaskService.taskStatusMap(),
                btnRights: {}
            };
            $scope.params = {
                serviceid: "mlf_task",
                methodname: "queryOwnerPlanTasks",
                CurrPage: $scope.status.page.CurrPage,
                PageSize: $scope.status.page.PageSize,
                TaskType: 2
            };
            $scope.data = {
                selectedArray: [],
                items: { PAGER: { CURRPAGE: 1, PAGESIZE: 20, ITEMCOUNT: 0 }, DATA: [] }
            };
            initDropDownList();
            //根据截止日期过滤
            $scope.$watch("params.TaskEndTime", function(newV, oldV) {
                if (angular.isDefined(newV)) {
                    $scope.params.TaskEndTime = $filter("date")(newV, "yyyy-MM-dd");
                    requestData().then(function() {
                        map.clearOverlays();
                        initMap();
                    });
                }
                /*if (newV === "" || newV === oldV) return;
                $scope.params.TaskEndTime = $filter("date")(new Date(Date.parse(newV), "yyyy-MM-dd"));
                requestData();*/
            });
        }
        /**
         * [initData description:初始化数据]
         */
        function initData() {
            requestData().then(function() {
                //初始化地图
                initMap();
                quanxian();
            });
        }
        /**
         * [quanxian description] 查看权限
         * @return {[type]} [description]
         */
        function quanxian() {
            var deferred = $q.defer();
            var params = {
                methodname: 'queryOperKeysOfNormalModal',
                serviceid: 'mlf_metadataright',
                ModalName: '任务指令',
                Classify: 'rwzl.rwzp'
            };
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, 'get').then(function(data) {
                //处理返回数据
                angular.forEach(data, function(value, key) {
                    $scope.status.btnRights[value.OPERNAME] = value;
                });
            });
            return deferred.promise;
        }
        /**
         * [getUsersLocationInfo description:获取用户位置信息]
         */
        function getUsersLocationInfo() {
            var deffer = $q.defer();
            var params = {
                methodname: 'getUserPosition',
                serviceid: 'mlf_task',
            };
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get")
                .then(function(data) {
                    angular.forEach(data.DATA, function(data_, index_, array_) {
                        var position = data.DATA[index_].USERPOSITION = data.DATA[index_].USERPOSITION.split(",");
                        var iconUrl = "./planningCenter/command/task/appointTask/images/userlocation.png";
                        var point = new BMap.Point(parseFloat(position[0]), parseFloat(position[1]), 13);
                        var myIcon = new BMap.Icon(iconUrl, new BMap.Size(30, 30));
                        var marker = new BMap.Marker(point, { icon: myIcon });
                        marker.user = { userid: data_.USERID, username: data_.USERNAME, mobile: data_.MOBILE };
                        creatMenu(marker);
                        map.addOverlay(marker);
                        var label = new BMap.Label("<div id='userInfo_" + data_.USERID + "' class='userInfo'>" + data_.USERNAME + "</div>", { offset: new BMap.Size(20, 20) });
                        marker.addEventListener("mouseover", function() {
                            this.setLabel(label);
                        });
                        marker.addEventListener("mouseout", function() {
                            $("#userInfo_" + this.user.userid).parent().remove();
                        });
                    });
                    userLocationInfo = data.DATA;
                    getDistance();
                    deffer.resolve(data);
                });
            return deffer.promise;
        }

        function creatMenu(marker) {
            var markerMenu = new BMap.ContextMenu();
            markerMenu.addItem(new BMap.MenuItem('创建任务', createTaskByUser.bind(marker)));
            markerMenu.addItem(new BMap.MenuItem(marker.user.mobile, createTaskByUser.bind(marker)));
            marker.addContextMenu(markerMenu);
        }
        /**
         * [createTaskByUser description:通过用户创建任务]
         * @param  {[string]} className [description] label子div的classname
         * @return {[type]}      [description] null
         */
        function createTaskByUser(e, ee, marker) {
            $state.go("plan.appointtask.newtask", { userid: marker.user.userid, username: marker.user.username }, { reload: true });
        }
        /**
         * [initDropDownList description:初始化下拉菜单]
         */
        function initDropDownList() {
            /*$scope.status.appointTypes = appointTaskService.initDropDownList().appointTypes;*/
            $scope.status.appointStatuses = appointTaskService.initDropDownList().appointStatuses;
            $scope.status.searchTypes = appointTaskService.initDropDownList().searchTypes;
            $scope.status.searchType = $scope.status.searchTypes[0];
        }
        /**
         * [chooseDropList description:选中下拉菜单回调]
         */
        $scope.chooseDropList = function(type) {
            $scope.params[type] = $scope.status[type].value;
            requestData().then(function() {
                map.clearOverlays();
                initMap();
            });
        };
        /**
         * [delete description:收回]
         */
        $scope.delete = function() {
            trsconfirm.inputModel("是否确认收回", "收回：原因（可选）", function(content) {
                var params = {
                    serviceid: "mlf_task",
                    methodname: "removePlanTask",
                    TaskIds: trsspliceString.spliceString($scope.data.selectedArray, "TASKID", ',')
                };
                $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get")
                    .then(function() {
                        trsconfirm.alertType("收回任务/事件成功！", "", "success", false);
                        requestData().then(function() {
                            map.clearOverlays();
                            initMap();
                            $scope.data.selectedArray = [];
                        });
                    });
            });
        };
        /**
         * [selectDoc description:选择事件或任务]
         */
        $scope.selectDoc = function(item) {
            if ($scope.data.selectedArray.indexOf(item) >= 0) {
                $scope.data.selectedArray.splice($scope.data.selectedArray.indexOf(item), 1);
            } else {
                $scope.data.selectedArray.push(item);
            }
        };
        /**
         * [selectAll description:全选]
         */
        $scope.selectAll = function() {
            $scope.data.selectedArray = $scope.data.selectedArray.length === $scope.data.items.DATA.length ? [] : $scope.data.items.DATA;
        };
        /**
         * [initData description:显示接收人详情]
         */
        $scope.showUser = function(item, ev, popupwidth) {
            if (item.TASKUSERNAME.indexOf(",") <= 0)
                return;
            if (document.body.offsetWidth - ev.clientX > popupwidth) {
                item.panelpostion = {
                    left: ev.offsetX
                };
            } else {
                item.panelpostion = {
                    left: 110
                };
            }
            item.isShowUser = true;
        };
        /**
         * [search description:搜索]
         */
        $scope.search = function() {
            if (angular.isUndefined($scope.status.searchCondition) || $scope.status.searchCondition === "") {
                trsconfirm.alertType("请先输入检索词", "", "warning", false);
                return;
            }
            $scope.status.page.CurrPage = 1;
            $scope.requestData();
        };
        /**
         * [enterSearch description:回车搜索]
         */
        $scope.enterSearch = function(event) {
            if (event.keyCode === 13)
                $scope.search();
        };
        /**
         * [requestData description:刷新列表]
         */
        $scope.requestData = function() {
            requestData().then(function() {
                map.clearOverlays();
                initMap();
            });
        };

        function requestData() {
            $scope.params.CurrPage = angular.copy($scope.status.page.CurrPage);
            var deffer = $q.defer();
            if ($scope.status.searchType.value === "title") {
                delete $scope.params.Content;
                $scope.params.Title = $scope.status.searchCondition;
            } else {
                delete $scope.params.Title;
                $scope.params.Content = $scope.status.searchCondition;
            }
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), $scope.params, "get")
                .then(function(data) {
                    deffer.resolve();
                    $scope.data.items = data;
                    $scope.status.page = data.PAGER;
                    $scope.status.page.CurrPage = data.PAGER.CURRPAGE > data.PAGER.PAGECOUNT ? data.PAGER.PAGECOUNT : data.PAGER.CURRPAGE;
                    $scope.status.page.CurrPageCopy = data.PAGER.CURRPAGE > data.PAGER.PAGECOUNT ? data.PAGER.PAGECOUNT : data.PAGER.CURRPAGE;
                });
            return deffer.promise;
        }
        /**
         * [getIsUrgent description 获取当前标识描述]
         * @param  {[type]} item [description]
         * @return {[type]}      [description]
         */
        $scope.getIsUrgent = function(item) {
            var isUrgent = item.ISURGENT;
            switch (isUrgent) {
                case '1':
                    item.ISURGENT = '紧急';
                    break;
                case '2':
                    item.ISURGENT = '重要';
                    break;
                case '3':
                    item.ISURGENT = '敏感';
                    break;
                default:
                    item.ISURGENT = '普通';
            }
        };
        /**
         * [handleDate description:处理日期]
         */
        $scope.handleDate = function(date, format) {
            return date === "" ? "" : $filter("date")(new Date(Date.parse(date)), format).toString();
        };

        $scope.jumpToPage = function() {
            $scope.status.page.CurrPage = $scope.status.page.CurrPageCopy;
            requestData();
        };
        /**
         * [goNewTask description:新建任务]
         */
        $scope.goNewTask = function() {
            $state.go('plan.appointtask.newtask');
        };
        /**
         * [goNewEvent description:新建事件]
         */
        $scope.goNewEvent = function() {
            $state.go('plan.appointtask.newevent');
        };
        /**
         * [initMap description:初始化地图]
         */
        function initMap() {
            window.BMap_loadScriptTime = (new Date()).getTime();
            LazyLoad.js(["http://api.map.baidu.com/getscript?v=2.0&ak=rZkn12K1F24d0vsTopn6s2NGcQ5HurgK&services=&t=20160627141851"], function() {
                // 百度地图API功能
                map = new BMap.Map("allmap", { minZoom: 5, maxZoom: 18 }); // 创建Map实例
                map.centerAndZoom(new BMap.Point(120.219375, 30.259244), 11); // 初始化地图,设置中心点坐标和地图级别
                map.addControl(new BMap.MapTypeControl()); //添加地图类型控件
                map.setCurrentCity("杭州"); // 设置地图显示的城市 此项是必须设置的
                map.enableScrollWheelZoom(true); //开启鼠标滚轮缩放
                getCoordinateIcon();
                getUsersLocationInfo();
            });

        }
        /**
         * [getCoordinateIcon description:获取坐标小图标]
         */
        function getCoordinateIcon() {
            var tempArray = [];
            for (var i = $scope.data.items.DATA.length - 1; i >= 0; i--) {
                tempArray.push(angular.copy($scope.data.items.DATA[i]));
            }
            $scope.data.items.DATACOPY = tempArray;
            angular.forEach($scope.data.items.DATACOPY, function(data, index, array) {
                var title = data.TITLE;
                var iconUrl = data.TASKTYPE === '2' ? "./planningCenter/command/task/appointTask/images/rw.png" : "./planningCenter/command/task/appointTask/images/xs.png";
                if (data.TASKADDRESS.value[1] !== "") {
                    var point = new BMap.Point(parseFloat(data.TASKADDRESS.value[1]), parseFloat(data.TASKADDRESS.value[0]), 13);
                    var myIcon = new BMap.Icon(iconUrl, new BMap.Size(30, 30));
                    var marker = new BMap.Marker(point, { icon: myIcon });
                    if (data.TASKTYPE === '2') marker.setTop(true);
                    marker.taskid = data.TASKID;
                    map.addOverlay(marker);
                    marker.addEventListener("click", function() {
                        window.open("/mediacube/#/plantaskdetai?taskid=" + this.taskid);
                    });
                    var label = new BMap.Label("<div id='taskid_" + data.TASKID + "' class='taskLabelFix' style='width:80px'><marquee loop='-1' scrolldelay='10' scrollamount='3' direction='left'>" + data.TITLE + "</marquee></div>", { offset: new BMap.Size(20, -10) });
                    marker.addEventListener("mouseover", function() {
                        this.setLabel(label);
                    });
                    marker.addEventListener("mouseout", function() {
                        $("#taskid_" + this.taskid).parent().remove();
                    });
                }
            });
        }
        /**
         * [addLabelClick description:添加标签事件]
         */
        //
        function getDistance() {
            angular.forEach($scope.data.items.DATA, function(data, index, array) {
                if (data.TASKTYPE === "2" && data.TASKADDRESS.value[1] !== "") {
                    angular.forEach(userLocationInfo, function(data_, index_, array_) {
                        if (data.TASKID === data_.TASKID) {
                            var pointA = new BMap.Point(parseFloat(data.TASKADDRESS.value[1]), parseFloat(data.TASKADDRESS.value[0]));
                            var pointB = new BMap.Point(parseFloat(data_.USERPOSITION[0]), parseFloat(data_.USERPOSITION[1]));
                            var polyline = new BMap.Polyline([pointA, pointB], { strokeColor: "blue", strokeWeight: 2, strokeOpacity: 1 });
                            map.addOverlay(polyline);
                        }
                    });
                }
            });
        }
        var timedRefresh = $interval(getUsersLocationInfo, 60000); //定时刷新列表，实时显示人员位置
        $scope.$on('$destroy', function() { //销毁定时器
            $interval.cancel(timedRefresh);
        });
    }]);
