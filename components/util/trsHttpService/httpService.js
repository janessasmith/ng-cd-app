/*
 created by wang.jiang 2015/9/23
 所有HTTP请求统一服务；
 */
'use strict';
angular.module('util.httpService', []).
factory('trsHttpService', ['$http', '$q', '$timeout', '$state', '$window', 'trsconfirm', 'versionCtrl', 'localStorageService', function($http, $q, $timeout, $state, $window, trsconfirm, versionCtrl, localStorageService) {
    return {
        httpServer: function(url, params, type) {
            var deferred = $q.defer();
            handlePost(url, params, type).then(function(data) {
                deferred.resolve(data);
            }, function(data) {
                deferred.reject(data);
            });
            return deferred.promise;
        },
        getWCMRootUrl: function() {
            var rootUrl = "/gov/gov.do";
            return rootUrl;
        },
        getBigDataRootUrl: function() {
            var rootUrl = "/wcm/bigdata.do";
            return rootUrl;
        },
        getLogManageUrl: function() {
            var rootUrl = "/wcm/mlflog.do";
            return rootUrl;
        },
        getLoginServiceUrl: function() {
            var loginUrl = "/wcm/security/login";
            return loginUrl;
        },
        getUploadUrl: function() {
            var uploadUrl = "/wcm/openapi/uploadImage";
            return uploadUrl;
        },
        getWeiboUploadUrl: function() {
            var weiboUploadUrl = "/wcm/openapi/uploadImageForMicroBlog";
            return weiboUploadUrl;
        },
        getCheckLoginUrl: function() {
            var checkLoginUrl = "/wcm/security/checkLogin";
            return checkLoginUrl;
        },
        getPaymentSystem: function() {
            var loadUrl = "/wcm/stlogin/mrslogin";
            return loadUrl;
        },
        getMasConfig: function() {
            var masConfig = {
                "100.100.101.55": "TRSWCM9",
                "100.100.101.101":"NXRBWCM",
                "100.100.101.35":"NXRBWCM"
            };
            var myUrl = $window.location.href;
            var appKey = "";
            for (var i in masConfig) {
                if (myUrl.indexOf(i) >= 0) {
                    appKey = masConfig[i];
                }
            }
            return appKey;
        },
        getMasUrl: function() {
            var myUrl = $window.location.href;
            var masUrlConfig = {
                "100.100.101.55": "http://100.100.101.55",
                '100.100.101.101':"http://100.100.101.101",
                '100.100.101.35':"http://100.100.101.35"
            };
            var masUrl = "";
            for (var i in masUrlConfig) {
                if (myUrl.indexOf(i) >= 0) {
                    masUrl = masUrlConfig[i];
                }
            }
            return masUrl;
        },
        getMasUploadUrl: function() { //mas上传视频接口url
            var masUploadUrl = this.getMasUrl() + "/mas/service/upload?appKey=" + this.getMasConfig();
            return masUploadUrl;
        },
        getMasSubmitUrl: function() { //mas视频提交发布接口url
            var masSubmitUrl = this.getMasUrl() + "/mas/service/masJobSubmit?appKey=" + this.getMasConfig();
            return masSubmitUrl;
        },
        getMasPubUrl: function() { //获取mas视频发布地址接口url
            var masPubUrl = this.getMasUrl() + "/mas/openapi/pages.do?method=prePlay&appKey=" + this.getMasConfig();
            return masPubUrl;
        },
        getMasDownloadUrl: function() { //获取mas视频下载地址接口
            var masDownloadUrl = this.getMasUrl() + "/mas/openapi/pages.do?method=download&appKey=" + this.getMasConfig();
            return masDownloadUrl;
        }
    };

    function handlePost(url, params, type) {
        type = angular.uppercase(type);
        var deferred = $q.defer();
        if (angular.isUndefined(type)) {
            deferred.reject("所需参数type没有传入！");
            return deferred.promise;
        }
        if (type != 'POST' && type != 'GET' && type != 'DELETE') {
            deferred.reject("参数【" + type + "】错误！");
            return deferred.promise;
        }
        $http({
            method: type,
            url: url,
            headers: {
                'formdata': "1",
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: type == 'POST' ? params : "",
            params: type == 'POST' ? "" : params
        }).success(function(data, status, headers, config) {
            if (headers("TRSNotLogin")) {
                if (versionCtrl.isDev || versionCtrl.isDebug) {
                    $state.go("login");
                    deferred.reject();
                } else {
                    var curUrl = window.location.href;
                    var curUrlArray = curUrl.split("/");
                    window.location.href = "https://" + curUrlArray[2] + "/login/login.html";
                }
            } else if (angular.isDefined(data.ISSUCCESS) && data.ISSUCCESS == "false") {
                if (angular.isArray(data.REPORTS)) {
                    trsconfirm.multiReportsAlert(data, "");
                } else {
                    trsconfirm.alertType(data.TITLE, data.DETAIL, "warning", false);
                }
                deferred.reject(data);
            } else if (angular.isDefined(data.status) && data.status == "-1") {
                // trsconfirm.alertType(data.message, data.detail, "error", false, function() {
                //     // $window.close();
                // });
                deferred.reject(data);
            } else {
                deferred.resolve(data);
            }
        }).error(function(data, status, headers, config) {
            if (status === 503) {
                trsconfirm.alertType('', "未能正常连接到后台，请检查网络或服务!", "error", false);
            }
            if (status === 404) {
                trsconfirm.alertType('', "您请求资源：【" + url + "】不存在！", "error", false);
            }
            deferred.reject(data);
        });
        return deferred.promise;
    }
}]);
