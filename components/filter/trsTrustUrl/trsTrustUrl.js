"use strict";
/**
 * trsTrustUrlModule
 *
 * Description  信任URL
 * 
 * Created by XueXiaoting on 2016/12/13
 */
angular.module('trsTrustUrlModule', [])
.filter("trsTrustUrl", ['$sce', function($sce) {
    return function(url) {
        return $sce.trustAsResourceUrl(url);
    };
}]);