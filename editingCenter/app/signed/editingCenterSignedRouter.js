'use strict';
angular.module('editingCenterSignedRouterModule', []).
config(['$stateProvider', function($stateProvider) {

    $stateProvider.state('editctr.app.signed', {
        url: '/signed?channelid&type',
        views: {
            'main@editctr': {
                templateUrl: function($stateParams) {
                    var type = $stateParams.type ? $stateParams.type.toLowerCase() : 'app';
                    return './editingCenter/app/signed/' + type + '_tpl.html';
                },
                controllerProvider:function($stateParams){
                    var type = $stateParams.type ? $stateParams.type.toLowerCase() : 'app';
                    return 'editingCenterSigned' + type + 'Ctrl';
                }
            }
        }
    }).state('editctr.app.signed.focus', {
        url: '/focus',
        views: {
            'main@editctr': {
                templateUrl: './editingCenter/app/signed/focus/main_focus_tpl.html',
                // controller:'editCompileSignedFocusController'
            }
        }
    }).state('editctr.app.signed.retraction', {
        url: '/retraction',
        views: {
            'main@editctr': {
                templateUrl: './editingCenter/app/signed/retraction/main_retraction_tpl.html',
                controller: 'editCompileSignedRetractionCtroller'
            }
        }
    });
}]);
