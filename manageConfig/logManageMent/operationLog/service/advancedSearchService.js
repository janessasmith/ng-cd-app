'use strict';
/*
    Create by zhou 2016-07-21
*/
angular.module("advancedSearchServiceModule", ["advancedSearchModule"])
    .factory("advancedSearchService", ["$modal", function($modal) {
        return {
            advancedSearch: function(success) {
                var modalInstance = $modal.open({
                    templateUrl: "./manageConfig/logManageMent/operationLog/service/advancedSearch/advanced_search.html",
                    windowClass: 'advanced-search',
                    backdrop: false,
                    controller: "advancedSearchCtrl"
                });
                modalInstance.result.then(function(result) {
                    success(result);
                });
            }
        };
    }]);
