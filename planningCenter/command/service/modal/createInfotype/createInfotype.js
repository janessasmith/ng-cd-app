'use strict';
angular.module('infotypeModule', []).controller('createInfotypeCtrl', function($scope, $modalInstance,trsspliceString, plancenterService) {
    $scope.types = [];
    $scope.close = function() {
        $modalInstance.dismiss();
    };
    $scope.submit = function() { 
        var typename=trsspliceString.getValuesBykey($scope.types, 'name').join(',');
        plancenterService.infoinvoke('saveInfoType', {InfoType:typename}).then(
            function(data) {
                $modalInstance.close(data)
        });
    }
}).controller('editInfotypeCtrl', function($scope, $modalInstance,trsspliceString, plancenterService,type) {
    $scope.typename = type.VALUE;
    $scope.close = function() {
        $modalInstance.dismiss();
    };
    $scope.submit = function() {  
        plancenterService.infoinvoke('editInfoType', {InfoTypeId:type.INFORTYPEID,InfoType:$scope.typename}).then(
            function(data) {
                $modalInstance.close(data)
        });
    }
});
