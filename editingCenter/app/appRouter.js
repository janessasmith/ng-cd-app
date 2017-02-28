'use strict';
angular.module('editingCenterAppRouterModule', [])
    .
config(['$stateProvider', '$urlRouterProvider', function($stateProvider,
    $urlRouterProvider) {
    // $stateProvider.state('editctr.app', {
    //     url: '/app?siteid',
    //     views: {
    //         'main@editctr': {
    //             templateUrl: './editingCenter/main_tpl.html',
    //         },
    //         'left@editctr.app': {
    //             templateUrl: './editingCenter/app/left_tpl.html',
    //             controller: 'appLeftCtrl'
    //         },
    //         'footer@editctr.app': {
    //             templateUrl: './footer_tpl.html'
    //         }
    //     }
    // });
    $stateProvider.state('editctr.app', {
        url: '/app?siteid',
        views: {
                'app@editctr': {
                    templateUrl: './editingCenter/app/left_tpl.html',
                    controller: 'appLeftCtrl'
                }
            
        }
    });
}]);
