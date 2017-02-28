"use strict";
/*
    Create By CC 2015-12-12
*/
/*
    使用：<trs-pagenation-right callback="" currpage=""></trs-pagenation-right>
    功能：替换通用的分页跳转到功能
    callback：父控制器的回调函数
    currpage：传入的当前页数
 */
angular.module('trsPagenationConfigRightModule', []).
directive('trsPagenationRight', ["$timeout", function($timeout) {
    return {
        restrict: 'EA',
        templateUrl: "./components/util/trsPagenationConfig/trsPagenationConfigRight.html",
        scope: {
            callback: "&",
            currpage: "=",
            page: "="
        },
        link: function(scope, iElement, iAttrs) {
            scope.jumpToPage = function(ev) {
                if (angular.isDefined(ev) && ev.keyCode !== 13) return; //回车触发
                if (angular.isDefined(scope.page) && (scope.page.PAGECOUNT>1||scope.page.pageCount>1)) {//兼容page对象改变的情况
                    scope.currpage = parseInt(scope.currpage) === 0 ? 1 : Math.abs(scope.currpage); //解决当前页不合规范的情况（负数或者为0的情况）
                    $timeout(function() {
                        scope.callback();
                    });
                }
            };
        }
    };
}]);
