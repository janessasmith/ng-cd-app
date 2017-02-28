"use strict";
angular.module('trsPasteModule', []).directive('trsPaste', ['$window', function($window) {
    return {
        restrict: 'A',
        require: '?ngModel',
        scope:{
            files:"="
        },
        link: function(scope, iElement, iAttrs, ngModel) {
            ngModel.$render = function() {
                iElement.html(ngModel.$viewValue || 'xxx');
            };
            iElement.on('paste', function(e) {
                if (e && e.originalEvent.clipboardData && e.originalEvent.clipboardData.getData) {
                    var types = e.originalEvent.clipboardData.types || [];
                    var items = e.originalEvent.clipboardData.items;
                    for (var i = 0; i < types.length; i++) {
                        if (/(image\/[\s\S]*?)/.test(items[i].type)) {
                            var file = items[i].getAsFile();
                            file.fileName="qq截图"+new Date().getTime()+".png";
                            scope.files.push({file:file,type:4});
                            var url = $window.URL.createObjectURL(file);
                            var str = '<img trsfile imtype="msg_attach_src" src="' + url + '" style="max-width:150px; max-height: 200px;" ' +
                                ' onclick="IM.DO_pop_phone(\'' + '\', \'' + '' + '\',this)" />';
                            iElement.html( iElement.html()+str);
                            scope.$apply(function() {
                                ngModel.$setViewValue(iElement.html() + str);
                            });
                        }
                       
                    }
                }
            });
        }
    };
}])
