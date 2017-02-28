"use strict";
/*
	modify by cc 16-11-28
 */
angular.module('resCenterXHRouterModule', ['resourceCenterXinhuaLeftModule','resourceCenterXinhuaModule']).config(['$stateProvider', function($stateProvider) {
	$stateProvider.state("resourcectrl.xinhua.resource", {
		url: '/resource?metacid&nodeid&nodename&change',
		views: {
			'resource@resourcectrl.xinhua': {
				templateUrl: './resourceCenter/XinhuaNews/xinhua_main_tpl.html',
				controller: 'resCenterXHRelCtrl'
			}
		}
	});
}]);