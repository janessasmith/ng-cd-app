/*create by bai.zhiming 2016.10.11*/
"use strict";
angular.module('editCenWebsiteSigedPushBarToMlfModule', [])
    .controller('editCenWebsiteSigedPushBarToMlfCtrl', ['$scope', '$modalInstance', "trsHttpService", 'trsconfirm', 'title', function($scope, $modalInstance, trsHttpService, trsconfirm, title) {
        initStatus();
        initDatas();
        //确认
        $scope.confirm = function() {
            if ($scope.selected == '') {
                trsconfirm.alertType("请选择栏目", "", "warning", false);
            } else {
                trsconfirm.confirmModel("推首页", "您确认要推至<span class='text_red'>" + $scope.selected.CHNLDESC + "</span>首页？", function() {
                    var params = {
                        serviceid: 'mlf_website',
                        methodname: 'pushHomePage',
                        ChannelId: $scope.selected.CHANNELID,
                    };
                    $modalInstance.close(params);
                });
            }
        };
        //取消
        $scope.cancel = function() {
            $modalInstance.dismiss();
        };

        function initStatus() {
            $scope.selected = '';
            $scope.params = {
                serviceid: 'mlf_website',
                methodname: 'getHomePages'
            };
            $scope.title = title;
        }

        function initDatas() {
            requestData();
        }
        //请求首页栏目列表
        function requestData() {
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), $scope.params, 'post').then(function(data) {
                $scope.datas = data;
            });
        }
        //选择哪一个站点
        $scope.selectChannel = function(item) {
            $scope.selected = angular.copy(item);
        };
    }]);
