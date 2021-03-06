/**
 *  weiboCollectModule
 *
 * Description 
 * rebuild:SMG 2016-7-20
 */
"use strict";
angular.module('weiboCollectModule', []).
controller('weiboCollectCtrl', ['$scope', '$timeout', '$window', '$sce', '$stateParams', '$modal', 'editingCenterWeiBoService',
    function($scope, $timeout, $window, $sce, $stateParams, $modal, editingCenterWeiBoService) {
        $scope.wbSrc = $sce.trustAsResourceUrl('/wcm/app/scm/microcontent/show_favorites_list.jsp?AccountId=' + $stateParams.accountid + '&t=' + Math.random());
        $scope.modalInstance = "";
        window.addEventListener("storage", function(e) {
            event(e);
        });

        var event = function(e) {
            $timeout(function() {
                if (e.key == "weibo.microblogWindow") {
                    editingCenterWeiBoService.weiboGeneralBox(function() {
                        $scope.wbSrc = $sce.trustAsResourceUrl('/wcm/app/scm/microcontent/show_favorites_list.jsp?AccountId=' + $stateParams.accountid + '&t=' + Math.random());
                    });
                } else if (e.key == "weibo.close") {
                    $scope.modalInstance.dismiss();
                }
            }, 1);
        };

        $scope.$on('$destroy', function() {
            event = function() {};
        });
    }
]);
