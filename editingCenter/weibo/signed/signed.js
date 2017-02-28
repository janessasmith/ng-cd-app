/**
 *  weiboSignedModule
 *
 * Description 
 * rebuild:SMG 2016-7-20
 */
"use strict";
angular.module('weiboSignedModule', []).
controller('weiboSignedCtrl', ['$scope', '$timeout', '$sce', '$stateParams', 'editingCenterWeiBoService', function($scope, $timeout, $sce, $stateParams, editingCenterWeiBoService) {
    $scope.wbSrc = $sce.trustAsResourceUrl('/wcm/app/scm/microcontent/all_microblog_list.jsp?AccountId=' + $stateParams.accountid + '&FlowStatus=10');
    $scope.modalInstance = "";
    window.addEventListener("storage", function(e) {
        event(e);
    });
    var event = function(e) {
        $timeout(function() {
            if (e.key == "weibo.processWindow") {
                editingCenterWeiBoService.weiboProcessRecord();
            }
        }, 1);
    };
    $scope.$on('$destroy', function() {
        event = function() {};
    });
}]);
