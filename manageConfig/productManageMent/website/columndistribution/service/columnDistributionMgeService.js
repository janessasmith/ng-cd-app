/*
    Create by zhou 2016-07-13
*/
"use strict";
angular.module("columnDistributionMgeServiceModule", ["createColumnDistributionModule"])
    .factory("columnDistributionMgeService", ["$modal", function($modal) {
        return {
            createOrEditColumnDistribution: function(item, success) {
                var modalInstance = $modal.open({
                    templateUrl: "./manageConfig/productManageMent/website/columndistribution/service/createcolumndistribution/newsColumnDistribution.html",
                    windowClass: 'column-distribution',
                    backdrop: false,
                    controller: "createColumnDistributionCtrl",
                    resolve: {
                        item: function() {
                            return item;
                        }
                    }
                });
                modalInstance.result.then(function(result) {
                    success(result);
                });
            }
        };
    }]);
