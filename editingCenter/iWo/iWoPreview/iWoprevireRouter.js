'use strict';
/**
 *  Module  iWo点击标题预览
 *  Ly  
 * Description
 */
angular.module('iWoPreveiwRouterModule', [
    "iWoPreviewModule"
]).config(['$stateProvider', function($stateProvider) {
    $stateProvider
        .state("iwopreview", {
            url: "/iwopreview?channelid&chnldocid&siteid&metadataid&modalname&doccollectrelid&type&departmentid&isdepartment",
            /*channelid:栏目ID,chnldocid:文档ID,siteid:站点ID,metadataid:元数据ID,modalname:模块名,doccollectrelid:收集ID,type:稿件类型,departmentid:部门ID,isdepartment:是否是部门*/
            views: {
                "": {
                    templateUrl: "./editingCenter/iWo/iWoPreview/iwoRreview.html",
                    controller: "iWoPreviewCtrl"
                }
            }
        });
}]);
