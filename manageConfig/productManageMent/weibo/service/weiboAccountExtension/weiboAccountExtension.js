/**
 * 产品管理 微博 微博账号延期
 * by zhou 2016-8-22
 */
"use strict";
angular.module("weiboAccountExtensionModule", [])
    .controller('weiboAccountExtensionCtrl', ['$scope', '$modalInstance', function($scope, $modalInstance) {
        /**
         * [cancel description] 取消
         * @return {[type]} [description]
         */
        $scope.cancel = function() {
            $modalInstance.dismiss();
        };

        $scope.sinaWeibo = function(){
        	 window.open('/wcm/app/scm/sina_authorized.jsp');
             $modalInstance.close();
        };
        $scope.tencentWeibo = function(){
        	window.open('/wcm/app/scm/tencent_authorized.jsp');
            $modalInstance.close();
        };
    }]);
