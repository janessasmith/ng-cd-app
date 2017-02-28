// create by ma.rongqin 2016.9.1
'use strict'
angular.module('planLSCentralKitchenModule', [
        'planLSCentralKitchenRouterModule',
        'planLSCentralKitchenIPModule',
        'planLSCentralKitchenCodeModule',
        'planLSCentralKitchenMediaModule',
    ])
    .controller('planLSCentralKitchenCtrl', ['$scope', '$state', function($scope, $state) {
        //默认跳转ip配置
        $state.go('plan.centralkitchen.ipconfig');
        //重新刷新路由
        $scope.stateRouter = function(router) {
            $state.go('plan.centralkitchen.' + router);
        };
    }]);
