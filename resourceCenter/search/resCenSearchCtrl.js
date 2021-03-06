'use strict';
/** 全库搜索 */
angular.module('resCenSearchMoulde', ['resCtrModalModule']).
controller('resCenSearchCtrl', ['$scope', '$state', '$stateParams', '$location', '$modal', 'resCtrModalService', 'initComDataService', 'resourceCenterService', 'trsspliceString', 'trsconfirm', 'leftService', '$interval', 'trsHttpService', '$anchorScroll', '$timeout',
	function($scope, $state, $stateParams, $location, $modal, resCtrModalService, initComDataService, resourceCenterService, trsspliceString, trsconfirm, leftService, $interval, trsHttpService, $anchorScroll, $timeout) {
		initStatus();
		initAnchor("searchPanel")

		function initStatus() {
			var modeType = $stateParams.planKey ? "0" : "1";
			$scope.page = {
				CURRPAGE: 1,
				PAGESIZE: 10
			};
			$scope.params = {
				channelName: "",
				modelid: "expertSearch",
				searchAttributes: {
					sources: "",
					account: "",
					area: "",
					zyzxfield: "",
					content_equal: "",
					keywords_equal: "",
					content_like: "",
					keywords_like: "",
					author_like: "",
					searchType: "0",
					time: "",
					"mode": modeType
				},
				serviceid: "iwo",
				typeid: "zyzx"
			};
			requestDataPromise();
		}
		/** [initAnchor 初始化锚点] */
		function initAnchor(id) {
			$location.hash(id);
			$timeout(function() {
				$anchorScroll();
			}, 10);
		}
		/** [requestDataPromise 请求数据] */
		function requestDataPromise() {
			$scope.params = angular.extend($scope.params, {
				pageNum: $scope.page.CURRPAGE,
				pageSize: $scope.page.PAGESIZE
			});
			$scope.params.searchAttributes.content_equal = $scope.filterKeyWord || $stateParams.planKey;
			var params = angular.copy($scope.params);
			params.searchAttributes = JSON.stringify(params.searchAttributes);
			var preDate = new Date();
			trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), params, "post").then(function(data) {
				if (data.result == "success") {
					var pageInfo = data.summary_info;
					$scope.items = data.content;
					$scope.page = angular.extend($scope.page, pageInfo);
				}
				var nowDate = new Date();
				$scope.costTime = (nowDate.getTime() - preDate.getTime()) / 1000;
			});
		}
		/** [搜索] */
		$scope.searchWithKeyword = requestDataPromise;
		$scope.keypressRefresh = function(evt) {
			if (evt.keyCode == 13) { //回车事件
				requestDataPromise();
			}
		};
		/** －－－－－－－分页开始－－－－－－ */
		/** 翻页 */
		$scope.pageChanged = function() {
			requestDataPromise();
		};
		$scope.$watch("page.CURRPAGE", function(newValue) {
			if (newValue > 0) {
				$scope.jumpToPageNum = newValue;
			}
		});
		/*跳转指定页面*/
		$scope.jumpToPage = function() {
			if ($scope.jumpToPageNum > $scope.page.PAGECOUNT) {
				$scope.page.CURRPAGE = $scope.page.PAGECOUNT;
				$scope.jumpToPageNum = $scope.page.CURRPAGE;
			}
			$scope.page.CURRPAGE = $scope.jumpToPageNum;
			requestDataPromise();
		};
		/** 下拉页面 */
		$scope.selectPageNum = function() {
			$timeout(function() {
				requestDataPromise();
			});
		};
		/** －－－－－－－分页结束－－－－－－ */
	}
]);