'use strict';
angular.module('plancenterInfoModule', [])
    .controller('infoDetailsCtrl', function($scope, plancenterService, leftService) {
        var msgId = leftService.getParamValue('msgId');
        plancenterService.infoinvoke('getPlanInformation', { InformationId: msgId }).then(
            function(data) { 
                var arr = [];
                angular.forEach(data.USERNAME, function(user, idx) {
                    arr.push(user.NAME);
                });
                data.allname=arr.join(',');
                $scope.info = data; 
            });
        $scope.close = function() {
            $modalInstance.dismiss();
        };
    })
