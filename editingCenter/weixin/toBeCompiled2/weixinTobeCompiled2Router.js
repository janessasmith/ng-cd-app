"use strict";
angular.module('weixinTobeCompiledTwoRouter', []).config(['$stateProvider',function ($stateProvider) {
	$stateProvider.state('editctr.weixin.tobecompiled2',{
		url:'/tobecompiled2?channelid',
		views:{
			'main@editctr':{
				templateUrl:'./editingCenter/weixin/toBeCompiled2/main_tpl.html',
				controller:'WeiXinTobeCompiledTwoCtrl'
			}
		}
	});
}]);