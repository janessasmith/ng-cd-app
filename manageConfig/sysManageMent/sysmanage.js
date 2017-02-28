'use strict';
angular.module('sysmanageModule', [
    'sysmanageRouterModule',
    'cDMainModule',
    'sysManageMentSensitiveWordModule',
    'manConSysSouCenClassifyMgrModule',
    'manageSysManageEmailConfigModule',
    'manageSysManageSMSGatewayConfigModule',
    'manageSysManageSourceManageModule',
    'manageSysManagePlanDispatchModule',
    'manageSysManageHotWordsManageModule',
    'manageSysManageStatusManageModule',
    'manageSysManageReleaseComponentManageModule',
    'manageSysManageSMSTempConfigModule',
    'manageSysManageEmailTempConfigModule',
    'manageSysManageOtherConfigurationModule',
    'manageSysManageSystemFieldModule',
    'manageSysManageTypeMgrModule',//新增稿库类型管理
]).
controller('SysmanageController', ['$scope', '$state', function($scope, $state) {
    initStatus();

    $scope.setSelectedOption = function(item, title) {
        $scope.optionSelected = item;
        $scope.titleName = title;
    };

    function initStatus() {
        var current = $state.current.name.split('.');
        if (current.length === 2) {
            $scope.titleName = "分类词典";
            $scope.optionSelected = "classifieddictionary";
            $state.go("manageconfig.sysmanage.classifieddictionary.classification");
        } else if (current.length >= 3) {
            var list = {
                'emailconfig': {
                    'name': '邮件设置',
                    'active': 'emailset'
                },
                'smsgatewayconfig': {
                    'name': '短信网关设置',
                    'active': 'messagegatewayset'
                },
                'sensitiveword': {
                    'name': '敏感词设置',
                    'active': 'sensitivewordsset'
                },
                'sourcemanage': {
                    'name': '来源管理',
                    'active': 'sourcemanagement'
                },
                'plandispatch': {
                    'name': '计划调度类型管理',
                    'active': 'scheduling'
                },
                'hotwordsmanage': {
                    'name': '热词管理',
                    'active': 'hotwordmanagement'
                },
                'statusmanage': {
                    'name': '状态管理',
                    'active': 'statemanagement'
                },
                'releasecomponentmanage': {
                    'name': '发布组件管理',
                    'active': 'releasecomponentmanagement'
                },
                'smstempconfig': {
                    'name': '短信模板设置',
                    'active': 'SMStemplatesettings'
                },
                'emailtempconfig': {
                    'name': '邮件模板设置',
                    'active': 'emailmoduleset'
                },
                'otherconfiguration': {
                    'name': '其他配置',
                    'active': 'otherset'
                },
                'systemfield': {
                    'name': '系统字段',
                    'active': 'systemfield'
                },
                'classifieddictionary': {
                    'name': '分类词典',
                    'active': 'classifieddictionary'
                },
                'typemgr': {
                    'name': '稿库类型管理',
                    'active': 'typemgr'
                },
                'categoryrelation': {
                    'name': '稿库类别关联',
                    'active': 'categoryrelation'
                }
            };
            $scope.titleName = list[current[2]].name;
            $scope.optionSelected = list[current[2]].active;
        }
    }
}]);
// controller('SysmanageController', ['$scope', '$state', function($scope, $state) {
//     initStatus();
//     initData();

//     // $state.go("manageconfig.sysmanage.classifieddictionary.classification");
//     $scope.setSelectedOption = function(item, title) {
//         $scope.optionSelected = item;
//         $scope.titleName = title;
//     };

//     function initData() {
//         $scope.optionSelected = "classifieddictionary";
//     }

//     function initStatus() {
//         var current = $state.current.name.split('.');
//         if (current.length === 2) {
//             $scope.titleName = "分类词典";
//             $scope.optionSelected = "classifieddictionary";
//             $state.go("manageconfig.sysmanage.classifieddictionary.classification");
//         } else if (current.length >= 3) {
//             var list = {
//                 'emailconfig': {
//                     'name': '邮件设置',
//                     'active': 'emailset'
//                 },
//                 'smsgatewayconfig': {
//                     'name': '短信网关设置',
//                     'active': 'messagegatewayset'
//                 },
//                 'sensitiveword': {
//                     'name': '敏感词设置',
//                     'active': 'sensitivewordsset'
//                 },
//                 'sourcemanage': {
//                     'name': '来源管理',
//                     'active': 'sourcemanagement'
//                 },
//                 'plandispatch': {
//                     'name': '计划调度类型管理',
//                     'active': 'scheduling'
//                 },
//                 'hotwordsmanage': {
//                     'name': '热词管理',
//                     'active': 'hotwordmanagement'
//                 },
//                 'statusmanage': {
//                     'name': '状态管理',
//                     'active': 'statemanagement'
//                 },
//                 'releasecomponentmanage': {
//                     'name': '发布组件管理',
//                     'active': 'releasecomponentmanagement'
//                 },
//                 'smstempconfig': {
//                     'name': '短信模板设置',
//                     'active': 'SMStemplatesettings'
//                 },
//                 'emailtempconfig': {
//                     'name': '邮件模板设置',
//                     'active': 'emailmoduleset'
//                 },
//                 'otherconfiguration': {
//                     'name': '其他配置',
//                     'active': 'otherset'
//                 },
//                 'systemfield': {
//                     'name': '系统字段',
//                     'active': 'systemfield'
//                 },
//                 'classifieddictionary': {
//                     'name': '分类词典',
//                     'active': 'classifieddictionary'
//                 },
//                 'typemgr': {
//                     'name': '稿库类型管理',
//                     'active': 'typemgr'
//                 },
//                 'categoryrelation': {
//                     'name': '稿库类别关联',
//                     'active': 'categoryrelation'
//                 }
//             };
//             $scope.titleName = list[current[2]].name;
//             $scope.optionSelected = list[current[2]].active;
//         }
//     }
//     // function initStatus() {
//     //     $scope.titleName = "系统管理";
//     // }
// }]);
