'use strict';
/**
 *  Module editIsLock 编辑按钮是否加锁
 *
 * Description  Ly 
 *
 * Time:2016/3/28
 */
angular.module('editIsLockModule', []).factory('editIsLock', ['$q', 'trsHttpService', '$window', 'localStorageService', function($q, trsHttpService, $window, localStorageService) {
    //监听编辑页面关闭后的稿件解锁
    $window.addEventListener("storage", function(e) {
        var draftInfo = localStorageService.get("unLocakDraft");
        if (draftInfo && draftInfo.metadataid) {
            localStorageService.remove("unLocakDraft");
            normalLock(draftInfo.metadataid).then(function(data) {
            });
        }
    });
    //稿件解锁方法
    function normalLock(metedataid) {
        var defer = $q.defer();
        var params = {
            "serviceid": "mlf_metadata",
            "methodname": "unLock",
            'MetaDataId': metedataid,
        };
        trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "post").then(function(data) {
            defer.resolve(data);
        });
        return defer.promise;
    };
    return {
        //判断是否加锁
        isLock: function(item) {
            var defer = $q.defer();
            var params = {
                "serviceid": "mlf_metadata",
                "methodname": "checkLock",
                'MetaDataId': item.METADATAID,
            };
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "post").then(function(data) {
                defer.resolve(data);
            });
            return defer.promise;
        },
        //是否强制解锁
        forceDeblocking: function(item) {
            var defer = $q.defer();
            var params = {
                "serviceid": "mlf_metadata",
                "methodname": "forcedUnLockMetaData",
                'MetaDataId': item.METADATAID,
            };
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "post").then(function(data) {
                defer.resolve(data);
            });
            return defer.promise;
        },
        //正常解锁
        normalLock: function(metadata) {
            var deffer = $q.defer();
            normalLock(metadata).then(function(data) {
                deffer.resolve(data);
            });
            return deffer.promise;
        },
        //锁定稿件
        lockDraft: function(metadata) {
            var params = {
                "serviceid": "mlf_metadata",
                "methodname": "lockDoc",
                'DocId': metadata,
            };
            trsHttpService.httpServer(trsHttpService.getWCMRootUrl(), params, "post").then(function(data) {

            });
        }
    };
}]);
