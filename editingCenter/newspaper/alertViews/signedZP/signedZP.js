/**
 * Author:XCL
 *
 * Time:2016-01-15
 */
"use strict";
angular.module('editNewspapaerSignedZPModule', [])
    .controller('editNewspapersignedZPCtrl', ['$scope', '$filter', '$modalInstance', 'trsHttpService', 'item', 'trsspliceString', 'trsconfirm', function($scope, $filter, $modalInstance, trsHttpService, item, trsspliceString, trsconfirm) {
        initStatus();

        function initStatus() {
            $scope.items = item;
            $scope.isRequeted = false;
        }
        $scope.cancel = function() {
            $modalInstance.dismiss();
        };
        /**
         * [reponseFilter description]过滤返回的reports
         * @param  {[obj]} elm [description]各个返回的report
         * @return {[null]}     [description]
         */
        $scope.reportsFilter = function(elm) {
            if (angular.isDefined(elm)) {
                return elm.ISSUCCESS == 'false';
            }
        };
        /**
         * [successReportsFilter description]过滤返回的签发成功项
         * @param  {[obj]} elm [description]返回的report
         * @return {[type]}     [description]
         */
        $scope.successReportsFilter = function(elm) {
            if (angular.isDefined(elm)) {
                return elm.ISSUCCESS == 'true';
            }
        };
        $scope.confirm = function() {
            var params = {
                serviceid: "mlf_paper",
                methodname: "doQianFa",
                SrcDocIds: trsspliceString.spliceString(item,
                    'METADATAID', ','),
                IsPaiChong: true,
            };
            $scope.loadingPromise = trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "get").then(function(data) {
                trsconfirm.alertType("签发照排成功", "", "success", false, function() {
                    $modalInstance.close("success");
                });
            }, function(data) {
                var failTemp = $filter('pick')(angular.copy(data.REPORTS), $scope.reportsFilter);
                var successTemp = $filter('pick')(angular.copy(data.REPORTS), $scope.successReportsFilter);
                var result = {
                    reports: failTemp,
                    params: params,
                    successReports: successTemp,
                };
                $modalInstance.close(result);
            });
        };
    }]);
