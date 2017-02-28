/*create by ma.rongqin 2016.6.28*/
'use strict';
angular.module('planCenCommandAppointTaskDetailModule', ['uploadModalModule'])
    .controller('planCenCommandAppointTaskDetailCtrl', ['$scope', '$state', '$q', '$timeout', '$sce', '$stateParams', '$filter', 'trsHttpService', 'appointTaskService', '$modal', 'uploadAudioVideoService', 'trsconfirm',
        function($scope, $state, $q, $timeout, $sce, $stateParams, $filter, trsHttpService, appointTaskService, $modal, uploadAudioVideoService, trsconfirm) {
            initStatus();
            initData();
            /**
             * [initStatus description:初始化状态]
             */
            function initStatus() {
                $scope.status = {
                    date: new Date(),
                    batchOperateBtn: {
                        "hoverStatus": "",
                        "clickStatus": ""
                    },
                    taskOperMap: appointTaskService.taskOperMap(),
                    reportid: $stateParams.reportid,
                    taskid: $stateParams.taskid,
                    /*showHeight: null, //初始化高度
                    left_height:null*/
                    isUrgent: ["普通", "紧急", "重要", "敏感"]
                };
                $scope.data = {};
                $scope.status.isHideUploadBtn = $stateParams.detailType == "taskView" ? false : true;
            }
            /**
             * [initData description:初始化数据]
             */
            function initData() {
                requestData();
                getCurDate();
            }
            $scope.handleDate = function(date) {
                return $filter("date")(new Date(Date.parse(date)), "yyyy-MM-dd");
            };
            /**
             * [requestData description:请求任务/线索详情]
             */
            function requestData() {
                var params = {
                    serviceid: "mlf_task",
                    methodname: "getPlanTask",
                    TaskId: $stateParams.taskid
                };
                if (angular.isDefined($stateParams.taskuserid)) {
                    params.TaskUserId = $stateParams.taskuserid;
                }
                trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get")
                    .then(function(data) {
                        $scope.data.item = data;
                        $scope.data.item.CONTENT = $scope.data.item.CONTENT.replace(/\n/g, "<br/>").replace(/ /g, "　");
                        $scope.data.item.PLANTASKLOGS = appointTaskService.timeLineDataSwitch($scope.data.item.PLANTASKLOGS, "OPERTIME");
                        $scope.status.showmaterials = $stateParams.showmaterials;
                        if ($scope.status.showmaterials) {
                            $scope.getUsersAndMaterials();
                        }
                    });
            }
            /**
             * [getUsersAndMaterials description:获取素材]
             */
            $scope.getUsersAndMaterials = function() {
                getUserList().then(function(data) {
                    var index;
                    for (var i = 0; i < data.USERS.length; i++) {
                        if (data.USERS[i].USERTRUENAME == data.LOGINUSER) {
                            index = i;
                            break;
                        };
                        index = 0;
                    }
                    $scope.getMaterials($scope.data.userList[index]);
                });
            };
            /**
             * [getUserList description:获取用户列表]
             * @param  {[null]} null [description] 
             * @return {[Array]}   [description] 用户列表
             */
            function getUserList() {
                var deffer = $q.defer();
                var params = {
                    serviceid: "mlf_task",
                    methodname: "queryUsersByTask",
                    TaskId: $stateParams.taskid
                };
                $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get")
                    .then(function(data) {
                        deffer.resolve(data);
                        $scope.data.userList = data.USERS;
                    });
                return deffer.promise;
            };
            /**
             * [getMaterials description:获取素材列表]
             * @param  {[string]} userid [description] 用户id
             * @return {[Array]}   [description] 素材列表
             */
            $scope.getMaterials = function(user) {
                delete $scope.status.showType;
                $scope.status.selectedUser = user;
                var params = {
                    methodname: 'queryMaterialsByUser',
                    serviceid: 'mlf_task',
                    TaskId: $stateParams.taskid,
                    UserId: user.USERID
                };
                $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get")
                    .then(function(data) {
                        $scope.data.materialsLine = appointTaskService.timeLineDataSwitch(data, "CRTIME");
                    });
            };
            /** [openUploadModal 打开上传弹框] */
            $scope.openUploadModal = function() {
                var modalInstance = $modal.open({
                    templateUrl: "./planningCenter/command/task/taskView/uploadModal/uploadModa.html",
                    windowClass: 'resource-reserve-modal',
                    backdrop: false,
                    controller: "uploadModalCtrl",
                    resolve: {
                        selectItems: function() {
                            return [];
                        }
                    }
                });
                modalInstance.result.then(function(result) {
                    $scope.getUsersAndMaterials();
                });
            };
            /** [getCurDate 获取当前日期] */
            function getCurDate() {
                $scope.status.curDate = $filter("date")(new Date(), "yyyy/MM/dd").toString();
            }
            /** [showMaterials 处理展示材料] */
            $scope.showMaterials = function(item) {
                if (item.MATERIALTYPE === "1") {
                    item.textMaterial = item.MATERIALAPPFILE;
                } else if (item.MATERIALTYPE == "2") {
                    item.imgMaterial = item.MATERIALAPPFILE;
                } else {
                    getPlayer(item);
                }
            };
            /** [getPlayer 获取播放器] */
            function getPlayer(item) {
                uploadAudioVideoService.getPlayerById(item.MATERIALAPPFILE).then(function(_data) {
                    if (item.MATERIALTYPE === "3") {
                        doRecursion(item, _data);
                        item.musicPlayer = _data;
                    } else {
                        doRecursion(item, _data);
                        item.videoPlayer = _data;
                    }
                });

                function doRecursion(item, _data) {
                    if (angular.isDefined(_data.err)) {
                        $timeout(function() {
                            getPlayer(item);
                        }, 10000);
                    }
                }
            }
            /** [getMusicPlay 获取音乐播放器] */
            $scope.getMusicPlay = function(item, event) {
                showMaterailsDetail('music', event);
                $scope.data.musicSrc = angular.isDefined(item.musicPlayer.err) ? "" : item.musicPlayer.streamsMap.l.httpURL;
                $scope.data.uploadId = item.MATERIALAPPFILE;
            };
            /** [getMusicPlay 获取视频播放器] */
            $scope.getVideoPlay = function(item, event) {
                showMaterailsDetail('video', event);
                $scope.data.videoSrc = angular.isDefined(item.videoPlayer.err) ? "" : item.videoPlayer.streamsMap.l.httpURL;
                $scope.data.uploadId = item.MATERIALAPPFILE;
            };
            /** [trustUrl 信任url] */
            $scope.trustUrl = function(url) {
                return $sce.trustAsResourceUrl(url);
            };
            /** [getMusicPlay 获取图片素材] */
            $scope.getImgMaterial = function(url, event) {
                showMaterailsDetail('img', event);
                $scope.data.imgSrc = $sce.trustAsResourceUrl(url);
                $scope.data.imgUrl = url;
            };
            /** [getMusicPlay 获取文字素材] */
            $scope.getTextMaterial = function(text, event) {
                showMaterailsDetail('text', event);
                $scope.data.textMaterial = text.replace(/\n/, "<br/>").replace(/ /g, "　");
                $scope.data.textContent = text;
            };

            function showMaterailsDetail(type, event) {
                var top = document.body.scrollTop - 600 + event.clientY;
                $scope.status.showTop = top + "px";
                $scope.status.showType = type;
                $timeout(function() {
                    $scope.status.left_height = $("#m_timeline_task_js").first().height();
                    $scope.status.showHeight = top + $("#toCreateLine").first().height() + 60;
                    if ($scope.status.left_height >= $scope.status.showHeight) {
                        $scope.status.showHeight = $scope.status.left_height + 60;
                    }
                });
            }
            /** [addToCreateLine 添加到创作轴] */
            $scope.addToCreateLine = function(data) {
                var content = "";
                var imgName = "";
                if ($scope.status.showType == 'text') {
                    content = $scope.data.textContent;
                } else if ($scope.status.showType == 'img') {
                    imgName = $scope.data.imgUrl;
                }
                var params = {
                    serviceid: "mlf_task",
                    methodname: "saveCreation",
                    Content: content,
                    ImgName: imgName
                };
                $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function() {
                    trsconfirm.alertType("添加到创作轴成功", "", "success", false);
                });
            };
            /** [download 导出音视频] */
            $scope.download = function(data) {
                uploadAudioVideoService.download($scope.data.uploadId);
            };
            /**
             * [gototask description点击：转任务]
             * @return {[type]} [description]
             */
            $scope.gototask = function() {
                if (angular.isUndefined($scope.data.item.ISCLUE) || $scope.data.item.ISCLUE == 0) { //转任务?:
                    var params = {
                        serviceid: "mlf_task",
                        methodname: "startStatus",
                        ClueId: $stateParams.reportid
                    };
                    trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function() {
                        $state.go("plan.appointtask.newtask", { taskid: $stateParams.taskid, reportid: $stateParams.reportid });
                    });
                } else { //查看任务
                    window.open("/mediacube/#/plantaskdetai?taskid=" + $scope.data.item.ISCLUE, "_blank");
                    //$state.go("plantaskdetail", { taskid: $scope.data.item.ISCLUE, reportid: "" }, { reload: true });
                }
            };
        }
    ]);
