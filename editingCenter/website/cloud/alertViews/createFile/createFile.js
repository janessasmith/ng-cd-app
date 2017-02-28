angular.module('websiteCloudCreateFileModule', [])
    .controller("websiteCloudCreateFileCtrl", ['$scope', "$modalInstance", '$validation', 'trsHttpService', function($scope, $modalInstance, $validation, trsHttpService) {
        initStatus();
        initData();
        //初始化状态
        function initStatus() {
            $scope.status = {
                // typeOption: [{
                //     'name': "html",
                //     'value': '.html',
                // }, {
                //     'name': "shtml",
                //     'value': '.shtml',
                // }, {
                //     'name': "js",
                //     'value': '.js',
                // }, {
                //     'name': "css",
                //     'value': '.css',
                // }],
                typeParams: {
                    "serviceid": "mlf_websitefile",
                    "methodname": "queryFileExtName",
                },
                typeOption: [],
                content: "",
            };
        }
        //初始化数据
        function initData() {
            getTypes();
        }
        //获取后缀选择下拉框
        function getTypes() {
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), $scope.status.typeParams, 'post').then(function(data) {
                angular.forEach(data, function(value, key) {
                    value.name = value.FILENAME;
                    value.value = '.' + value.FILENAME;
                });
                $scope.status.typeOption = data;
                $scope.status.selectedType = $scope.status.typeOption[0];
            })
        }
        //取消
        $scope.cancel = function() {
            $modalInstance.dismiss();
        };
        //确定
        $scope.confirm = function() {
            $validation.validate($scope.createFileForm).success(function() {
                $modalInstance.close($scope.status.content + $scope.status.selectedType.value);
            });
        };
    }]);
