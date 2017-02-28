/**
 * 图片编辑新建
 * Created by ZSS in 2016/11/29
 * Modified  by cc  in 2016/12/8 
 */
"use strict";
angular.module("resourceCenterPictureEditModule", [])
    .controller("resourceCenterPictureEditCtrl", ['$scope', '$q', '$timeout', '$state', '$validation', '$window', '$filter', '$stateParams', 'trsHttpService', 'trsconfirm', 'storageListenerService', 'resourceCenterMaterialService', 'trsspliceString', 'resCtrModalService', 'resourceCenterService', 'jsonArrayToStringService', 'editingCenterService',
        function($scope, $q, $timeout, $state, $validation, $window, $filter, $stateParams, trsHttpService, trsconfirm, storageListenerService, resourceCenterMaterialService, trsspliceString, resCtrModalService, resourceCenterService, jsonArrayToStringService, editingCenterService) {
            initStatus();
            initData();
            /**
             * [initStatus description] 初始化状态
             * @return {[type]} [description] null
             */
            function initStatus() {
                $scope.data = {
                    picture: {
                        'MATERIALID': 0,
                        'MATERIALTYPE': 1, //图片
                        'TYPEIDS': "",
                        'TITLE': '',
                        'CONTENT': '',
                        'FILENAME': '',
                        'FILEPATH': '',
                        'KEYWORD': '',
                        'RELATEPERSON': '',
                        'RELATEPLACE': '',
                        'AUTHORS': '',
                        'PSTIME': new Date(),
                    },
                    selectClassify: [], //选择的分类集合
                    isTakeDraft: $state.params.istakedraft,
                    picArray: [], //小图
                    selectedIndex: 0, //选中小图index
                    visibleSize: 4,//小图可视长度（个数）
                };
                $scope.status = {
                    params: {
                        'serviceid': 'nb_material',
                        'methodname': 'findImgByID',
                        'materialId': $state.params.pictureid,
                        'TypeID': $state.params.materialtypeid,
                    },
                    PICMATERIALTYPE: 1, //图片的分类类型为1
                    btnRights: "", //按钮权限
                };
            }
            /**
             * [initData description] 初始化数据
             * @return {[type]} [description] null
             */
            function initData() {
                if ($state.params.pictureid) {
                    requestData();
                }
            }
            /**
             * [requestData description] 数据请求
             * @return {[type]} [description]
             */
            function requestData() {
                trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), $scope.status.params, "post").then(function(data) {
                    $scope.data.picture = data;
                    $scope.data.selectClassify = data.MATERIALTYPE;
                    $scope.data.picture.MATERIALTYPE = $scope.status.PICMATERIALTYPE;
                    setPicArray(data);
                });
            }
            /**
             * [setPicArray description] 编辑素材时设置已有小图
             * @param {[type]} data [description] 请求数据
             */
            function setPicArray(data) {
                $scope.data.picArray[0] = {
                    'APPDESC': '',
                    'APPFILE': data.FILENAME,
                    'PERPICURL': data.FILEPATH,
                };
            }
            /**
             * [confirm description] 确定保存
             * @return {[type]} [description] null
             */
            $scope.confirm = function() {
                savePic().then(function(data) {
                    pictureDataAfterSave(data, true);
                    // $scope.status.params.materialId = $state.params.pictureid;
                    trsconfirm.alertType("素材保存成功", "", "success",false,function(){
                        $window.open('about:blank', '_self').close();
                    });
                });
            };
            /**
             * [pictureDataAfterSave description] 素材新建保存后修改地址栏参数，再保存为编辑保存，不刷新页面
             * @param  {[string]} data [description] 素材id
             * @return {[type]}      [description] null
             */
            function pictureDataAfterSave(data, flag) {
                if (!flag) return;
                storageListenerService.addListenerToResource("pictureSaved");
                // $stateParams.pictureid = data.replace(/\"/g, "");
                // $state.transitionTo($state.current, $stateParams, {
                //     reload: false
                // });
            }
            /**
             * [close description]页面关闭
             * @return {[type]} [description] null
             */
            $scope.close = function() {
                resourceCenterMaterialService.closeWinow($scope.pictureEditform.$dirty).then(function() {
                    savePic().then(function() {
                        var opened = $window.open('about:blank', '_self');
                        opened.close();
                    });
                }, function() {
                    var opened = $window.open('about:blank', '_self');
                    opened.close();
                });
            };
            /**
             * [dealPicBeforeSave description]保存前处理图片属性
             * @return {[type]} [description] null
             */
            function dealPicBeforeSave() {
                if ($scope.data.picArray.length < 1) {
                    trsconfirm.alertType("图片未上传", "支持格式 “.gif/.jpg/.jpeg/.bmp/.png”", "warning", false);
                    return;
                }
                if ($scope.data.selectClassify.length < 1) {
                    trsconfirm.alertType("请选择分类", "", "warning", false);
                    return;
                }
                $scope.data.picture.serviceid = 'nb_material';
                $scope.data.picture.methodname = 'batchSave';
                $scope.data.picture.FILENAMES = trsspliceString.spliceString($scope.data.picArray, 'APPFILE', ',');
                // $scope.data.picture.MATERIALID = $stateParams.pictureid || 0;
                $scope.data.picture.PSTIME = $filter('date')($scope.data.picture.PSTIME, 'yyyy-MM-dd');
                $scope.data.picture.TYPEIDS = trsspliceString.spliceString($scope.data.selectClassify, 'MATERIALTYPEID', ","); //多分类
                $scope.data.picture = jsonArrayToStringService.jsonArrayToString($scope.data.picture);
            }
            /**
             * [savePic description] 保存图片
             * @return {[object]}      [description] promise
             */
            function savePic() {
                var deferred = $q.defer();
                $validation.validate($scope.pictureEditform)
                    .success(function() {
                        dealPicBeforeSave();
                        trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), $scope.data.picture, "post").then(function(data) {
                            $scope.pictureEditform.$setPristine();
                            deferred.resolve(data);
                        });
                    }).error(function() {
                        editingCenterService.checkSaveError($scope.pictureEditform);
                        trsconfirm.alertType("素材保存失败", "请检查填写项", "error", false);
                        deferred.reject();
                    });
                return deferred.promise;
            }
            /**
             * [selectClassify description]选择稿件所属分类
             * @type {[type]}
             */
            $scope.selectClassify = function() {
                var params = {
                    serviceid: "nb_material",
                    methodname: "getMaterialTypeTree",
                    materialtypeid: $state.params.topclassifyid
                };
                resourceCenterMaterialService.multipleClassify('分类选择', params, angular.copy($scope.data.selectClassify)).then(function(data) {
                    $scope.data.selectClassify = data;
                });
            };
            /**
             * [multiImgsUploader description] 多图上传
             * @return {[type]} [description]
             */
            $scope.multiImgsUploader = function() {
                editingCenterService.imageUpload(function(result) {
                    $timeout(function() {
                        $scope.data.picArray = $scope.data.picArray.concat(result);
                        $scope.data.picture.FILEPATH = $scope.data.picArray[0].PERPICURL;
                        $scope.data.selectedPic = $scope.data.picArray[0];
                    });
                });
            };
            /**
             * [editImage description] 重新上传图片
             * @return {[type]} [description] null 
             */
            $scope.editImage = function() {
                editingCenterService.editUploaderImg($scope.data.selectedPic, function(result) {
                    $scope.data.picture.FILEPATH = result.PERPICURL;
                    $scope.data.picArray[$scope.data.selectedIndex].APPFILE = result.APPFILE; //保存时用
                    $scope.data.picArray[$scope.data.selectedIndex].PERPICURL = result.PERPICURL;
                });
            };
            /**
             * [seleceItem description] 更换大图地址
             * @return {[type]} [description] null
             */
            $scope.seleceItem = function() {
                $scope.data.picture.FILEPATH = $scope.data.selectedPic.PERPICURL;
            };
        }
    ]);
