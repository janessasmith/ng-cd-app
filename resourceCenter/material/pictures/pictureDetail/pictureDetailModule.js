/**
 * 图片详情
 * Created by XueXiaoting in 2016/12/07.
 */
"use strict";
angular.module("resourceCenterPictureDetailModule", [])
    .controller("resourceCenterPictureDetailCtrl", ['$scope', '$state', '$window', '$stateParams', 'trsHttpService', 'trsconfirm', 'resourceCenterMaterialService','trsspliceString',function($scope, $state, $window, $stateParams, trsHttpService, trsconfirm, resourceCenterMaterialService,trsspliceString) {
        initStatus();
        initData();
        /**
         * [initStatus description] 初始化状态
         * @return {[type]} [description] null
         */
        function initStatus() {
            $scope.status = {
                materialId: $stateParams.pictureId,
                materialTypeId: $stateParams.materialtypeid
            };
            $scope.data = {
                picInfo: {}
            };
        }
        /**
         * [initData description] 初始化数据
         * @return {[type]} [description]null
         */
        function initData() {
            requestData();
        }

        function requestData() {
            var params = {
                serviceid: 'nb_material',
                methodname: 'findImgByID',
                materialId: $scope.status.materialId,
                typeId: $scope.status.materialTypeId
            };
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function(data) {
                $scope.data.picInfo = data;
                materialTypeString();
            });
        }
        /**
         * [materialTypeString description] 获取所属分类字符串
         * @return {[type]} [description] null
         */
        function materialTypeString() {
            $scope.data.typeString = trsspliceString.spliceString($scope.data.picInfo.MATERIALTYPE,'TITLE',',');
        }
        /**
         * [edit description]跳转到编辑
         * @return {[type]} [description]null
         */
        $scope.edit = function() {
            $state.go('resourcePicture', {
                pictureid: $scope.status.materialId,
                materialtypeid: $scope.status.materialTypeId,
                topclassifyid:$state.params.topclassifyid
            }, { reload: true });
        };

        /**
         * [addToCreation description]添加到创作轴
         * @return {[type]} [description]null
         */
        $scope.addToCreation = function() {
            var params = {
                serviceid: 'nb_material',
                methodname: 'creation',
                MaterialIds: $scope.status.materialId.toString(),
                typeId: 1
            };
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, 'get').then(function(data) {
                trsconfirm.alertType("成功添加到创作轴", "", "success", false);
            });
        };
        /**
         * [close description]关闭页面
         * @return {[type]} [description]null
         */
        $scope.close = function() {
            var opened = $window.open('about:blank', '_self');
            opened.close();
        };

    }]);
