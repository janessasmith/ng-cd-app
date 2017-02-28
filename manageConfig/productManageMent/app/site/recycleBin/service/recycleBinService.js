/**
 * Created by MRQ on 2016/1/6.
 */
"use strict";
angular.module("productManageMentappRecycleBinServiceModule", [
    'productManageMentAppRecycleBinDeleteViewsModule',
    'productManageMentAppRecycleBinReductionViewsModule'
])
    .factory("productManageMentappRecycleBinWordService", ["$modal", function ($modal) {
        return {
            //É¾³ýµ¯´°
            deleteViews: function (item,successFn) {
                $modal.open({
                    templateUrl: "./manageConfig/productManageMent/app/appRight/recycleBin/service/delete/recycle_bin_delete_tpl.html",
                    windowClass: 'productManageMent-app-recycle-delete',
                    backdrop: false,
                    controller: "productManageMentAppRecycleDeleteCtrl",
                    resolve: {
                        itemName: function () {
                            return item;
                        },
                        successFn: function () {
                            return successFn;
                        }
                    }
                });
            },
            //»¹Ô­µ¯´°
            reductionViews: function (item,successFn) {
                $modal.open({
                    templateUrl: "./manageConfig/productManageMent/app/appRight/recycleBin/service/reduction/recycle_bin_reduction_tpl.html",
                    windowClass: 'productManageMent-app-recycle-reduction',
                    backdrop: false,
                    controller: "productManageMentAppRecycleReductionCtrl",
                    resolve: {
                        itemName: function () {
                            return item;
                        },
                        successFn: function () {
                            return successFn;
                        }
                    }
                });
            }
        }
    }]);
