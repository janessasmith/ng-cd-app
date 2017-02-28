"use strict";
/**
 *  timeCueModule Module
 * report create hotevent
 */
angular.module('repCreEventModule', [])
    .controller('repCreEventController', ["$scope", "$q", "$state", "$filter", "$validation", "$stateParams", "trsHttpService", "trsconfirm", "calendarService", "SweetAlert", "plancenterService",
        function($scope, $q, $state, $filter, $validation, $stateParams, trsHttpService, trsconfirm, calendarService, SweetAlert, plancenterService) {
            initStatus();
            initData();

            function initStatus() {
                $scope.genParams = {
                    StartDocPubTime: new Date()
                };
                $scope.status = {
                    curDate: $scope.genParams.StartDocPubTime,
                    eventType: $stateParams.eventtype,
                    createType: $stateParams.createtype,
                    eventId: $stateParams.eventid,
                    reportId: $stateParams.reportId,
                    gotoUrl: "plan.dailyselection",
                    sourcetype: 0, //用于区分部门推荐
                };
                $scope.data = {
                    labels: "",
                    selectedLabels: [],
                    currEvent: ""
                };
            }

            function initData() {
                getLabels();
                requestData();
            }
            /**
             * [getLabels description获取标签]
             * @return {[type]} [description]
             */
            function getLabels() {
                var params = {
                    "user_id": 1,
                    "department": 1,
                    "typeid": "event",
                    "eventid": 0,
                    "serviceid": "eventmgr",
                    "modelid": "geteventlable"
                };
                trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), params, "get").then(function(data) {
                    $scope.data.labels = data;
                });
            }
            // /**
            //  * [getUrlInfo description获取返回的路由信息]
            //  * @return {[type]} [description]
            //  */
            // function getUrlInfo() {
            //     if ($stateParams.eventtype == 'personal' && $stateParams.createtype == 'manual') { //个人事件
            //         $scope.status.formTitle = $stateParams.eventid == 0 ? "新建个人事件" : "修改个人事件";
            //     } else if ($stateParams.eventtype == 'public' && $stateParams.createtype == 'manual') { //热门事件
            //         $scope.status.formTitle = $stateParams.eventid == 0 ? "新建热门事件" : "修改热门事件";
            //     } else if ($stateParams.eventtype == 'public' && $stateParams.createtype == 'recommendation') { //部门推荐
            //         $scope.status.formTitle = "添加到热门";
            //         $scope.status.sourcetype = 1;
            //     }
            //}
            /**
             * [description]
             * @param  {[type]} newValue  [description]
             * @param  {[type]} oldValue) {                       } [description]
             * @return {[type]}           [description]
             */
            $scope.$watch('genParams.StartDocPubTime', function(newValue, oldValue) {
                $scope.status.curDate = newValue;
            });

            /**
             * [selectMClass description选中、取消选中label]
             * @param  {[type]} item [description]
             * @return {[type]}      [description]
             */
            $scope.selectMClass = function(item) {
                if ($scope.data.selectedLabels.indexOf(item.LABLE) == -1) {
                    $scope.data.selectedLabels.push(angular.copy(item.LABLE));
                } else {
                    $scope.data.selectedLabels.splice($scope.data.selectedLabels.indexOf(item.LABLE), 1);
                }
            };

            /*
            获取事件详细信息(初始化事件信息)
             */
            function requestData() {
                if ($scope.status.eventId != 0) {
                    getEventDetailById();
                }
            }
            /**
             * [getEventDetailById description]
             * @return {[type]} [description]
             */
            function getEventDetailById() {
                var params = {
                    "user_id": 1,
                    "department": 1,
                    "typeid": "event",
                    "serviceid": $scope.status.eventId,
                };
                trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), params, "get").then(function(data) {
                    $scope.data.currEvent = data;
                    if ($scope.data.currEvent.LABEL != null) {
                        $scope.data.selectedLabels = $scope.data.currEvent.LABEL.split(";");
                    }
                    $scope.data.currEvent.STARTTIME = $filter("date")($scope.data.currEvent.STARTTIME, "yyyy-MM-dd");
                    $scope.status.curDate = $scope.data.currEvent.STARTTIME;
                    $scope.genParams.StartDocPubTime = $scope.data.currEvent.STARTTIME;
                });
            }
            // $scope.test = function() {
            //         swal({
            //             title: 'Ajax request example',
            //             text: 'Submit to run ajax request',
            //             type: 'info',
            //             showCancelButton: true,
            //             closeOnConfirm: false,
            //             disableButtonsOnConfirm: true,
            //             confirmLoadingButtonColor: '#DD6B55'
            //         }, function(inputValue) {
            //             setTimeout(function() {
            //                 swal('Ajax request finished!');
            //             }, 2000);
            //         });
            //     }
            //新建：点击确定
            $scope.confirm = function() {

                $validation.validate($scope.createHotEventSubmitForm).success(function() {
                    saveEvent(angular.copy($scope.data.currEvent), $scope.data.selectedLabels).then(function(data) {
                        $scope.status.eventid = data.REPORTS[0].EVENTID;
                        if (!$scope.status.eventid) {
                            trsconfirm.alertType('创建事件成功,自动关联失败,需手动关联。', "", "success", false, function() {
                                $scope.connetEvent();
                            });
                        } else {
                            plancenterService.invoke('saveReportsEvent', { ReportId: $scope.status.reportId, EventId: $scope.status.eventid }).then(function(res) {
                                trsconfirm.alertType('创建成功', "", "success", false, function() {
                                    $state.go("plan.dailyselection", { date: $stateParams.sourcedate, topicId: $stateParams.sourceId });
                                });
                            });
                        }
                    });

                }).error(function() {
                    trsconfirm.alertType('创建失败', "请检查填写项", "warning", false);
                });
            };

            //保存新建
            function saveEvent(currEvent, selectedLabels) {
                var defer = $q.defer();
                var params = currEvent;
                params.TYPEID = "event";
                params.EVENTTYPE = $stateParams.eventtype;
                params.ID = $stateParams.eventid.toString();
                /*if(selectedLabels.length<=0){
                    trsconfirm.alertType('请选择热门标签', "", "warning", false);
                    return;
                }*/
                if ($scope.status.sourcetype == 1) {
                    params.ID = 0;
                    params.SOURCETYPE = 1;
                    params.OLD_EVENTID = $stateParams.eventid.toString();
                }
                params.STARTTIME = $filter("date")($scope.status.curDate, "yyyy-MM-dd").toString();
                if (selectedLabels.length > 0) {
                    params.LABEL = $scope.data.selectedLabels.join(";");
                }
                //参数转小写转换
                for (var j in params) {
                    if (params[j] != null) {
                        params[j.toLowerCase()] = params[j];
                        delete params[j];
                    }
                }
                if (selectedLabels.length == 0) {
                    params.label = null;
                }
                $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), params, "post").then(function(data) {
                    defer.resolve(data);
                });
                return defer.promise;
            }

            //取消
            $scope.cancel = function() {
                gotoUrl();
            };

            function gotoUrl() {
                $state.go($scope.status.gotoUrl, "", { reload: true });
            }
            $scope.connetEvent = function() {
                $state.go("plan.dailyselection.connetEvent", { reportId: $stateParams.reportId, sourcedate: $stateParams.sourcedate, sourceId: $stateParams.sourceId });
            }
        }
    ]).controller('repConEventController', ["$scope", "$q", "$state", "$filter", "$validation", "$stateParams", "trsHttpService", "trsconfirm", "calendarService", "SweetAlert", "plancenterService",
        function($scope, $q, $state, $filter, $validation, $stateParams, trsHttpService, trsconfirm, calendarService, SweetAlert, plancenterService) {

            var params = {
                "typeid": "event",
                "eventid": 0,
                "event_type": 'public',
                "serviceid": "eventmgr",
                "modelid": "publicevent",
                "page_no": 0,
                "page_size": 10
            };
            var vm = $scope.vm = {
                reportId: $stateParams.reportId
            };

            $scope.cancel = function() {
                $state.go("plan.dailyselection", { date: $stateParams.sourcedate, topicId: $stateParams.sourceId });

            }
            $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), params, "get").then(function(data) {
                vm.events = data.CONTENT;
            });
            $scope.connetEventbyId = function(eventid) {
                plancenterService.invoke('saveReportsEvent', { ReportId: vm.reportId, EventId: eventid }).then(function(res) {
                    trsconfirm.alertType('关联成功', "", "success", false, function() {
                        $state.go("plan.dailyselection", { date: $stateParams.sourcedate, topicId: $stateParams.sourceId });
                    });
                });
            };

        }
    ]);
