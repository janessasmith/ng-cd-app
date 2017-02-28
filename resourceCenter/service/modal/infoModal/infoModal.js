'use strict';
angular.module('resourceInfoModule', []).
controller('infoModalCtrl', function($scope, $modalInstance, $timeout, $location, $anchorScroll, resourceCenterService, params, trsconfirm) {
    $scope.showRepeatInfo = params.isShowRepeat;
    /*锚点切换开始*/
    $scope.goto = function(id) {
        $location.hash(id);
        $anchorScroll();
    };
    var params = {
        'MetaDataId': params.docId
    }
    resourceCenterService.getOperTags(params).then(function(data) {
        $scope.infos = data;
        angular.forEach($scope.infos.QU, function(value, key) {
            if (angular.isDefined(value.OPERUSER)) {
                var temp = value.OPERUSER.split('-');
                value.OPERUSER = temp.length > 1 ? temp[0] + '-' + temp.pop() : temp[0];
            }
        });
    }, function() {
        trsconfirm.alertType("", "获取稿件标签失败!", "error", false);
    });
    $scope.close = function() {
        $modalInstance.dismiss();
    };
    $scope.toggleShowRepeatInfo = function(value) {
        $scope.showRepeatInfo = value;
    }
}).
controller('bigDataInfoModalCtrl', function($scope, $modalInstance, $timeout, $location, $anchorScroll, resourceCenterService, options, trsconfirm) {
    $scope.showRepeatInfo = options.isShowRepeat;
    var params = {
            'guid': options.guid
        }
        /*锚点切换开始*/
    $scope.goto = function(id) {
        $location.hash(id);
        $anchorScroll();
    };
    resourceCenterService.getBigDataOperTags(params).then(function(data) {
        $scope.infos = data;
        angular.forEach($scope.infos.QU, function(value, key) {
            if (angular.isDefined(value.OPERUSER)) {
                var temp = value.OPERUSER.split('-');
                value.OPERUSER = temp.length > 1 ? temp[0] + '-' + temp.pop() : temp[0];
            }
        });
    }, function() {
        trsconfirm.alertType("", "获取稿件标签失败!", "error", false);
    });
    $scope.close = function() {
        $modalInstance.dismiss();
    };
    $scope.toggleShowRepeatInfo = function(value) {
        $scope.showRepeatInfo = value;
    }
})
.controller('materialInfoModalCtrl', function($scope, $modalInstance, $timeout, $location, $anchorScroll, resourceCenterService, params, trsHttpService, trsconfirm) {
    initData();
    function initData() {
        var materialparams = {
            serviceid: 'nb_materialrelease',
            methodname: 'queryQuOpers',
            MaterialId: params.docId
        };
        trsHttpService.httpServer(trsHttpService.getWCMRootUrl(),materialparams,'get').then(function(data) {
            $scope.infos = data;
            angular.forEach($scope.infos.QU, function(value, key) {
                if (angular.isDefined(value.OPERUSER)) {
                    var temp = value.OPERUSER.split('-');
                    value.OPERUSER = temp.length > 1 ? temp[0] + '-' + temp.pop() : temp[0];
                }
            });
        }, function() {
            trsconfirm.alertType("", "获取稿件标签失败!", "error", false);
        });
    }
    /*锚点切换开始*/
    $scope.goto = function(id) {
        $location.hash(id);
        $anchorScroll();
    };

    $scope.close = function() {
        $modalInstance.dismiss();
    };
    $scope.toggleShowRepeatInfo = function(value) {
        $scope.showRepeatInfo = value;
    }
});
