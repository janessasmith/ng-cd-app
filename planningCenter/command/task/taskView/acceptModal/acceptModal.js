angular.module("acceptModalModule", []).controller('acceptModalCtrl', function($scope, $modalInstance, trsHttpService, selectItems, trsspliceString, trsconfirm) {
	initStatus();
	// 关闭
	$scope.close = function() {
		$modalInstance.dismiss();
	};
	$scope.requestDataPromise = requestDataPromise;
	// 选择公众号
	$scope.slectItem = function(item, index) {
		item.ischecked = !item.ischecked;
		if (item.ischecked) {
			$scope.selectedList.push(item);
		} else {
			$scope.selectedList.splice(index, 1);
		}
	};
	// 移除已选
	$scope.removeItem = function(index) {
		if ($scope.data.items.length == 1) return;
		$scope.data.items.splice(index, 1);
	};
	// 确定
	$scope.sendInfo = function() {
		var params = {
			serviceid: "mlf_task",
			methodname: "acceptPlanTask",
			TaskUserId: trsspliceString.spliceString($scope.data.items, "TASKUSERID", ",")
		};
		trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "post").then(function(data) {
			if (data.ISSUCCESS == "true") {
				trsconfirm.alertType("接受成功！", "", "success", false, "");
				$modalInstance.close();
			}
		});
	};
	// 分页
	$scope.pageChanged = function() {
		$scope.copyCurrPage = $scope.page.CURRPAGE;
		requestDataPromise();
	};

	/*跳转指定页面*/
	$scope.jumpToPage = function() {
		if ($scope.copyCurrPage > $scope.page.PAGECOUNT) {
			$scope.copyCurrPage = $scope.page.PAGECOUNT;
		}
		$scope.page.CURRPAGE = $scope.copyCurrPage;
		requestDataPromise();
	};
	/** [hasSelected 判读是否已接受] */
	$scope.hasSelected = function() {
		if ($scope.data.items.length == 1 && $scope.data.items[0].TASKSTATUS == 3 || $scope.data.items.length == 0) {
			return true;
		} else {
			return false;
		}
	}


	function initStatus() {
		$scope.data = {
			items: selectItems
		}
	}

	function requestDataPromise() {
		var params = angular.extend($scope.params, {
			pageNum: $scope.page.CURRPAGE,
			pageSize: $scope.page.PAGESIZE
		});
		trsHttpService.httpServer(trsHttpService.getBigDataRootUrl(), params, "post").then(function(data) {
			$scope.page = data.summary_info;

			angular.forEach(data.content, function(n, i) {
				n.newsId = $scope.page.PAGESIZE * ($scope.page.CURRPAGE - 1) + i + 1;
			});
			$scope.items = data.content;
		}, function(msg) {
			console.log(msg);
		});
	}
});