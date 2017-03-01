'use strict';
angular.module('editingCenterModule', [
    'editingCenterRouterModule',
    'editingCenterLeftModule',
    'editingCenterNaviModule',
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
    // APP：1，网站：2，报纸：3，微信：4，微博：5
    website:1,
    app:2,
    weixin:3,
    weibo:4,
});
