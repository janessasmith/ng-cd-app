angular.module('websiteCloudModifyFileModule', [
        'editCloudWebsiteInsertFragmentModule'
    ])
    .controller("websiteCloudModifyFileCtrl", ['$scope', "$sce", '$modal', "$modalInstance", '$validation', 'trsHttpService', 'transmission', function($scope, $sce, $modal, $modalInstance, $validation, trsHttpService, transmission) {
        initStatus();
        initData();
        //初始化请求数据
        function initData() {
            getFileContent();
        }
        //初始化状态
        function initStatus() {
            $scope.params = {
                "serviceid": "mlf_websitefile",
                "methodname": "getFileContent",
                "ChannelId": transmission.channelid,
                "FilePath": transmission.file.ABSOLUTENAME,
            }
            $scope.data = {
                name: transmission.file.NAME,
                siteid: transmission.siteid,
                type: transmission.file.NAME.substr(transmission.file.NAME.lastIndexOf('.') + 1),
            }
            $scope.status = {
                content: '',
                canInsertFragment: ['html', 'shtml'],
                batchOperateBtn: {
                    "hoverStatus": "",
                    "clickStatus": ""
                },
            }
        }
        //获取当前文件的内容
        function getFileContent() {
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), $scope.params, "post").then(function(data) {
                $scope.status.content = data;
            });
        };
        //插入碎片
        $scope.insertFragment = function() {
            var modalInstance = $modal.open({
                templateUrl: "./editingCenter/website/cloud/alertViews/insertFragment/insertFragment_tpl.html",
                scope: $scope,
                windowClass: 'man_produ_insert',
                backdrop: false,
                controller: "editCloudWebsiteInsertFragmentCtrl",
                resolve: {
                    transmission: function() {
                        return {
                            siteid: $scope.data.siteid
                        };
                    }
                }
            });
            modalInstance.result.then(function(result) {
                if (angular.isDefined($scope.textStart)) {
                    $scope.status.content = angular.isDefined($scope.status.content) ? $scope.status.content.substring(0, $scope.textStart) + ('<!--#include virtual="' + result.INCLUDE + '" -->\n<!--' + result.NOTE + '-->') + $scope.status.content.substring($scope.textStart) : ('<!--#include virtual="' + result.INCLUDE + '" -->\n<!--' + result.NOTE + '-->');
                } else {
                    $scope.status.content = angular.isDefined($scope.status.content) ? $scope.status.content + ('<!--#include virtual="' + result.INCLUDE + '" -->\n<!--' + result.NOTE + '-->') : ('<!--#include virtual="' + result.INCLUDE + '" -->\n<!--' + result.NOTE + '-->');
                }
                console.log(result);
            });
        };
        //锁定光标的位置
        $scope.startInner = function() {
            $scope.textStart = document.getElementById('text').selectionStart;
        };
        //取消
        $scope.cancel = function() {
            $modalInstance.dismiss();
        };
        //确定
        $scope.confirm = function() {
            $validation.validate($scope.modifyFileForm).success(function() {
                $modalInstance.close($scope.status.content);
            });
        };
    }]);
