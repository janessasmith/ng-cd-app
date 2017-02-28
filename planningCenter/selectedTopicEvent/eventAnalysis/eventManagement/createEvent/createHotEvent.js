"use strict";
/** 
 * Description 指挥中心报题关联事件 
 */
angular.module('createHotEventModule', [])
    .controller('createHotEventController', ["$scope", "$q", "$state", "$filter", "$validation", "$stateParams", "trsHttpService", "trsconfirm", "calendarService",
        function($scope, $q, $state, $filter, $validation, $stateParams, trsHttpService, trsconfirm, calendarService) {
            initStatus();
            initData();

            function initStatus() {
                $scope.genParams = {
                    StartDocPubTime: new Date(),
                    EndDocPubTime: null
                };
                $scope.status = {
                    curDate: $scope.genParams.StartDocPubTime,
                    eventType: $stateParams.eventtype,
                    createType: $stateParams.createtype,
                    eventId: $stateParams.eventid,
                    gotoUrl: "",
                    formTitle: "",
                    sourcetype: 0, //用于区分部门推荐
                    okToCreate: false, //表单按钮可以提交,
                    endDate: $scope.genParams.EndDocPubTime,
                    endDateVal: null
                };
                $scope.data = {
                    labels: "",
                    selectedLabels: [],
                    currEvent: ""
                };
            }

            function initData() {
                getLabels();
                getUrlInfo();
                requestData();
            }
            /**
             * [getLabels description获取标签]
             * @return {[type]} [description]
             */
            function getLabels() {
                var params = {
                    "typeid": "event",
                    "eventid": 0,
                    "serviceid": "eventmgr",
                    "modelid": "geteventlable"
                };
                trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), params, "get").then(function(data) {
                    $scope.data.labels = data;
                });
            }
            /**
             * [getUrlInfo description获取返回的路由信息]
             * @return {[type]} [description]
             */
            function getUrlInfo() {
                if ($stateParams.eventtype == 'personal' && $stateParams.createtype == 'manual') { //个人事件
                    $scope.status.gotoUrl = "plan.eventanalysis.personalevents";
                    $scope.status.formTitle = $stateParams.eventid == 0 ? "新建个人事件" : "修改个人事件";
                } else if ($stateParams.eventtype == 'public' && $stateParams.createtype == 'manual') { //热门事件
                    $scope.status.gotoUrl = "plan.eventanalysis.eventmanagement";
                    $scope.status.formTitle = $stateParams.eventid == 0 ? "新建热门事件" : "修改热门事件";
                } else if ($stateParams.eventtype == 'public' && $stateParams.createtype == 'recommendation') { //部门推荐
                    $scope.status.gotoUrl = "plan.eventanalysis.eventmanagement";
                    $scope.status.formTitle = "添加到热门";
                    $scope.status.sourcetype = 1;
                }
            }
            /**
             * [description]
             * @param  {[type]} newValue  [description]
             * @param  {[type]} oldValue) {                       } [description]
             * @return {[type]}           [description]
             */
            $scope.$watch('genParams.StartDocPubTime', function(newValue, oldValue) {
                $scope.status.curDate = newValue;
            });

            $scope.$watch('genParams.EndDocPubTime', function(newValue, oldValue) {
                $scope.status.endDate = newValue;
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
                    $scope.genParams.EndDocPubTime = $scope.data.currEvent.ENDTIME;
                });
            }
            //新建：点击确定
            $scope.confirm = function() {
                var alert_info = $stateParams.eventid != 0 && $scope.status.sourcetype != 1 ? '保存' : '创建';
                $validation.validate($scope.createHotEventSubmitForm).success(function() {
                    saveEvent(angular.copy($scope.data.currEvent), $scope.data.selectedLabels).then(function() {
                        trsconfirm.alertType(alert_info + "成功", "", "success", false, function() {
                            //$modalInstance.close();
                        });
                        gotoUrl();
                    });
                }).error(function() {
                    trsconfirm.alertType(alert_info + '失败', "请检查填写项", "warning", false);
                });
                $scope.status.okToCreate = false;
            };

            //保存新建
            function saveEvent(currEvent, selectedLabels) {
                var defer = $q.defer();
                var params = currEvent;
                params.TYPEID = "event";
                params.EVENTTYPE = $stateParams.eventtype;
                params.ID = $stateParams.eventid.toString();
                if (($scope.data.currEvent.KEYWORDSINCLUDE == null || $scope.data.currEvent.KEYWORDSINCLUDE == "") && ($scope.data.currEvent.KEYWORDSEITHEROR == null || $scope.data.currEvent.KEYWORDSEITHEROR == "")) {
                    trsconfirm.alertType('包含全部关键词或者任意关键词必填一项', "", "warning", false);
                    $("#createHotEvent_keywordsinclude").focus();
                    return;
                }
                /*if(selectedLabels.length<=0){
                    trsconfirm.alertType('请选择热门标签', "", "warning", false);
                    return;
                }*/
                /*$scope.status.endDateVal = $("#hotEvent_input_endDate").val();
                if ($scope.status.endDateVal == "") {
                    params.ENDTIME = $scope.status.endDate = null;
                }*/
                if ($scope.status.endDate != null) {
                    if (new Date($filter("date")($scope.status.curDate, "yyyy-MM-dd")) > new Date($filter("date")($scope.status.endDate, "yyyy-MM-dd"))) {
                        trsconfirm.alertType('结束时间不能小于开始时间', "", "warning", false);
                        return;
                    } else {
                        params.ENDTIME = $filter("date")($scope.status.endDate, "yyyy-MM-dd").toString();
                    }
                } else {
                    params.ENDTIME = $scope.status.endDate;
                }

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
                if ($.trim(params.customlabel) == "") {
                    params.customlabel = null;
                }
                if ($.trim(params.keywordseitheror) == "") {
                    params.keywordseitheror = null;
                }
                if ($.trim(params.keywordsexclusive) == "") {
                    params.keywordsexclusive = null;
                }
                $scope.status.okToCreate = true;
                $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), params, "post").then(function(data) {
                    defer.resolve("success");
                });
                return defer.promise;
            }
            //检测时间格式
            /*function checkDate() {
                
            }*/
            $scope.checkDate = function() {
                $scope.status.endDateVal = $("#hotEvent_input_endDate").val();
                if ($scope.status.endDateVal == "" || $scope.status.endDateVal == null) {
                    $scope.status.endDate = null;
                } else {
                    var reg = /^\d{4}-(0?[1-9]|1[0-2])-(0?[1-9]|[1-2]\d|3[0-1])$/;
                    var r = $scope.status.endDateVal.match(reg);
                    if (r == null) {
                        trsconfirm.alertType('时间格式不正确', "", "warning", false);
                    }
                }
            };
            //取消
            $scope.cancel = function() {
                gotoUrl();
            };

            function gotoUrl() {
                $state.go($scope.status.gotoUrl, "", { reload: true });
            }
        }
    ]);
