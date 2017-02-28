/*
	Create by XueXiaoting 2016-12-06
*/
"use strict";
angular.module("imgUrlCopyModule", ["ngClipboard"])
    .controller("imgUrlCopyCtrl", ["$scope","$modalInstance","copyParams","trsconfirm", function($scope,$modalInstance,copyParams,trsconfirm) {
    	$scope.url = copyParams.imgUrl;
    	$scope.imgUrlCopy = function(){
    		trsconfirm.alertType("复制成功","复制成功","success",false,function(){
    			$modalInstance.dismiss();
    		});
    	};
    	$scope.cancel = function(){
    		$modalInstance.dismiss();
    	};
    }]);