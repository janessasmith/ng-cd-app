/**
 * created by zss in 2016/12/15
 * 官员新建/编辑
 */
'use strict';
angular.module("editingCenterAppOfficialEditModule", [])
    .controller('editingCenterAppOfficialEditCtrl', ['$stateParams', '$q', '$filter', '$window', '$scope', '$state', '$timeout', '$validation', '$compile', 'initMyZoneSelectedService', 'trsHttpService', 'resourceCenterMaterialService', 'trsconfirm', 'editingCenterService', 'storageListenerService', 'jsonArrayToStringService', 'trsspliceString', 'editcenterRightsService', 'ueditorService', 'editPictureService',
        function($stateParams, $q, $filter, $window, $scope, $state, $timeout, $validation, $compile, initMyZoneSelectedService, trsHttpService, resourceCenterMaterialService, trsconfirm, editingCenterService, storageListenerService, jsonArrayToStringService, trsspliceString, editcenterRightsService, ueditorService, editPictureService) {
            initStatus();
            initData();
            /**
             * [initStatus description] 初始化状态
             * @return {[type]} [description] null
             */
            function initStatus() {
                $scope.data = {
                    officer: {
                        'METADATAID': 0,
                        'CHANNELID': $state.params.channelid,
                        'FILENAME': '',
                        'NAME': '',
                        'PERSONALPROFILE': '',
                        'POST': '',
                        'NATIVEPLACE': '',
                        'NATION': '',
                        'SCHOOL': '',
                        'EDUCATIONALHISTORY': '',
                        'GENDER': initMyZoneSelectedService.modifyInfoSex()[0].name,
                        'BIRTHDAY': new Date("1980-01"),
                        'PARTYDATE': new Date("1980-01"),
                        'WORKTIME': new Date("1980-01"),
                        'RECORDS': [],
                        'CONTENT': "",
                        "HTMLCONTENT": "",
                    },
                    record: {
                        'FROMDATE': new Date("1980-01"),
                        'UNTILDATE': new Date("1980-01"),
                        'CONTENT': '',
                        'SOFAR': false, //个人履历结束时间是否至今
                    },
                    hasSoFar: false, //是否有‘至今’的履历
                };
                $scope.status = {
                    params: {
                        'serviceid': 'nb_appofficer',
                        'methodname': 'findOfficerById',
                        'ChannelId': $state.params.channelid,
                        'CHNLDOCID': $state.params.officerid,
                    },
                    officerstatus: $state.params.officerstatus,
                    rightsStatus: {
                        'tobecompiled': 'app.daibian',
                        'pending': 'app.daishen',
                        'signed': 'app.yiqianfa',
                    }, //待编,待审,已签发状态下对应的权限
                    picturesize: "300,300", //图片裁剪的尺寸
                };
                $scope.radio = {
                    //性别
                    'genderJson': initMyZoneSelectedService.modifyInfoSex(),
                };
            }
            /**
             * [initData description] 初始化数据
             * @return {[type]} [description] null
             */
            function initData() {
                $state.params.officerid ? requestData() : $scope.data.officer.RECORDS.push(angular.copy($scope.data.record));
                $scope.callBack = {
                    success: function(file, src, uploader) {
                        cropImage(src);
                    },
                    error: function(file) {
                        trsconfirm.alertType('上传失败', '', 'error', false, function() {});
                    },
                    file: function(file, uploader) {},
                    tar: function(file, percentage) {},
                    comp: function(file) {}
                };
                editcenterRightsService.initAppListBtn($scope.status.rightsStatus[$state.params.officerstatus], $stateParams.channelid).then(function(rights) {
                    $scope.status.btnRights = rights;
                });
                loadDirective();
            }
            /**
             * [cropImage description]裁剪图片
             * @param  {[obj]}  src  [description]图片上传后的返回值
             * @param  {[obj]}  file [description]文件信息
             * @return {[type]}      [description]
             */
            function cropImage(src, file) {
                $timeout(function() {
                    editPictureService.cutPicture(src, $scope.status.picturesize, function(_src) {
                        var picturesizeArray = $scope.status.picturesize.split(",");
                        var width = picturesizeArray[0];
                        var height = picturesizeArray[1];
                        editPictureService.compressImg(_src.imgSrc, Math.round(width), Math.round(height)).then(function(__src) {
                            var __srcArray = __src.split("=");
                            var srcObj = {
                                imgName: __srcArray[__srcArray.length - 1],
                                imgSrc: __src,
                                success: "上传成功"
                            };
                            cropHandle(srcObj, file);
                        });
                    }, function() {
                        cropHandle(src, file); //点击取消时显示原图
                    });
                });
            }
            /**
             * [successHandle description]图片裁剪过后的处理
             * @param  {[obj]}  src  [description]图片信息源
             * @param  {[obj]} file  [description]文件信息
             * @return {[type]}      [description]
             */
            function cropHandle(src, file) {
                $scope.data.officer.FILEPATH = src.imgSrc;
                $scope.data.officer.FILENAME = src.imgName;
            }
            /**
             * [loadDirective description]动态加载编辑器
             * @return {[type]} [description]
             */
            function loadDirective() {
                LazyLoad.js(["./lib/ueditor2/ueditor.config.js?v=11.0", "./lib/ueditor2/ueditor.all.js?v=11.0"], function() {
                    var ueditor = '<ueditor-for-atlas list="data.officer"></ueditor-for-atlas>';
                    ueditor = $compile(ueditor)($scope);
                    $($(angular.element(document)).find('ueditorLocation')).append(ueditor);
                });
            }
            /**
             * [requestData description] 数据请求
             * @return {[type]} [description] null
             */
            function requestData() {
                trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), $scope.status.params, "post").then(function(data) {
                    $scope.data.officer = data;
                    dealOfficerAfterRequest();
                });
            }
            /**
             * [saveContent description]保存个人简介正文字段
             * @return {[type]} [description]
             */
            function saveContent() {
                ueditorService.saveContent($scope.data.officer);
            }
            /**
             * [saveOfficer description] 保存官员信息
             * @return {[type]} [description] null
             */
            function saveOfficer() {
                saveContent();
                var deffer = $q.defer();
                $validation.validate($scope.officialEditform)
                    .success(function() {
                        var officer = dealOfficerBeforeSave();
                        trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), officer, 'post').then(function(data) {
                            $scope.officialEditform.$setPristine();
                            deffer.resolve(data);
                        });
                    }).error(function() {
                        editingCenterService.checkSaveError($scope.officialEditform);
                        trsconfirm.alertType("素材保存失败", "请检查填写项", "error", false);
                        editingCenterService.checkSaveError($scope.officialEditform);
                        deffer.reject();
                    });
                return deffer.promise;
            }
            /**
             * [dealOfficerAfterRequest description] 数据请求后处理officer数据
             * @return {[type]} [description] null
             */
            function dealOfficerAfterRequest() {
                $scope.data.hasSoFar = $filter("contains")($scope.data.officer.RECORDS, "UNTILDATE==''");
            }
            /**
             * [dealOfficerBeforeSave description] 保存前处理官员信息属性
             * @return {[type]} officer [description] 转成字符串后的data.officer
             */
            function dealOfficerBeforeSave() {
                if (!$scope.data.officer.FILEPATH) {
                    trsconfirm.alertType("图片未上传", "支持格式 “.gif/.jpg/.jpeg/.bmp/.png”", "warning", false);
                    return;
                }
                $scope.data.officer.serviceid = 'nb_appofficer';
                $scope.data.officer.methodname = 'saveOfficer';
                dealWithDate();
                var officer = jsonArrayToStringService.jsonArrayToString(angular.copy($scope.data.officer));
                return officer;
            }
            /**
             * [dealWithDate description] 处理日期
             * @return {[type]} [description] null
             */
            function dealWithDate() {
                $scope.data.officer.BIRTHDAY = filterDate($scope.data.officer.BIRTHDAY);
                $scope.data.officer.PARTYDATE = filterDate($scope.data.officer.PARTYDATE);
                $scope.data.officer.WORKTIME = filterDate($scope.data.officer.WORKTIME);
                for (var i = 0; i < $scope.data.officer.RECORDS.length; i++) {
                    $scope.data.officer.RECORDS[i].FROMDATE = filterDate($scope.data.officer.RECORDS[i].FROMDATE);
                    $scope.data.officer.RECORDS[i].UNTILDATE = filterDate($scope.data.officer.RECORDS[i].UNTILDATE);
                }
            }
            /**
             * [filterDate description] 将date对象转成'yyyy-MM'形式字符串
             * @param  {[type]} date [description] date对象
             * @return {[type]} string   [description] 过滤后字符串
             */
            function filterDate(date) {
                return $filter('date')(date, 'yyyy-MM');
            }
            /**
             * [officerDataAfterSave description] 新建保存后修改地址栏参数，再保存为编辑保存，不刷新页面
             * @param  {[obj]} data [description] 保存后返回数据
             * @return {[type]}      [description] null
             */
            function officerDataAfterSave(data) {
                storageListenerService.addListenerToApp("save");
                $scope.data.officer.METADATAID = data.METADATAID;
                $scope.data.officer.CHNLDOCID = data.CHNLDOCID;
                $stateParams.officerid = data.CHNLDOCID;
                $state.transitionTo($state.current, $stateParams, {
                    reload: false
                });
            }
            /**
             * [confirm description] 确定保存
             * @return {[type]} [description] null
             */
            $scope.confirm = function() {
                saveOfficer().then(function(data) {
                    officerDataAfterSave(data);
                    trsconfirm.saveModel("信息保存成功", "", "success");
                });
            };
            /**
             * [trial description] 送审
             * @return {[type]} [description] null
             */
            $scope.trial = function() {
                saveOfficer().then(function(data) {
                    officerDataAfterSave(data);
                    trsconfirm.inputModel('送审', '请输入送审意见', function(content) {
                        var params = {
                            "serviceid": "mlf_appoper",
                            "methodname": "trialMetaDatas",
                            "MetaDataIds": $scope.data.officer.METADATAID,
                            "ChnlDocIds": $scope.data.officer.CHNLDOCID,
                            "ChannelId": $state.params.channelid,
                            "Opinion": content,
                        };
                        trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, 'post').then(function(data) {
                            storageListenerService.addListenerToApp("trial");
                            trsconfirm.alertType('送审成功', '', 'success', false, function() {
                                $window.open('about:blank', '_self').close();
                            });
                        });
                    });
                });
            };
            /**
             * [revoke description] 撤稿
             * @return {[type]} [description] null
             */
            $scope.revoke = function() {
                trsconfirm.inputModel('撤稿', '请输入撤稿原因', function(content) {
                    var params = {
                        'serviceid': "mlf_appoper",
                        'methodname': "rejectionMetaDatas",
                        'ChnlDocIds': $scope.data.officer.CHNLDOCID,
                        'MetaDataIds': $scope.data.officer.METADATAID,
                        'ChannelId': $state.params.channelid,
                        'Opinion': content,
                    };
                    trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, 'post').then(function(data) {
                        storageListenerService.addListenerToApp("revoke");
                        trsconfirm.alertType('撤稿成功', '', 'success', false, function() {
                            $window.open('about:blank', '_self').close();
                        });
                    });
                });
            };
            /**
             * [directSigned description] 签发
             * @return {[type]} [description] null
             */
            $scope.directSigned = function() {
                saveOfficer().then(function(data) {
                    officerDataAfterSave(data);
                    trsconfirm.confirmModel('签发', '是否确定签发官员', function() {
                        var params = {
                            'serviceid': "mlf_appoper",
                            'ObjectIds': $scope.data.officer.CHNLDOCID,
                            'ChnlDocIds': $scope.data.officer.CHNLDOCID,
                            'MetaDataIds': $scope.data.officer.METADATAID,
                        };
                        params.methodname = $scope.status.officerstatus == 'tobecompiled' ? "appDaiBianPublish" : "appDaiShenPublish";
                        trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, 'post').then(function(data) {
                            storageListenerService.addListenerToApp("directSign");
                            trsconfirm.alertType('签发成功', '', 'success', false, function() {
                                $window.open('about:blank', '_self').close();
                            });
                        });
                    });
                });
            };
            /**
             * [close description]页面关闭
             * @return {[type]} [description] null
             */
            $scope.close = function() {
                resourceCenterMaterialService.closeWinow($scope.officialEditform.$dirty).then(function() {
                    saveOfficer().then(function() {
                        var opened = $window.open('about:blank', '_self');
                        opened.close();
                    });
                }, function() {
                    var opened = $window.open('about:blank', '_self');
                    opened.close();
                });
            };
            /**
             * [addRecord description] 新增官员履历
             */
            $scope.addRecord = function() {
                $scope.data.officer.RECORDS.push(angular.copy($scope.data.record));
            };
            /**
             * [isSoFar description] 个人履历结束时间设为至今
             * @param  {[type]}  index [description] 履历index
             * @return {Boolean}       [description] null
             */
            $scope.setSoFar = function(index) {
                $scope.data.hasSoFar = true;
                $scope.data.officer.RECORDS[index].SOFAR = true;
                $scope.data.officer.RECORDS[index].UNTILDATE = "";
            };
            /**
             * [deleteRecord description] 删除官员履历
             * @param  {[type]} index [description] 履历的index
             * @return {[type]}       [description] null
             */
            $scope.deleteRecord = function(index) {
                $scope.deleteIndex = index; //给选中的履历添加样式
                trsconfirm.confirmModel('删除履历', '是否确定删除？', function() {
                    if ($scope.data.officer.RECORDS[index].UNTILDATE === "") {
                        $scope.data.hasSoFar = false;
                    }
                    $scope.data.officer.RECORDS.splice(index, 1);
                    trsconfirm.saveModel("删除成功", "", "success");
                    $scope.deleteIndex = null;
                }, function() {
                    $scope.deleteIndex = null;
                });
            };
        }
    ]);
