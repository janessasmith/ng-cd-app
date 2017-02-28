"use strict";
/*
 *created by cc 16-11-29
 *modified by zss 16-12-05
 *素材库公用服务
 */
angular.module('resourceCenterMaterialServiceModule', ['imgUrlCopyModule', 'resourceCenterPictureClassifyModule']).
factory('resourceCenterMaterialService', ['$q', "$modal", '$filter', '$state', 'trsHttpService', 'SweetAlert', 'globleParamsSet', function($q, $modal, $filter, $state, trsHttpService, SweetAlert, globleParamsSet) {
    return {
        /**
         * [queryClassify description]查询分类
         * @param  {[num]} materialType    [description]素材分类id（图片为1）
         * @param  {[num]} materialTypeid  [description]分类父id
         * @return {[type]}                [description]
         */
        queryClassify: function(materialType, materialTypeid) {
            var deffered = $q.defer();
            var params = {
                serviceid: "nb_material",
                methodname: "queryType",
                materialType: materialType,
                parentId: materialTypeid
            };
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function(data) {
                deffered.resolve(data);
            });
            return deffered.promise;
        },
        /**
         * [closeWinow description]关闭页面服务
         * @param  {Boolean} isDirty        [description]表单是否有改动
         * @return {[type]}                 [description]null
         */
        closeWinow: function(isDirty) {
            var deferred = $q.defer();
            if (isDirty) {
                SweetAlert.swal({
                    title: "您还未保存已修改的内容",
                    showCancelButton: true,
                    type: "error",
                    closeOnConfirm: false,
                    closeOnCancel: false,
                    cancelButtonText: "放弃保存",
                    confirmButtonText: "保存关闭",
                }, function(isConfirm) {
                    if (isConfirm) {
                        deferred.resolve();
                    } else {
                        deferred.reject();
                    }
                });
            } else {
                deferred.reject();
            }
            return deferred.promise;
        },
        /**
         * [copyImgUrl description]复制图片发布地址
         * @param  {string} url        [description]图片地址
         * @return {[type]}            [description]null
         */
        copyImgUrl: function(url) {
            var modalInstance = $modal.open({
                templateUrl: "./resourceCenter/material/service/picUrlCopy/picUrlCopy_tpl.html",
                windowClass: 'toBeCompiled-review-window',
                backdrop: false,
                controller: "imgUrlCopyCtrl",
                resolve: {
                    copyParams: function() {
                        return {
                            imgUrl: url
                        };
                    }
                }
            });
        },
        /**
         * [btnRights description]获得按钮操作权限
         * @param  {[str]} MaterialTypeId  [description]素材ID
         * @return {[type]}                [description]
         */
        btnRights: function(MaterialTypeId) {
            var defferd = $q.defer();
            var params = {
                serviceid: "nb_managerconfig",
                methodname: "findMaterialConfigRight",
                MaterialTypeId: $state.params.topclassifyid //因为赋权只是在顶级分类，所以这里只传顶级分类的ID
            };
            globleParamsSet.getBtnRights(params).then(function(rights) {
                defferd.resolve(rights);
            });
            return defferd.promise;
        },
        /**
         * [multipleClassify description]分类多选
         * @param  {[str]} title               [description]标题信息
         * @param  {[obj]} params              [description]请求参数
         * @param  {[array]} selectedClassifys [description]已选择的分类
         * @return {[array]}                   [description]被选择的分类
         */
        multipleClassify: function(title, params, selectedClassifys) {
            var defferd = $q.defer();
            var modalInstance = $modal.open({
                templateUrl: "./resourceCenter/material/service/batChooseClassify/batChooseClassify_tpl.html",
                windowClass: 'resourceClassify-window',
                backdrop: false,
                controller: "resourceCenterPictureClassify",
                resolve: {
                    title: function() {
                        return title;
                    },
                    params: function() {
                        return params;
                    },
                    selectedClassifys: function() {
                        return selectedClassifys;
                    }
                }
            });
            modalInstance.result.then(function(data) {
                defferd.resolve(data);
            });
            return defferd.promise;
        },
        /**
         * [queryClassifyDetail description]获得分类的详细信息
         * @param  {[str]} materialTypeid  [description]分类ID
         * @return {[obj]}                 [description]分类信息
         */
        queryClassifyDetail: function(materialTypeid) {
            var defferd = $q.defer();
            var params = {
                serviceid: "nb_material",
                methodname: "queryMaterialtypeById",
                MaterialTypeId: materialTypeid
            };
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function(data) {
                defferd.resolve(data);
            });
            return defferd.promise;
        },
        /**
         * [downLoadMaterial description]素材下载服务
         * @param  {[obj]} params  [description]请求参数
         * @return {[type]}        [description]
         */
        downLoadMaterial: function(params) {
            var defferd = $q.defer();
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function(data) {
                defferd.resolve(data);
            });
            return defferd.promise;
        },
    };
}]);
