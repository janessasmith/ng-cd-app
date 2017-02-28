'use strict';
angular.module('productManageMentAppModule', [
    'productManageMentAppRouterModule',
    'productManageMentAppChannelModule',
    'productManageMentAppColumnModule',
    //'productManageMentAppDistributeConfigModule',
    'manageProAppSiteModule',
    'productManageMentAppTemplateModule',
    "editManuSourceAppModule",
    'proManaMentAppFootModule',
    'productManageMentAppServiceModule'
]).
controller('appController', ['$scope', '$state', 'trsHttpService', 'trsconfirm', '$modal', '$stateParams', 'localStorageService', 'productMangageMentAppService', function($scope, $state, trsHttpService, trsconfirm, $modal, $stateParams, localStorageService, productMangageMentAppService) {
    //$state.go("manageconfig.productmanage.app.site");
}]);
