'use strict';
angular.module('editingCenterModule', [
    'editingCenterRouterModule',
    'editingCenterLeftModule',
    // 'editingCenterNaviModule',
    'editingCenterAppModule',
    'editingCenterWeiXinModule',
    'trsNavLocationModule',
    'trsEditorModule',
    'trsEditorAuthMoule',
    'trsUserSupportModule',
    'ngTagsInput',
    'mgcrea.ngStrap.typeahead',
    'mgcrea.ngStrap.popover',
    'editingCenterIWoModule',
    'editingCenterNewspaperModule',
    'editingCenterWebsiteModule',
    'initSingleSelectionModule',
    'editingCenterServiceModule',
    'editctrInitBtnModule',
    "editctrFilterBtnModule",
    "editLeftRouterModule",
    "editctrSupportCreationModule",
    "editcenterRightsModule",
    "editIsLockModule",
    "editingCenterWeiBoModule",
]).
controller('EditingCenterController', ['$scope', '$state', '$location',
    function($scope, $state, $location) {
        
    }
]).value('editingMediatype', {
    // 网站：1，APP：2，微信：3，微博：4
    website:1,
    app:2,
    weixin:3,
    weibo:4,
});
