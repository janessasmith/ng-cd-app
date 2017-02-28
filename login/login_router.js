"use strict";
angular.module('loginRouterModule', []).config(['$stateProvider', function($stateProvider) {
    $stateProvider.state('login', {
        url: '/login',
        views: {
            '': {
                templateUrl: './login/template/login_tpl.html',
                controller: "loginCtrl"
            }
        },
        resolve: {
            login: function($state, $window, versionCtrl, loginService, localStorageService, $location) {
                if (versionCtrl.isDev || versionCtrl.isDebug) {
                    return;
                } else {
                    var curUrl = window.location.href;
                    var curUrlArray = curUrl.split("/");
                    var redirUrl = "https://" + curUrlArray[2] + "/login/login.html";
                }
                //var redirUrl = versionCtrl.isOffical ? "https://mlf.8531.cn/login/login.html" : "https://csmlf.8531.cn/login/login.html";
                loginService.checkLogin().then(function(data) {
                    if (data === 'true') {
                        var mlfCachedUser = localStorageService.get("mlfCachedUser");
                        var curusergroupid = angular.isUndefined($location.search().curusergroupid) ? "" : $location.search().curusergroupid;
                        var curusername = angular.isUndefined($location.search().curusername) ? "" : $location.search().curusername;
                        if (mlfCachedUser !== null) {
                            mlfCachedUser.GroupId = curusergroupid;
                            mlfCachedUser.UserName = curusername;
                        } else {
                            mlfCachedUser = { GroupId: curusergroupid, UserName: curusername };
                        }
                        localStorageService.set("mlfCachedUser", mlfCachedUser);
                        localStorageService.set("currLoginUser", curusername);
                        var urlStorage = localStorageService.get('historyUrl');
                        var state = (urlStorage && urlStorage.state.name !== "") ? urlStorage.state.name : "editctr.iWo.personalManuscript";
                        var param = urlStorage ? urlStorage.params : {};
                        $state.go(state, param, { reload: true });
                    } else {
                        $window.location.href = redirUrl;
                    }

                });

            }
        }
    });
}]);
